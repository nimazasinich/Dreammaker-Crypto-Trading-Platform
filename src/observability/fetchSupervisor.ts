import axios, { AxiosRequestConfig } from 'axios'

type LogItem = { ts: number; method: string; url: string; status?: number; err?: string }
type Summary = { requests: number; success: number; failed: number; rateLimited: number; lastWindowStart: number }

let ratePerSecond = 2
let windowTs = 0
let windowCount = 0
let requests = 0
let success = 0
let failed = 0
let rateLimited = 0
const logs: LogItem[] = []
const cache = new Map<string, any>()

function key(method: string, url: string, body?: any) {
  return `${method}:${url}:${body ? JSON.stringify(body) : ''}`
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function throttle() {
  const now = Date.now()
  if (now - windowTs > 1000) {
    windowTs = now
    windowCount = 0
  }
  if (windowCount >= ratePerSecond) {
    const sleepMs = 1000 - (now - windowTs)
    if (sleepMs > 0) await wait(sleepMs)
    windowTs = Date.now()
    windowCount = 0
  }
  windowCount++
}

async function run(method: 'GET' | 'POST', url: string, opts: AxiosRequestConfig = {}, body?: any) {
  await throttle()
  requests++
  const k = key(method, url, body)
  if (opts?.params && !body) {
    const ck = key(method, url + JSON.stringify(opts.params))
    if (cache.has(ck)) return cache.get(ck)
  }
  if (cache.has(k)) return cache.get(k)
  let attempt = 0
  let backoff = 500
  while (attempt < 3) {
    try {
      const cfg: AxiosRequestConfig = { ...opts }
      let resp
      if (method === 'GET') resp = await axios.get(url, cfg)
      else resp = await axios.post(url, body, cfg)
      logs.push({ ts: Date.now(), method, url, status: resp.status })
      if (resp.status === 429) {
        rateLimited++
        attempt++
        await wait(backoff)
        backoff = Math.min(backoff * 2, 4000)
        continue
      }
      success++
      const data = { status: resp.status, headers: resp.headers, data: resp.data }
      cache.set(k, data)
      return data
    } catch (e: any) {
      const msg = e?.message || 'request failed'
      logs.push({ ts: Date.now(), method, url, err: msg })
      const status = e?.response?.status
      if (status === 429 || msg.includes('timeout')) {
        rateLimited++
        attempt++
        await wait(backoff)
        backoff = Math.min(backoff * 2, 4000)
        continue
      }
      failed++
      throw e
    }
  }
  failed++
  throw new Error('rate limit exceeded after retries')
}

export const fetchSupervisor = {
  setRate(rps: number) { ratePerSecond = Math.max(1, rps) },
  enableCache(enable: boolean) { if (!enable) cache.clear() },
  clearLogs() { logs.length = 0 },
  clearCache() { cache.clear() },
  summary(): Summary { return { requests, success, failed, rateLimited, lastWindowStart: windowTs } },
  logs(): LogItem[] { return logs.slice(-500) },
  async get(url: string, opts: AxiosRequestConfig = {}) { return run('GET', url, opts) },
  async post(url: string, body: any, opts: AxiosRequestConfig = {}) { return run('POST', url, opts, body) }
}
