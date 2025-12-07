import express from 'express'
import { getBatch, setConfig, getConfig, clearBuffer } from '../observability/requestStream.js'

const router = express.Router()

router.get('/requests', (req, res) => {
  const { intervalMs, batchSize } = getConfig()
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()
  const send = () => {
    const data = getBatch(batchSize)
    res.write(`data: ${JSON.stringify({ ts: Date.now(), data })}\n\n`)
  }
  const timer = setInterval(send, intervalMs)
  send()
  req.on('close', () => {
    clearInterval(timer)
  })
})

router.post('/control', (req, res) => {
  const { intervalMs, batchSize, maxBuffer, clear } = req.body || {}
  setConfig({ intervalMs, batchSize, maxBuffer })
  if (clear) clearBuffer()
  res.json({ ok: true, config: getConfig() })
})

export default router
