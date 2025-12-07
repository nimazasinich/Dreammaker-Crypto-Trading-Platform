import { load } from 'cheerio'
import { fetchSupervisor } from '../observability/fetchSupervisor.js'

type DownloadResult = { ok: boolean; contentType?: string; data?: any; status?: number; source?: 'runtime' | 'repo'; error?: string }
type HealthResult = { runtime: { ok: boolean; status: number }; repo: { ok: boolean; status: number } }
type FileTreeItem = { type: 'file' | 'directory'; path: string; size?: number }

export class HFAminSpaceProvider {
  private static instance: HFAminSpaceProvider
  private readonly runtimeUrl: string
  private readonly repoUrl: string

  private constructor() {
    // Updated to use the new Datasourceforcryptocurrency-2 Space
    this.runtimeUrl = process.env.HF_AMIN_SPACE_RUNTIME_URL || 'https://really-amin-datasourceforcryptocurrency-2.hf.space'
    this.repoUrl = process.env.HF_AMIN_SPACE_REPO_URL || 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2'
  }

  static getInstance(): HFAminSpaceProvider {
    if (!HFAminSpaceProvider.instance) {
      HFAminSpaceProvider.instance = new HFAminSpaceProvider()
    }
    return HFAminSpaceProvider.instance
  }

  async getHelp(): Promise<{ ok: boolean; text?: string; status?: number; source?: 'repo'; error?: string }> {
    try {
      // Try raw README first
      const rawUrl = `${this.repoUrl}/resolve/main/README.md`
      const rawResp = await fetchSupervisor.get(rawUrl, { timeout: 20000, validateStatus: () => true })
      if (rawResp.status >= 200 && rawResp.status < 300 && typeof rawResp.data === 'string') {
        return { ok: true, text: rawResp.data, status: rawResp.status, source: 'repo' }
      }
      // Fallback: fetch HTML page and extract article text
      const htmlResp = await fetchSupervisor.get(this.repoUrl, { timeout: 20000, validateStatus: () => true })
      if (typeof htmlResp.data === 'string') {
        const $ = load(htmlResp.data)
        const articleText = $('article').text().trim() || $('main').text().trim()
        if (articleText) return { ok: true, text: articleText, status: htmlResp.status, source: 'repo' }
      }
      return { ok: false, status: rawResp.status, error: 'Help page not found or empty' }
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Failed to fetch help' }
    }
  }

  async health(): Promise<HealthResult> {
    const runtime = await fetchSupervisor.get(this.runtimeUrl, { timeout: 15000, validateStatus: () => true }).catch(err => ({ status: 0 }))
    const repo = await fetchSupervisor.get(this.repoUrl, { timeout: 15000, validateStatus: () => true }).catch(err => ({ status: 0 }))
    const runtimeStatus = (runtime as any)?.status ?? 0
    const repoStatus = (repo as any)?.status ?? 0
    return {
      runtime: { ok: runtimeStatus >= 200 && runtimeStatus < 500, status: runtimeStatus },
      repo: { ok: repoStatus >= 200 && repoStatus < 500, status: repoStatus }
    }
  }

  async download(path: string): Promise<DownloadResult> {
    try {
      const url = `${this.runtimeUrl}/${path.replace(/^\//, '')}`
      const resp = await fetchSupervisor.get(url, { timeout: 20000, responseType: 'arraybuffer', validateStatus: () => true })
      if (resp.status >= 200 && resp.status < 300) {
        return { ok: true, contentType: resp.headers['content-type'], data: resp.data, status: resp.status, source: 'runtime' }
      }
      // Fallback to repo raw
      const rawUrl = `${this.repoUrl}/resolve/main/${path.replace(/^\//, '')}`
      const token = process.env.HF_TOKEN
      const rawResp = await fetchSupervisor.get(rawUrl, {
        timeout: 20000,
        responseType: 'arraybuffer',
        validateStatus: () => true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      if (rawResp.status >= 200 && rawResp.status < 300) {
        return { ok: true, contentType: rawResp.headers['content-type'], data: rawResp.data, status: rawResp.status, source: 'repo' }
      }
      return { ok: false, status: resp.status, error: `Not found at ${url}` }
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Download failed' }
    }
  }

  async upload(path: string, fileBuffer: Buffer, contentType?: string): Promise<{ ok: boolean; status?: number; error?: string }> {
    // Upload requires a runtime endpoint or Hub token; implement runtime proxy first
    try {
      const url = `${this.runtimeUrl}/upload`
      const boundary = '----hfspaceformboundary' + Math.random().toString(16).slice(2)
      const bodyParts = [
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${encodeURIComponent(path)}"\r\nContent-Type: ${contentType || 'application/octet-stream'}\r\n\r\n`,
        fileBuffer,
        `\r\n--${boundary}--\r\n`
      ]
      const data = Buffer.concat(bodyParts.map(p => (typeof p === 'string' ? Buffer.from(p) : p)))
      const resp = await fetchSupervisor.post(url, data, {
        timeout: 30000,
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        validateStatus: () => true
      })
      if (resp.status >= 200 && resp.status < 300) {
        return { ok: true, status: resp.status }
      }
      return { ok: false, status: resp.status, error: 'Runtime upload endpoint not available or failed' }
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Upload failed (runtime)' }
    }
  }

  async listFiles(recursive: boolean = true): Promise<{ ok: boolean; files?: FileTreeItem[]; status?: number; error?: string }> {
    try {
      const repoId = this.repoUrl.replace('https://huggingface.co/spaces/', '')
      const treeUrl = `https://huggingface.co/api/spaces/${repoId}/tree/main?recursive=${recursive ? 1 : 0}`
      const token = process.env.HF_TOKEN
      const resp = await fetchSupervisor.get(treeUrl, {
        timeout: 20000,
        validateStatus: () => true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      if (resp.status >= 200 && resp.status < 300 && Array.isArray(resp.data)) {
        const files: FileTreeItem[] = resp.data.map((it: any) => ({ type: it.type, path: it.path, size: it?.size }))
        return { ok: true, files, status: resp.status }
      }
      // Fallback: parse HTML directory listing
      const htmlResp = await fetchSupervisor.get(this.repoUrl, { timeout: 20000, validateStatus: () => true })
      if (typeof htmlResp.data === 'string') {
        const $ = load(htmlResp.data)
        const files: FileTreeItem[] = []
        $('a[href*="/blob/"]').each((_, el) => {
          const href = $(el).attr('href') || ''
          const m = href.match(/\/blob\/[^/]+\/(.*)$/)
          if (m && m[1]) files.push({ type: 'file', path: m[1] })
        })
        if (files.length > 0) return { ok: true, files, status: htmlResp.status }
      }
      return { ok: false, status: resp.status, error: 'File list not available' }
    } catch (error: any) {
      return { ok: false, error: error?.message || 'List files failed' }
    }
  }
}

export default HFAminSpaceProvider
