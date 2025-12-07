import axios from 'axios'

async function main() {
  const base = process.env.API_BASE || 'http://localhost:8000/api'
  const endpoints = {
    health: `${base}/hf/spaces/amin/health`,
    help: `${base}/hf/spaces/amin/help`,
    downloadReadme: `${base}/hf/spaces/amin/download?path=README.md`
  }
  try {
    const health = await axios.get(endpoints.health, { timeout: 15000 })
    console.log('Space health:', health.data)
  } catch (e: any) {
    console.error('Health check failed:', e?.message)
  }
  try {
    const help = await axios.get(endpoints.help, { timeout: 15000 })
    const preview = (help.data as string).slice(0, 300)
    console.log('Help preview:', preview)
  } catch (e: any) {
    console.error('Help fetch failed:', e?.message)
  }
  try {
    const dl = await axios.get(endpoints.downloadReadme, { timeout: 15000, responseType: 'text' })
    console.log('README download status:', dl.status, 'length:', (dl.data as string)?.length)
  } catch (e: any) {
    console.error('README download failed:', e?.message)
  }
}

main().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
