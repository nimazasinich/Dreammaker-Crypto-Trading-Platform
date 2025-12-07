export type RequestEvent = { ts: number; method: string; url: string; ua?: string }

let buffer: RequestEvent[] = []
let config = { intervalMs: 1000, batchSize: 50, maxBuffer: 1000 }

export function pushRequest(ev: RequestEvent) {
  buffer.push(ev)
  if (buffer.length > config.maxBuffer) buffer = buffer.slice(buffer.length - config.maxBuffer)
}

export function getBatch(limit: number): RequestEvent[] {
  const n = Math.min(limit, buffer.length)
  return buffer.slice(buffer.length - n)
}

export function clearBuffer() {
  buffer = []
}

export function setConfig(next: Partial<typeof config>) {
  config = { ...config, ...next }
}

export function getConfig() {
  return config
}
