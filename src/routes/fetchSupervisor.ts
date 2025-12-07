import express from 'express'
import { fetchSupervisor } from '../observability/fetchSupervisor.js'

const router = express.Router()

router.get('/summary', (req, res) => {
  res.json({ success: true, data: fetchSupervisor.summary(), logs: fetchSupervisor.logs() })
})

router.post('/config', (req, res) => {
  const { ratePerSecond = 2, cache = true } = req.body || {}
  fetchSupervisor.setRate(Number(ratePerSecond))
  fetchSupervisor.enableCache(Boolean(cache))
  res.json({ success: true })
})

router.post('/reset', (req, res) => {
  fetchSupervisor.clearLogs()
  fetchSupervisor.clearCache()
  res.json({ success: true })
})

export default router
