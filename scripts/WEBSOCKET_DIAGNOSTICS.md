# WebSocket Diagnostic Tool

A standalone Node.js script to test WebSocket backend stability independently from the React frontend.

## Quick Start

### 1. Basic Test (30 seconds, single connection)
```bash
npm run test:ws
```

### 2. Stress Test (10 simultaneous connections)
```bash
npm run test:ws:stress
```

### 3. Long-Duration Test (2 minutes)
```bash
npm run test:ws:long
```

### 4. Custom Test
```bash
node scripts/test-websocket.js --url ws://localhost:8001/ws --duration 60000
```

---

## What It Tests

### ✅ Connection Lifecycle
- Time to establish connection
- Connection stability over time
- Proper close handshake vs abnormal closure

### ✅ Message Handling
- Time to first message after connection
- Total messages received
- Message parsing and type identification

### ✅ Keep-Alive (Heartbeat)
- Ping/Pong mechanism
- Server responsiveness
- Connection timeout detection

### ✅ Error Detection
- Protocol errors
- Abnormal closures (code 1006)
- Message parsing failures

---

## Understanding the Output

### Connection Status
```
[Connection 1] 🔌 Connecting to ws://localhost:8001/ws...
[Connection 1] ✅ Connected successfully in 23ms
[Connection 1] 📨 First message received in 105ms after connection
```

**Good signs:**
- Connection established quickly (< 500ms)
- First message within ~100-200ms
- No immediate closure

### Message Flow
```
[Connection 1] 📬 Message #1: type="connected"
[Connection 1]    ↳ Status: connected
[Connection 1] 📬 Message #2: type="price"
[Connection 1]    ↳ BTCUSDT: $96234.56
```

**Good signs:**
- Regular message flow
- Increasing message count
- Proper message types (connected, price, etc.)

### Heartbeat
```
[Connection 1] 💓 Ping sent (1)
[Connection 1] 💚 Pong received (1)
```

**Good signs:**
- Pongs match pings (1:1 ratio)
- No missing pongs
- Consistent 5-second intervals

### Close Codes
```
[Connection 1] 🔌 Connection closed
[Connection 1]    ↳ Code: 1000 (Normal Closure)
[Connection 1]    ↳ Expected: YES
```

**Good:** Code 1000 (Normal Closure)  
**Bad:** Code 1006 (Abnormal Closure) - indicates unexpected disconnect

---

## Health Assessment

### ✅ Healthy Backend
```
✅ RESULT: WebSocket backend is HEALTHY
   - All connections established successfully
   - No abnormal closures detected
   - Messages received correctly
   - No errors during test
```

Exit code: `0`

### ⚠️ Unhealthy Backend
```
⚠️  RESULT: WebSocket backend has ISSUES
   ❌ 2 abnormal closure(s) detected (code 1006)
   ❌ No messages received from server
```

Exit code: `1`

---

## Common Issues & Solutions

### Issue: Code 1006 (Abnormal Closure) immediately after connection

**Symptoms:**
```
[Connection 1] ✅ Connected successfully in 23ms
[Connection 1] 🔌 Connection closed
[Connection 1]    ↳ Code: 1006 (Abnormal Closure)
[Connection 1]    ↳ Expected: NO - ABNORMAL CLOSURE
```

**Possible causes:**
1. Server sends message before client handlers ready → Add delay in server
2. Multiple simultaneous connections → Use centralized WebSocket manager
3. Server crash or error during connection → Check backend logs
4. Firewall/proxy interference → Test locally without proxies

**Solutions:**
- ✅ Delay server's initial message by 100ms (already implemented)
- ✅ Use centralized WebSocketManager (already implemented)
- Check backend terminal for errors at exact timestamp
- Verify no port conflicts or firewall blocks

---

### Issue: No messages received

**Symptoms:**
```
📈 Overall Statistics:
  Total messages received: 0
```

**Possible causes:**
1. Server not broadcasting data
2. Message routing issue
3. Client not subscribed to correct topics

**Solutions:**
- Check backend logs for broadcast activity
- Verify message types match expected format
- Test backend broadcast logic separately

---

### Issue: Missing pongs (keep-alive failure)

**Symptoms:**
```
Pings/Pongs: 6/2
```

**Possible causes:**
1. Server doesn't handle ping frames
2. Network drops ping/pong frames
3. Server under heavy load

**Solutions:**
- Implement server-side ping handler
- Use application-level heartbeat (JSON messages)
- Check server CPU/memory usage

---

## Command Line Options

```bash
node scripts/test-websocket.js [options]

Options:
  --url <url>           WebSocket URL
                        Default: ws://localhost:8001/ws
                        Example: ws://192.168.1.100:8001/ws

  --duration <ms>       Test duration in milliseconds
                        Default: 30000 (30 seconds)
                        Example: 120000 (2 minutes)

  --stress              Enable stress test mode
                        Opens multiple simultaneous connections

  --connections <n>     Number of connections (stress mode only)
                        Default: 5
                        Example: 10
```

### Examples

**Test remote server:**
```bash
node scripts/test-websocket.js --url ws://192.168.1.100:8001/ws
```

**Quick 10-second test:**
```bash
node scripts/test-websocket.js --duration 10000
```

**Heavy stress test (20 connections, 2 minutes):**
```bash
node scripts/test-websocket.js --stress --connections 20 --duration 120000
```

---

## Integration with CI/CD

Use exit codes for automated testing:

```bash
# Test passes if WebSocket is healthy
npm run test:ws && echo "WebSocket OK" || echo "WebSocket FAILED"

# Run before deployment
npm run test:ws:stress || exit 1
```

---

## Troubleshooting Tips

### 1. Backend Not Running
```
Error: connect ECONNREFUSED 127.0.0.1:8001
```
→ Start backend: `npm run dev:server:real`

### 2. Port Conflict
```
Error: listen EADDRINUSE: address already in use :::8001
```
→ Kill conflicting process: `npm run dev:kill`

### 3. Firewall Issues
```
Error: connect ETIMEDOUT
```
→ Check firewall, try localhost instead of IP

### 4. SSL/TLS Issues (wss://)
```
Error: unable to verify the first certificate
```
→ Use `ws://` for local testing, not `wss://`

---

## Next Steps After Testing

### If test passes ✅
1. Verify frontend WebSocket connection
2. Test real-time data flow in UI
3. Run multi-tab stress test
4. Monitor long-term stability (hours)

### If test fails ❌
1. Check backend server logs
2. Verify server is running on correct port
3. Test backend independently (curl, Postman)
4. Review server WebSocket handler code
5. Check for resource limits (connections, memory)

---

## Related Documentation

- Backend WebSocket Implementation: `src/server.ts` (line ~3640+)
- Frontend WebSocket Manager: `src/services/WebSocketManager.ts`
- Frontend Hook: `src/hooks/useWebSocket.ts`
- Health Check Script: `scripts/health-check.mjs`

