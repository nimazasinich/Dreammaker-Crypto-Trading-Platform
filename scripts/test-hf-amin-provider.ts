import HFAminSpaceProvider from '../src/services/HFAminSpaceProvider'

async function main() {
  const provider = HFAminSpaceProvider.getInstance()
  console.log('Runtime URL:', process.env.HF_AMIN_SPACE_RUNTIME_URL || '(default)')
  console.log('Repo URL:', process.env.HF_AMIN_SPACE_REPO_URL || '(default)')

  const health = await provider.health()
  console.log('Health:', health)

  const help = await provider.getHelp()
  console.log('Help ok:', help.ok, 'status:', help.status, 'length:', (help.text || '').length)

  const files = await provider.listFiles(true)
  console.log('Files ok:', files.ok, 'count:', (files.files || []).length, 'status:', files.status)

  const dl = await provider.download('README.md')
  console.log('Download ok:', dl.ok, 'status:', dl.status, 'contentType:', dl.contentType, 'bytes:', dl.data ? (dl.data as Buffer).byteLength : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
