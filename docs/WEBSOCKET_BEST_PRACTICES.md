# WebSocket Architecture Best Practices

A curated collection of production-grade WebSocket patterns and anti-patterns, backed by industry documentation and real-world experience.

---

## 🎯 Core Principles

### 1. Single Shared Connection (Connection Multiplexing)

**Problem:** Multiple components creating individual WebSocket connections causes:
- Resource exhaustion on server
- Port conflicts and connection limits
- Race conditions and unpredictable behavior
- Increased latency and overhead

**Solution:** Use a centralized WebSocket manager/client that:
- Maintains one connection for entire application
- Multiplexes messages to subscribers via topics/channels
- Handles reconnection logic globally

**References:**
- [Ably: WebSocket Architecture Best Practices](https://ably.com/topic/websocket-architecture-best-practices)
- [PubNub: WebSocket Connection Management](https://www.pubnub.com/guides/websocket-connection-management/)
- [Stack Overflow: Multiple WebSocket Connections vs Single Connection](https://stackoverflow.com/questions/24543254/when-should-i-use-multiple-websocket-connections)

**Implementation Example:**
```typescript
// ❌ BAD - Each component creates its own connection
const MyComponent = () => {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8001/ws');
    // ... handlers
  }, []);
};

// ✅ GOOD - Shared connection via manager
const MyComponent = () => {
  const { data, isConnected } = useWebSocket({
    topic: 'price_updates',
    enabled: true
  });
};
```

---

### 2. Proper Handshake Timing (Avoid Race Conditions)

**Problem:** Server sends messages before client handlers are attached, causing:
- Lost messages
- Abnormal closure (code 1006)
- Client state inconsistency

**Solution:** 
- Delay server's initial message by 100-200ms after connection
- Or wait for explicit "ready" message from client

**References:**
- [Stack Overflow: WebSocket 1006 Abnormal Closure](https://stackoverflow.com/questions/19304157/getting-the-reason-why-websockets-closed-with-close-code-1006)
- [GitHub ws library: Issue #1520](https://github.com/websockets/ws/issues/1520)

**Implementation Example:**
```typescript
// ❌ BAD - Immediate send
wsServer.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected' })); // May fail!
});

// ✅ GOOD - Delayed send
wsServer.on('connection', (ws) => {
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'connected' }));
    }
  }, 100);
});

// ✅ BETTER - Wait for client ready signal
wsServer.on('connection', (ws) => {
  ws.once('message', (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.type === 'client_ready') {
      ws.send(JSON.stringify({ type: 'connected' }));
    }
  });
});
```

---

### 3. Keep-Alive / Heartbeat (Prevent Idle Timeouts)

**Problem:** Proxies, firewalls, and load balancers drop idle connections after 30-120 seconds, causing:
- Unexpected disconnections
- Silent failures (client thinks connected)
- Code 1006 closures

**Solution:** Implement bidirectional heartbeat:
- Client sends ping every 30 seconds
- Server responds with pong
- Close connection if pong not received within timeout

**References:**
- [MDN: WebSocket Ping/Pong Frames](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#pings_and_pongs_the_heartbeat_of_websockets)
- [Pusher: What is Error 1006?](https://docs.bird.com/pusher/channels/channels/troubleshooting/what-is-meant-by-channels-error-1006)
- [AWS: Best Practices for WebSocket APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api.html)

**Implementation Example:**
```typescript
// Client-side
const pingInterval = setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.ping(); // Protocol-level ping
  }
}, 30000);

// Server-side
ws.on('ping', (data) => {
  ws.pong(data); // Echo back
});

// Or application-level heartbeat
const heartbeat = setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'heartbeat', ts: Date.now() }));
  }
}, 30000);
```

---

### 4. Exponential Backoff for Reconnection

**Problem:** Aggressive reconnection causes:
- Server overload during outages
- Connection storms (thundering herd)
- Client battery drain

**Solution:** Exponential backoff with jitter:
- Start with 1 second delay
- Double delay each attempt (up to max 60s)
- Add random jitter (±20%) to desynchronize clients

**References:**
- [Google Cloud: Exponential Backoff](https://cloud.google.com/iot/docs/how-tos/exponential-backoff)
- [AWS Architecture: Retry Strategies](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)

**Implementation Example:**
```typescript
let reconnectDelay = 1000; // Start at 1 second
const maxDelay = 60000; // Max 60 seconds

const reconnect = () => {
  const jitter = Math.random() * 0.4 - 0.2; // ±20%
  const delay = reconnectDelay * (1 + jitter);
  
  setTimeout(() => {
    ws = new WebSocket(url);
    reconnectDelay = Math.min(reconnectDelay * 2, maxDelay);
  }, delay);
};

ws.on('close', () => {
  reconnect();
});

ws.on('open', () => {
  reconnectDelay = 1000; // Reset on success
});
```

---

### 5. Proper Error Handling & Close Codes

**Problem:** Unclear error states make debugging impossible

**Solution:** Use standard WebSocket close codes and log properly:
- 1000: Normal closure (expected)
- 1001: Going away (page unload)
- 1006: Abnormal closure (investigate!)
- 1008: Policy violation (auth failure)
- 1011: Server error (backend issue)

**References:**
- [MDN: CloseEvent Codes](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code)
- [RFC 6455: WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455#section-7.4)

**Implementation Example:**
```typescript
ws.on('close', (code, reason) => {
  const reasons = {
    1000: 'Normal closure',
    1001: 'Going away',
    1006: 'Abnormal closure - investigate!',
    1008: 'Policy violation',
    1011: 'Internal error'
  };
  
  logger.warn('WebSocket closed', {
    code,
    meaning: reasons[code] || 'Unknown',
    reason: reason.toString(),
    shouldReconnect: code !== 1000 && code !== 1001
  });
  
  if (code === 1006) {
    // Abnormal - check for network issues, server crashes
    logger.error('Abnormal WebSocket closure detected!');
  }
});
```

---

## 🚫 Common Anti-Patterns to Avoid

### 1. Creating WebSocket in React Component Body
```typescript
// ❌ BAD - Creates new connection on every render!
const MyComponent = () => {
  const ws = new WebSocket('ws://localhost:8001/ws');
  return <div>...</div>;
};
```

### 2. No Cleanup in useEffect
```typescript
// ❌ BAD - Memory leak, dangling connections
useEffect(() => {
  const ws = new WebSocket(url);
  // Missing: return () => ws.close();
}, []);

// ✅ GOOD
useEffect(() => {
  const ws = new WebSocket(url);
  return () => ws.close(); // Cleanup
}, []);
```

### 3. Ignoring readyState
```typescript
// ❌ BAD - May throw if connection closed
ws.send(JSON.stringify(data));

// ✅ GOOD
if (ws.readyState === WebSocket.OPEN) {
  ws.send(JSON.stringify(data));
} else {
  // Queue message or notify user
}
```

### 4. Infinite Reconnection Loop
```typescript
// ❌ BAD - Reconnects forever even if server permanently down
ws.on('close', () => {
  setTimeout(() => connect(), 1000); // Infinite!
});

// ✅ GOOD - Max attempts with backoff
let attempts = 0;
const maxAttempts = 10;

ws.on('close', () => {
  if (attempts < maxAttempts) {
    attempts++;
    setTimeout(() => connect(), 1000 * attempts);
  } else {
    notifyUser('Connection failed permanently');
  }
});
```

### 5. Large Binary Messages Without Compression
```typescript
// ❌ BAD - Sending large JSON as text
ws.send(JSON.stringify(largeObject));

// ✅ GOOD - Compress large payloads
import pako from 'pako';
const compressed = pako.deflate(JSON.stringify(largeObject));
ws.send(compressed);
```

---

## 📊 Production Monitoring & Health Checks

### Key Metrics to Track

1. **Connection Lifetime**
   - Average uptime before disconnect
   - Percentage of abnormal closures (1006)
   - Target: > 95% normal closures

2. **Message Latency**
   - Time from server send to client receive
   - Target: < 100ms for local, < 500ms for global

3. **Reconnection Rate**
   - Reconnections per hour
   - Target: < 1 per client per hour

4. **Resource Usage**
   - Server: Connections count, memory per connection
   - Client: Memory usage, CPU during message processing

### Health Check Implementation

```typescript
// Client-side connection health
class WebSocketHealth {
  private lastPong: number = Date.now();
  private missedPongs: number = 0;
  
  startMonitoring() {
    // Send ping every 30s
    setInterval(() => {
      this.ws.ping();
      
      // Check if last pong was recent
      if (Date.now() - this.lastPong > 45000) {
        this.missedPongs++;
        if (this.missedPongs > 2) {
          // Connection is stale, force reconnect
          this.ws.close();
        }
      }
    }, 30000);
  }
  
  onPong() {
    this.lastPong = Date.now();
    this.missedPongs = 0;
  }
}
```

---

## 🔗 Additional Resources

### Official Documentation
- [MDN: WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [RFC 6455: WebSocket Protocol Specification](https://datatracker.ietf.org/doc/html/rfc6455)
- [WHATWG: WebSocket Standard](https://websockets.spec.whatwg.org/)

### Library Documentation
- [ws (Node.js WebSocket library)](https://github.com/websockets/ws)
- [Socket.IO (High-level WebSocket abstraction)](https://socket.io/docs/v4/)

### Architecture Guides
- [Ably: WebSocket Architecture Best Practices](https://ably.com/topic/websocket-architecture-best-practices)
- [PubNub: Real-Time Messaging Best Practices](https://www.pubnub.com/docs/general/messages/best-practices)
- [AWS: WebSocket API Best Practices](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api.html)

### Troubleshooting
- [Stack Overflow: WebSocket Common Issues](https://stackoverflow.com/questions/tagged/websocket?tab=Votes)
- [Pusher: Channels Error 1006 Explained](https://docs.bird.com/pusher/channels/channels/troubleshooting/what-is-meant-by-channels-error-1006)
- [Chrome DevTools: WebSocket Debugging](https://developer.chrome.com/docs/devtools/network/websockets/)

### Performance & Scaling
- [Socket.IO: Scaling to Multiple Nodes](https://socket.io/docs/v4/using-multiple-nodes/)
- [Redis Pub/Sub for WebSocket Broadcasting](https://redis.io/docs/manual/pubsub/)
- [NGINX: WebSocket Proxying](https://nginx.org/en/docs/http/websocket.html)

---

## ✅ Checklist for Production-Ready WebSocket Implementation

- [ ] Single shared connection (centralized manager)
- [ ] Exponential backoff reconnection with jitter
- [ ] Protocol-level ping/pong keep-alive
- [ ] Application-level heartbeat (optional, for monitoring)
- [ ] Proper close code handling and logging
- [ ] Message queuing during disconnection
- [ ] Client readyState checks before sending
- [ ] Server delay before initial message
- [ ] Cleanup in React useEffect/component unmount
- [ ] Connection timeout detection
- [ ] Max reconnection attempts limit
- [ ] User-visible connection status indicator
- [ ] Graceful degradation when WebSocket unavailable
- [ ] Compression for large messages
- [ ] Authentication/authorization on connection
- [ ] Rate limiting on server side
- [ ] Monitoring and alerting for abnormal closures
- [ ] Load testing with concurrent connections
- [ ] Documentation for troubleshooting

---

**Last Updated:** December 2025

**Related Files:**
- Implementation: `src/services/WebSocketManager.ts`
- Hook: `src/hooks/useWebSocket.ts`
- Backend: `src/server.ts` (WebSocket handler)
- Diagnostic Tool: `scripts/test-websocket.js`

