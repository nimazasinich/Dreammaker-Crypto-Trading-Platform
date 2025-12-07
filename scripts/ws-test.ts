import WebSocket from 'ws'

const url = process.env.WS_URL || 'ws://localhost:8001/ws'
const ws = new WebSocket(url)

ws.on('open', () => {
  console.log('WS connected to', url)
})

ws.on('message', (data) => {
  console.log('WS message:', data.toString())
})

ws.on('error', (err) => {
  console.error('WS error:', err.message)
})

ws.on('close', () => {
  console.log('WS closed')
})
