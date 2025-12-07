# Running Backend and Frontend Separately

## Quick Start

### Option 1: Two Terminal Windows (Recommended)

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
```
- Runs on: `http://localhost:8001`
- API endpoints: `/api/*`
- WebSocket: `ws://localhost:8001/ws`

**Terminal 2 - Frontend Client:**
```bash
npm run dev:client
```
- Runs on: `http://localhost:5173`
- Proxies API calls to backend on port 8001

---

## Available Scripts

### Backend Server Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Default** | `npm run dev:server` | Development server (port 8001) |
| **Real Data** | `npm run dev:server:real` | With real API keys from `env.real` |
| **Mock Data** | `npm run dev:server:mock` | With mock/test data from `env.mock` |
| **Staging** | `npm run dev:server:staging` | Staging environment from `env.staging` |
| **Production** | `npm run dev:server:prod` | Production config from `env.production` |

### Frontend Client Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Default** | `npm run dev:client` | Development server (port 5173) |
| **Real Data** | `npm run dev:client:real` | With real API keys from `env.real` |
| **Mock Data** | `npm run dev:client:mock` | With mock/test data from `env.mock` |
| **Staging** | `npm run dev:client:staging` | Staging environment from `env.staging` |
| **Production** | `npm run dev:client:prod` | Production config from `env.production` |

---

## Step-by-Step Instructions

### Windows (PowerShell)

1. **Open Terminal 1** (Backend):
   ```powershell
   cd "C:\Users\Dreammaker\Downloads\Dreammaker-legal-agent-gitlab-main (9)\Dreammaker-legal-agent-gitlab-main"
   npm run dev:server
   ```
   Wait for: `✅ Server running on port 8001`

2. **Open Terminal 2** (Frontend):
   ```powershell
   cd "C:\Users\Dreammaker\Downloads\Dreammaker-legal-agent-gitlab-main (9)\Dreammaker-legal-agent-gitlab-main"
   npm run dev:client
   ```
   Wait for: `Local: http://localhost:5173/`

3. **Open Browser**: Navigate to `http://localhost:5173`

### Windows (Command Prompt)

1. **Open CMD 1** (Backend):
   ```cmd
   cd "C:\Users\Dreammaker\Downloads\Dreammaker-legal-agent-gitlab-main (9)\Dreammaker-legal-agent-gitlab-main"
   npm run dev:server
   ```

2. **Open CMD 2** (Frontend):
   ```cmd
   cd "C:\Users\Dreammaker\Downloads\Dreammaker-legal-agent-gitlab-main (9)\Dreammaker-legal-agent-gitlab-main"
   npm run dev:client
   ```

### Linux/Mac (Terminal)

1. **Open Terminal 1** (Backend):
   ```bash
   npm run dev:server
   ```

2. **Open Terminal 2** (Frontend):
   ```bash
   npm run dev:client
   ```

---

## Ports

- **Backend**: `8001` (API server)
- **Frontend**: `5173` (Vite dev server)
- **Frontend proxies** `/api/*` requests to backend automatically

---

## Troubleshooting

### Port Already in Use

If port 8001 or 5173 is already in use:

**Kill processes on ports:**
```bash
# Windows PowerShell
npm run dev:kill

# Or manually:
# Find process on port 8001
netstat -ano | findstr :8001
# Kill process (replace PID)
taskkill /PID <PID> /F

# Find process on port 5173
netstat -ano | findstr :5173
# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Backend Not Starting

1. Check if port 8001 is available
2. Verify Node.js version: `node --version` (should be >= 18.0.0)
3. Check for errors in Terminal 1 output
4. Try: `npm run dev:server:real` if default fails

### Frontend Can't Connect to Backend

1. Ensure backend is running on port 8001
2. Check `vite.config.ts` proxy settings
3. Verify backend health: `http://localhost:8001/api/health`
4. Check browser console for errors

### IPv6 Connection Errors

If you see `EACCES ::1:62067` errors:
- The Playwright config has been updated to force IPv4
- Ensure backend uses `127.0.0.1` instead of `localhost`
- Check Windows Firewall settings

---

## Stopping Servers

- **Backend**: Press `Ctrl+C` in Terminal 1
- **Frontend**: Press `Ctrl+C` in Terminal 2

---

## Benefits of Running Separately

✅ **Better Debugging**: See backend and frontend logs separately  
✅ **Independent Restarts**: Restart one without affecting the other  
✅ **Resource Management**: Monitor CPU/memory usage per service  
✅ **Development Flexibility**: Test frontend with different backend configs  
✅ **Easier Troubleshooting**: Isolate issues to specific service  

---

## Quick Reference

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client

# Access Application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8001/api/health
```

