/**
 * WebSocket Diagnostic Test Script
 * 
 * Standalone tool to verify backend WebSocket stability without React/frontend complexity.
 * Tests connection lifecycle, message handling, keep-alive, and stress scenarios.
 * 
 * Usage:
 *   node scripts/test-websocket.js [options]
 * 
 * Options:
 *   --url <url>       WebSocket URL (default: ws://localhost:8001/ws)
 *   --duration <ms>   Test duration in milliseconds (default: 30000)
 *   --stress          Enable stress test (multiple connections)
 *   --connections <n> Number of connections for stress test (default: 5)
 */

import WebSocket from 'ws';
import { performance } from 'perf_hooks';

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  url: 'ws://localhost:8001/ws',
  duration: 30000, // 30 seconds
  stress: false,
  connections: 5
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    config.url = args[i + 1];
    i++;
  } else if (args[i] === '--duration' && args[i + 1]) {
    config.duration = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--stress') {
    config.stress = true;
  } else if (args[i] === '--connections' && args[i + 1]) {
    config.connections = parseInt(args[i + 1], 10);
    i++;
  }
}

// Test metrics
class ConnectionMetrics {
  constructor(id) {
    this.id = id;
    this.connectionTime = null;
    this.firstMessageTime = null;
    this.messageCount = 0;
    this.errorCount = 0;
    this.closeTime = null;
    this.closeCode = null;
    this.closeReason = null;
    this.pingCount = 0;
    this.pongCount = 0;
  }

  getReport() {
    const uptime = this.closeTime ? this.closeTime - this.connectionTime : performance.now() - this.connectionTime;
    const timeToFirstMessage = this.firstMessageTime ? this.firstMessageTime - this.connectionTime : null;
    
    return {
      id: this.id,
      uptime: `${Math.round(uptime)}ms`,
      timeToFirstMessage: timeToFirstMessage ? `${Math.round(timeToFirstMessage)}ms` : 'N/A',
      messagesReceived: this.messageCount,
      errors: this.errorCount,
      pingsSent: this.pingCount,
      pongsReceived: this.pongCount,
      closeCode: this.closeCode,
      closeReason: this.closeReason || 'N/A'
    };
  }
}

// Test a single WebSocket connection
function testConnection(id, duration) {
  return new Promise((resolve) => {
    const metrics = new ConnectionMetrics(id);
    const startTime = performance.now();
    
    console.log(`\n[Connection ${id}] 🔌 Connecting to ${config.url}...`);
    
    const ws = new WebSocket(config.url);
    let isOpen = false;
    let pingInterval = null;

    ws.on('open', () => {
      metrics.connectionTime = performance.now();
      isOpen = true;
      const connectTime = Math.round(metrics.connectionTime - startTime);
      console.log(`[Connection ${id}] ✅ Connected successfully in ${connectTime}ms`);

      // Start ping/pong heartbeat
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            metrics.pingCount++;
            ws.ping();
            console.log(`[Connection ${id}] 💓 Ping sent (${metrics.pingCount})`);
          } catch (error) {
            console.error(`[Connection ${id}] ❌ Failed to send ping:`, error.message);
            metrics.errorCount++;
          }
        }
      }, 5000); // Ping every 5 seconds

      // Send a test subscription message
      try {
        ws.send(JSON.stringify({
          type: 'subscribe',
          topic: 'test_diagnostics',
          timestamp: Date.now()
        }));
        console.log(`[Connection ${id}] 📤 Sent subscription message`);
      } catch (error) {
        console.error(`[Connection ${id}] ❌ Failed to send message:`, error.message);
        metrics.errorCount++;
      }
    });

    ws.on('message', (data) => {
      if (!metrics.firstMessageTime) {
        metrics.firstMessageTime = performance.now();
        const timeToFirst = Math.round(metrics.firstMessageTime - metrics.connectionTime);
        console.log(`[Connection ${id}] 📨 First message received in ${timeToFirst}ms after connection`);
      }
      
      metrics.messageCount++;
      
      try {
        const message = JSON.parse(data.toString());
        console.log(`[Connection ${id}] 📬 Message #${metrics.messageCount}: type="${message.type}"`);
        
        // Log message details for important types
        if (message.type === 'connected') {
          console.log(`[Connection ${id}]    ↳ Status: ${message.status}`);
        } else if (message.type === 'price') {
          console.log(`[Connection ${id}]    ↳ ${message.symbol}: $${message.price?.toFixed(2)}`);
        }
      } catch (error) {
        console.log(`[Connection ${id}] 📬 Message #${metrics.messageCount}: [Binary or non-JSON]`);
      }
    });

    ws.on('pong', () => {
      metrics.pongCount++;
      console.log(`[Connection ${id}] 💚 Pong received (${metrics.pongCount})`);
    });

    ws.on('error', (error) => {
      metrics.errorCount++;
      console.error(`[Connection ${id}] ❌ Error:`, error.message);
    });

    ws.on('close', (code, reason) => {
      metrics.closeTime = performance.now();
      metrics.closeCode = code;
      metrics.closeReason = reason.toString();
      
      const wasExpected = metrics.closeTime - startTime >= duration - 100; // Within 100ms of expected close
      const codeDescription = getCloseCodeDescription(code);
      
      console.log(`[Connection ${id}] 🔌 Connection closed`);
      console.log(`[Connection ${id}]    ↳ Code: ${code} (${codeDescription})`);
      console.log(`[Connection ${id}]    ↳ Reason: ${metrics.closeReason || 'none'}`);
      console.log(`[Connection ${id}]    ↳ Expected: ${wasExpected ? 'YES' : 'NO - ABNORMAL CLOSURE'}`);
      
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      
      resolve(metrics);
    });

    // Close connection after test duration
    setTimeout(() => {
      if (isOpen && ws.readyState === WebSocket.OPEN) {
        console.log(`[Connection ${id}] ⏱️  Test duration reached, closing connection...`);
        ws.close(1000, 'Test completed');
      } else if (!isOpen) {
        console.log(`[Connection ${id}] ⚠️  Never connected, resolving metrics...`);
        resolve(metrics);
      }
    }, duration);
  });
}

// Get human-readable close code description
function getCloseCodeDescription(code) {
  const descriptions = {
    1000: 'Normal Closure',
    1001: 'Going Away',
    1002: 'Protocol Error',
    1003: 'Unsupported Data',
    1005: 'No Status Received',
    1006: 'Abnormal Closure (connection lost)',
    1007: 'Invalid Frame Payload',
    1008: 'Policy Violation',
    1009: 'Message Too Big',
    1010: 'Mandatory Extension Missing',
    1011: 'Internal Server Error',
    1015: 'TLS Handshake Failed'
  };
  return descriptions[code] || 'Unknown';
}

// Main test execution
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 WebSocket Diagnostic Test');
  console.log('='.repeat(80));
  console.log(`\n📋 Configuration:`);
  console.log(`   URL: ${config.url}`);
  console.log(`   Duration: ${config.duration}ms (${Math.round(config.duration / 1000)}s)`);
  console.log(`   Stress Test: ${config.stress ? 'YES' : 'NO'}`);
  if (config.stress) {
    console.log(`   Connections: ${config.connections}`);
  }

  const startTime = performance.now();
  const allMetrics = [];

  if (config.stress) {
    // Stress test: multiple connections
    console.log(`\n🔥 Starting stress test with ${config.connections} connections...`);
    
    const promises = [];
    for (let i = 1; i <= config.connections; i++) {
      // Stagger connections slightly
      await new Promise(resolve => setTimeout(resolve, 100));
      promises.push(testConnection(i, config.duration));
    }
    
    const results = await Promise.all(promises);
    allMetrics.push(...results);
  } else {
    // Single connection test
    console.log(`\n🔍 Starting single connection test...`);
    const metrics = await testConnection(1, config.duration);
    allMetrics.push(metrics);
  }

  const endTime = performance.now();
  const totalTime = Math.round(endTime - startTime);

  // Print summary report
  console.log('\n' + '='.repeat(80));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(80));
  console.log(`\nTotal test time: ${totalTime}ms (${Math.round(totalTime / 1000)}s)\n`);

  allMetrics.forEach((metrics) => {
    const report = metrics.getReport();
    console.log(`[Connection ${report.id}]`);
    console.log(`  Uptime:              ${report.uptime}`);
    console.log(`  Time to 1st message: ${report.timeToFirstMessage}`);
    console.log(`  Messages received:   ${report.messagesReceived}`);
    console.log(`  Pings/Pongs:         ${report.pingsSent}/${report.pongsReceived}`);
    console.log(`  Errors:              ${report.errors}`);
    console.log(`  Close code:          ${report.closeCode} (${getCloseCodeDescription(report.closeCode)})`);
    console.log(`  Close reason:        ${report.closeReason}`);
    console.log('');
  });

  // Overall statistics
  const totalMessages = allMetrics.reduce((sum, m) => sum + m.messageCount, 0);
  const totalErrors = allMetrics.reduce((sum, m) => sum + m.errorCount, 0);
  const abnormalClosures = allMetrics.filter(m => m.closeCode === 1006).length;
  const successfulConnections = allMetrics.filter(m => m.connectionTime !== null).length;

  console.log('📈 Overall Statistics:');
  console.log(`  Successful connections:  ${successfulConnections}/${allMetrics.length}`);
  console.log(`  Total messages received: ${totalMessages}`);
  console.log(`  Total errors:            ${totalErrors}`);
  console.log(`  Abnormal closures (1006): ${abnormalClosures}/${allMetrics.length}`);

  // Health assessment
  console.log('\n' + '='.repeat(80));
  const isHealthy = successfulConnections === allMetrics.length && 
                    abnormalClosures === 0 && 
                    totalMessages > 0 &&
                    totalErrors === 0;

  if (isHealthy) {
    console.log('✅ RESULT: WebSocket backend is HEALTHY');
    console.log('   - All connections established successfully');
    console.log('   - No abnormal closures detected');
    console.log('   - Messages received correctly');
    console.log('   - No errors during test');
  } else {
    console.log('⚠️  RESULT: WebSocket backend has ISSUES');
    if (successfulConnections < allMetrics.length) {
      console.log(`   ❌ ${allMetrics.length - successfulConnections} connection(s) failed to establish`);
    }
    if (abnormalClosures > 0) {
      console.log(`   ❌ ${abnormalClosures} abnormal closure(s) detected (code 1006)`);
    }
    if (totalMessages === 0) {
      console.log('   ❌ No messages received from server');
    }
    if (totalErrors > 0) {
      console.log(`   ❌ ${totalErrors} error(s) occurred during test`);
    }
  }
  console.log('='.repeat(80) + '\n');

  process.exit(isHealthy ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error('\n💥 Fatal error during test:', error);
  process.exit(1);
});

