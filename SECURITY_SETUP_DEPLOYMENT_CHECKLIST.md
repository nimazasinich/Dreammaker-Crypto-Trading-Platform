# 🔒 Security Setup & Deployment Checklist

**Dreammaker Crypto Trading Platform**  
**Version:** 1.0.0  
**Date:** 2025-12-03

---

## ⚠️ CRITICAL: Before You Start

**ALL hardcoded API keys have been removed from the codebase.**  
You MUST provide API keys via environment variables before the application will function.

---

## 📋 Quick Start Checklist

### ✅ **Step 1: Copy Environment Template**

```bash
# Copy the template
cp env.example env

# Or for specific environments
cp env.example env.development
cp env.example env.production
```

### ✅ **Step 2: Obtain API Keys**

Get your API keys from these providers (links in env.example):

**Required:**
- [ ] **HuggingFace Token**: https://huggingface.co/settings/tokens

**Optional (but recommended):**
- [ ] Etherscan API Key: https://etherscan.io/apis
- [ ] BscScan API Key: https://bscscan.com/apis
- [ ] TronScan API Key: https://tronscan.org/#/
- [ ] CryptoCompare API Key: https://www.cryptocompare.com/cryptopian/api-keys
- [ ] NewsAPI Key: https://newsapi.org/
- [ ] CoinMarketCap API Key: https://coinmarketcap.com/api/ (optional)

### ✅ **Step 3: Fill in Environment Variables**

Edit your `env` file and replace all `your_*_api_key_here` placeholders with actual keys:

```bash
# Example (DO NOT COMMIT THESE VALUES):
HF_TOKEN=hf_YourActualTokenHere
ETHERSCAN_API_KEY=YourEtherscanKeyHere
BSCSCAN_API_KEY=YourBscScanKeyHere
# ... etc
```

**IMPORTANT:** 
- ❌ DO NOT commit the `env` file to git
- ❌ DO NOT share API keys in chat, email, or Slack
- ✅ DO use a password manager or secrets vault

### ✅ **Step 4: Verify .gitignore**

Ensure these files are excluded from git:

```bash
# Check .gitignore includes:
cat .gitignore | grep -E '^(env|\.env)'

# Should see:
# env
# env.local
# env.real
# env.mock
# env.staging
# env.production
# .env
# .env.*
```

### ✅ **Step 5: Install Dependencies**

```bash
npm install
```

### ✅ **Step 6: Test Environment Loading**

```bash
# Start backend server
npm run dev:server

# In another terminal, start frontend
npm run dev:client

# Check logs for:
# ✅ "DatasourceClient initialized"
# ✅ "MultiProviderMarketDataService initialized"
# ✅ No "API key missing" warnings
```

### ✅ **Step 7: Verify Functionality**

Test these endpoints to ensure API keys work:

```bash
# Health check (should return 200)
curl http://localhost:8001/api/health

# Market data (should return real prices)
curl http://localhost:8001/api/market?limit=5

# News (if NEWS_API_KEY provided)
curl http://localhost:8001/api/news/latest?limit=5

# Sentiment data
curl http://localhost:8001/api/sentiment
```

**Expected Results:**
- ✅ All endpoints return JSON (not HTML errors)
- ✅ Market prices are real and recent
- ✅ No "API key invalid" errors

### ✅ **Step 8: Security Verification**

Run these checks before committing:

```bash
# 1. Check for accidentally committed secrets
grep -r "hf_[A-Za-z0-9]\{30,\}" src/
# Should return: NO MATCHES

# 2. Check for hardcoded API keys
grep -r -E "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" src/
# Should return: NO MATCHES (except comments/docs)

# 3. Verify env file is NOT staged
git status | grep "^[[:space:]]*env$"
# Should return: NOTHING (file is ignored)
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] **All exposed API keys rotated** (see HARDCODED_SECRETS_REMOVAL_REPORT.json)
- [ ] **Environment variables configured** in production secrets manager
- [ ] **NODE_ENV=production** set
- [ ] **FRONTEND_ORIGIN** set to production domain(s)
- [ ] **SESSION_SECRET** generated (32+ random characters)
- [ ] **CSP** configured for production (remove unsafe-eval)
- [ ] **Rate limiting** tested under load
- [ ] **HTTPS/TLS** enabled with valid certificate
- [ ] **Database backups** configured and tested
- [ ] **Monitoring/alerting** set up
- [ ] **Security headers** verified (use securityheaders.com)

### Environment Variable Setup (Production)

**Option A: Cloud Provider Secrets Manager (Recommended)**

```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name dreammaker-crypto-api-keys \
  --secret-string file://secrets.json

# Azure Key Vault
az keyvault secret set \
  --vault-name dreammaker-vault \
  --name HF-TOKEN \
  --value "your_token_here"

# Google Cloud Secret Manager
gcloud secrets create hf-token \
  --data-file=./hf-token.txt
```

**Option B: Environment Variables (Minimum)**

```bash
# Set environment variables in your deployment platform:

# Heroku
heroku config:set HF_TOKEN=your_token_here

# Railway
railway variables set HF_TOKEN=your_token_here

# Docker
docker run -e HF_TOKEN=your_token_here ...

# Docker Compose
# Use env_file or environment section in docker-compose.yml
```

### Post-Deployment Verification

```bash
# Test production endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/market?limit=5

# Check security headers
curl -I https://yourdomain.com/ | grep -i "strict-transport-security"
curl -I https://yourdomain.com/ | grep -i "content-security-policy"

# Verify CORS
curl -H "Origin: http://evil.com" \
  -X OPTIONS https://yourdomain.com/api/health
# Should NOT include Access-Control-Allow-Origin for unauthorized origin
```

---

## 🔄 Key Rotation Schedule

Rotate API keys on this schedule:

| Key Type | Rotation Frequency | Priority |
|----------|-------------------|----------|
| HuggingFace | Every 90 days | HIGH |
| Blockchain Explorers | Every 180 days | MEDIUM |
| Market Data APIs | Every 180 days | MEDIUM |
| Session Secret | Every 30 days | CRITICAL |

**Rotation Procedure:**
1. Generate new key from provider
2. Update secrets manager / env vars
3. Deploy with new key
4. Wait 24 hours (grace period)
5. Revoke old key
6. Monitor for errors

---

## 🚨 Security Incident Response

### If You Accidentally Commit a Secret:

**DO NOT** just delete the file and commit again. Secrets remain in git history!

**Immediate Actions:**

```bash
# 1. Rotate the exposed key IMMEDIATELY
# 2. Use git-filter-repo to remove from history
pip install git-filter-repo
git filter-repo --path env --invert-paths

# 3. Force push (coordinate with team first!)
git push --force origin main

# 4. Notify team members to re-clone
```

**Report to:**
- [ ] Security team
- [ ] DevOps team
- [ ] API provider (check for unusual usage)

---

## 📞 Support & Documentation

**Security Documentation:**
- `HARDCODED_SECRETS_REMOVAL_REPORT.json` - Complete audit report
- `SECURITY_RECOMMENDATIONS.json` - Long-term security roadmap
- `SECURITY_TESTING_CHECKLIST.json` - Testing procedures
- `env.example` - Environment variable template

**If You Need Help:**
1. Check logs for specific errors
2. Verify environment variables are loaded: `console.log(process.env.HF_TOKEN ? 'Set' : 'Missing')`
3. Test API keys independently before blaming the code
4. Review the security reports for additional context

---

## ✅ Final Verification

Before you commit or deploy, verify:

- [ ] ✅ No hardcoded secrets in code
- [ ] ✅ `env` file is gitignored
- [ ] ✅ `env.example` has placeholders only
- [ ] ✅ All API keys loaded from environment
- [ ] ✅ Application functions correctly
- [ ] ✅ Security tests pass
- [ ] ✅ Git history scrubbed (if needed)
- [ ] ✅ All exposed keys rotated

**You're ready to deploy! 🚀**

---

**⚠️ Remember:**
- **NEVER** commit real API keys
- **ALWAYS** use environment variables or secrets manager
- **ROTATE** exposed keys immediately
- **TEST** thoroughly before production deployment

---

**Last Updated:** 2025-12-03  
**Security Audit Status:** ✅ PASSED

