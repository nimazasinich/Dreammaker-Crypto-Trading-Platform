#!/usr/bin/env node
/**
 * Backend Health Check Script
 * Tests WebSocket connection + API endpoints independently
 * NO MOCKS - Real connections only
 */

import WebSocket from 'ws';
import http from 'http';

const BACKEND_BASE = 'http://localhost:8001';
const WS_BASE = 'ws://localhost:8001';

console.log('🔍 Starting Backend Health Check...\n');
console.log('Target:', BACKEND_BASE);
console.log('WebSocket:', WS_BASE);
console.log('=' .repeat(60));

// Test 1: Check if server is reachable
async function testServerReachable() {
  console.log('\n📡 TEST 1: Server Reachability');
  return new Promise((resolve) => {
    const req = http.get(`${BACKEND_BASE}/`, (res) => {
      console.log(`  ✅ Server responding - Status: ${res.statusCode}`);
      res.on('data', () => {}); // drain response
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`  ❌ Server unreachable - Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log('  ❌ Server timeout after 5s');
      resolve(false);
    });
  });
}

// Test 2: Check critical API endpoints
async function testAPIEndpoints() {
  console.log('\n📡 TEST 2: Critical API Endpoints');
  
  const endpoints = [
    '/api/system/health',
    '/market/prices?symbols=BTCUSDT&timeframe=1h&limit=25',
    '/api/portfolio/risk-metrics',
    '/ml/training/metrics',
    '/analysis/smc',
    '/analysis/elliott',
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BACKEND_BASE}${endpoint}`);
      const status = response.status;
      const statusText = response.statusText;
      
      if (status === 200) {
        const data = await response.json();
        console.log(`  ✅ ${endpoint}`);
        console.log(`     Status: ${status}, Data keys: ${Object.keys(data).join(', ')}`);
        results.push({ endpoint, status, success: true });
      } else {
        console.log(`  ❌ ${endpoint}`);
        console.log(`     Status: ${status} ${statusText}`);
        results.push({ endpoint, status, success: false });
      }
    } catch (err) {
      console.log(`  ❌ ${endpoint}`);
      console.log(`     Error: ${err.message}`);
      results.push({ endpoint, error: err.message, success: false });
    }
  }
  
  return results;
}

// Test 3: WebSocket Connection Health
async function testWebSocketConnection() {
  console.log('\n📡 TEST 3: WebSocket Connection');
  
  return new Promise((resolve) => {
    const ws = new WebSocket(`${WS_BASE}/ws`);
    let connected = false;
    let messageReceived = false;
    
    const timeout = setTimeout(() => {
      if (!connected) {
        console.log('  ❌ WebSocket connection timeout (10s)');
        ws.close();
        resolve({ success: false, reason: 'timeout' });
      }
    }, 10000);
    
    ws.on('open', () => {
      console.log('  ✅ WebSocket connection opened');
      connected = true;
      
      // Try sending a test message
      console.log('  📤 Sending test ping...');
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      
      // Wait for response or close
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          console.log('  ✅ WebSocket still connected after 3s');
          ws.close(1000, 'Health check complete');
          clearTimeout(timeout);
          resolve({ success: true, messageReceived });
        }
      }, 3000);
    });
    
    ws.on('message', (data) => {
      console.log(`  ✅ Received message: ${data.toString().substring(0, 100)}...`);
      messageReceived = true;
    });
    
    ws.on('error', (err) => {
      console.log(`  ❌ WebSocket error: ${err.message}`);
      clearTimeout(timeout);
      resolve({ success: false, reason: 'error', error: err.message });
    });
    
    ws.on('close', (code, reason) => {
      console.log(`  ⚠️ WebSocket closed - Code: ${code}, Reason: ${reason || 'No reason provided'}`);
      
      if (code === 1006) {
        console.log('  ⚠️ Code 1006 = Abnormal closure (likely handshake/upgrade failure)');
      }
      
      clearTimeout(timeout);
      
      if (!connected) {
        resolve({ success: false, reason: 'immediate_close', code });
      } else if (code !== 1000) {
        resolve({ success: false, reason: 'abnormal_close', code });
      }
    });
  });
}

// Test 4: Backend Configuration Check
async function checkBackendConfig() {
  console.log('\n📡 TEST 4: Backend Configuration');
  
  try {
    const response = await fetch(`${BACKEND_BASE}/api/system/health`);
    if (response.ok) {
      const health = await response.json();
      console.log('  ✅ Health endpoint accessible');
      console.log('  Data:', JSON.stringify(health, null, 2));
      return health;
    } else {
      console.log(`  ❌ Health endpoint returned ${response.status}`);
      return null;
    }
  } catch (err) {
    console.log(`  ❌ Cannot reach health endpoint: ${err.message}`);
    return null;
  }
}

// Main execution
(async function main() {
  console.log('\n🚀 Running Backend Health Checks...\n');
  
  // Step 1: Server reachable?
  const serverUp = await testServerReachable();
  
  if (!serverUp) {
    console.log('\n❌ CRITICAL: Backend server is not responding');
    console.log('   Please start the backend with: npm run dev:server:real');
    process.exit(1);
  }
  
  // Step 2: API endpoints
  const apiResults = await testAPIEndpoints();
  const failedAPIs = apiResults.filter(r => !r.success);
  
  if (failedAPIs.length > 0) {
    console.log(`\n⚠️ WARNING: ${failedAPIs.length}/${apiResults.length} API endpoints failed`);
  } else {
    console.log('\n✅ All API endpoints healthy');
  }
  
  // Step 3: WebSocket connection
  const wsResult = await testWebSocketConnection();
  
  if (!wsResult.success) {
    console.log('\n❌ CRITICAL: WebSocket connection failed');
    console.log(`   Reason: ${wsResult.reason}`);
    if (wsResult.code) {
      console.log(`   Close Code: ${wsResult.code}`);
    }
  } else {
    console.log('\n✅ WebSocket connection healthy');
  }
  
  // Step 4: Config check
  const config = await checkBackendConfig();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 HEALTH CHECK SUMMARY');
  console.log('='.repeat(60));
  console.log(`Server Reachable:    ${serverUp ? '✅ YES' : '❌ NO'}`);
  console.log(`API Endpoints OK:    ${failedAPIs.length === 0 ? '✅ YES' : `❌ ${failedAPIs.length} FAILED`}`);
  console.log(`WebSocket OK:        ${wsResult.success ? '✅ YES' : '❌ NO'}`);
  console.log(`Config Retrieved:    ${config ? '✅ YES' : '❌ NO'}`);
  
  const allHealthy = serverUp && failedAPIs.length === 0 && wsResult.success && config;
  
  if (allHealthy) {
    console.log('\n🎉 Backend is HEALTHY - Ready for frontend testing');
    process.exit(0);
  } else {
    console.log('\n⚠️ Backend has issues - Fix before frontend testing');
    console.log('\n🔧 RECOMMENDED FIXES:');
    if (!serverUp) {
      console.log('  1. Start backend server: npm run dev:server:real');
    }
    if (failedAPIs.length > 0) {
      console.log('  2. Implement missing API endpoints:');
      failedAPIs.forEach(api => console.log(`     - ${api.endpoint}`));
    }
    if (!wsResult.success) {
      console.log('  3. Fix WebSocket server configuration');
      console.log('     - Check server.ts WebSocket initialization');
      console.log('     - Verify upgrade handler is registered');
      console.log('     - Test with: wscat -c ws://localhost:8001/ws');
    }
    process.exit(1);
  }
})();

