import fs from 'fs'
import path from 'path'

function exists(p) {
  try {
    return fs.existsSync(p)
  } catch {
    return false
  }
}

function normalizeWin(p) {
  return path.normalize(p)
}

function validateConfig(config) {
  const projectRoot = normalizeWin(config.project_root)
  const result = { valid: true, warnings: [], config }

  config.servers = (config.servers || []).map(server => {
    const s = { ...server }
    // normalize args
    if (Array.isArray(s.args)) {
      s.args = s.args.map(a => {
        if (typeof a === 'string' && a.toLowerCase().startsWith(projectRoot.toLowerCase())) {
          const np = normalizeWin(a)
          if (!exists(np)) {
            result.valid = false
            result.warnings.push(`Path not found: ${np}`)
          }
          return np
        }
        return a
      })
    }
    // normalize env paths
    if (s.env) {
      Object.keys(s.env).forEach(key => {
        const v = s.env[key]
        if (typeof v === 'string' && v.toLowerCase().includes('%localappdata%')) {
          result.warnings.push(`Env var ${key} uses %LOCALAPPDATA%: ${v}. Ensure Trae resolves it.`)
        } else if (typeof v === 'string' && v.toLowerCase().startsWith(projectRoot.toLowerCase())) {
          const np = normalizeWin(v)
          if (!exists(np)) {
            result.valid = false
            result.warnings.push(`Env path not found: ${np}`)
          }
          s.env[key] = np
        }
      })
    }
    return s
  })

  return result
}

// usage
const templatePath = path.join(process.cwd(), 'mcp', 'trae.mcp.json')
const raw = fs.readFileSync(templatePath, 'utf-8')
const config = JSON.parse(raw)
const res = validateConfig(config)
if (!res.valid) {
  console.log('Validation failed. Warnings:')
  console.log(res.warnings.join('\n'))
} else {
  console.log('Config seems OK.')
}
const out = JSON.stringify(res.config, null, 2)
const outPath = path.join(process.cwd(), 'mcp', 'trae.mcp.fixed.json')
fs.writeFileSync(outPath, out)
console.log('Fixed config written to', outPath)
