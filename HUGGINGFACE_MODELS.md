# Hugging Face Models Configuration

## Overview

This document provides information about the Hugging Face models used in the crypto trading platform, configuration options, and troubleshooting for model-related issues.

## Current Models

### Sentiment Analysis Models

#### Primary Model: `ElKulako/cryptobert`
- **Purpose**: Cryptocurrency-specific sentiment analysis
- **Type**: Text Classification (Sentiment)
- **Pipeline**: sentiment-analysis
- **Status**: Active (as of last verification)
- **URL**: https://huggingface.co/ElKulako/cryptobert

#### Fallback Model: `kk08/CryptoBERT`
- **Purpose**: Cryptocurrency sentiment analysis (backup)
- **Type**: Text Classification (Sentiment)
- **Pipeline**: sentiment-analysis
- **Status**: Active (as of last verification)
- **URL**: https://huggingface.co/kk08/CryptoBERT

### OHLCV Dataset Models

The platform uses several HuggingFace datasets for OHLCV (candlestick) data:

- **BTC**: `WinkingFace/CryptoLM-Bitcoin-BTC-USDT`
- **ETH**: `WinkingFace/CryptoLM-Ethereum-ETH-USDT`
- **SOL**: `WinkingFace/CryptoLM-Solana-SOL-USDT`
- **XRP**: `WinkingFace/CryptoLM-Ripple-XRP-USDT`
- **Default**: `linxy/CryptoCoin`

---

## Configuration Options

### Environment Variables

Add these to your `.env` file (see `env.example` for template):

```bash
# Required: HuggingFace API Token
# Get from: https://huggingface.co/settings/tokens
HF_TOKEN=your_huggingface_token_here
HUGGINGFACE_API_KEY=your_huggingface_token_here

# Optional: Local Model Fallback
# Enable this to use local/self-hosted models when HF API is unavailable
USE_LOCAL_MODEL=false
LOCAL_MODEL_URL=http://localhost:5000/inference
LOCAL_MODEL_TYPE=sentiment

# Optional: Model Validation
# Pre-validate models before calling (adds extra API call but prevents 404s)
HF_VALIDATE_MODELS=false

# HuggingFace Space Configuration
HF_ENGINE_BASE_URL=https://your-space-url.hf.space
HF_ENGINE_TIMEOUT=60000
HF_ENGINE_ENABLED=true
```

---

## Error Handling

### Common HTTP Error Codes

#### 404 - Model Not Found
- **Cause**: Model doesn't exist, has been deleted, or doesn't have a public inference endpoint
- **System Behavior**:
  - Error is logged with model ID and status
  - **No retries** are attempted (avoids wasting API calls)
  - Model is cached as unavailable for 1 hour
  - System falls back to secondary model or returns neutral sentiment
- **User Message**: "Model temporarily unavailable. The sentiment analysis models may be loading or have been updated. Please try again later."
- **Action**: Verify model exists at https://huggingface.co/MODEL_ID

#### 403 - Access Denied
- **Cause**: Model is private or requires authentication
- **System Behavior**:
  - Error is logged
  - **No retries** are attempted
  - Falls back to secondary model or returns neutral sentiment
- **User Message**: "Access denied to sentiment models. Please check your API credentials."
- **Action**: Check if model is private, verify HF_TOKEN is set correctly

#### 503 - Model Loading
- **Cause**: Model is cold-starting on HuggingFace servers
- **System Behavior**:
  - System waits for `estimated_time` returned by API (usually 10-30 seconds)
  - Automatically retries after wait period
  - Up to 3 retry attempts with exponential backoff
- **User Message**: "Sentiment models are loading. This usually takes 10-30 seconds. Please wait..."
- **Action**: Wait and retry automatically handled

#### 429 - Rate Limit
- **Cause**: Too many requests to HF API
- **System Behavior**:
  - Exponential backoff with delays
  - Token bucket rate limiter prevents exceeding limits
- **Action**: Wait for rate limit to reset or add HF_TOKEN for higher limits

---

## Fallback Mechanisms

The system implements multiple layers of fallback to ensure reliability:

### 1. Model Fallback Chain
```
Primary Model (ElKulako/cryptobert)
    ↓ (on failure)
Fallback Model (kk08/CryptoBERT)
    ↓ (on failure)
Local Model (if USE_LOCAL_MODEL=true)
    ↓ (on failure)
Neutral Sentiment (sentiment: 0, label: NEUTRAL, confidence: 0)
```

### 2. Local Model Fallback

Enable local model fallback for increased reliability:

```bash
USE_LOCAL_MODEL=true
LOCAL_MODEL_URL=http://localhost:5000/inference
```

**Local Model API Contract:**

```json
// Request
POST http://localhost:5000/inference
{
  "text": "Bitcoin is looking bullish today"
}

// Response
{
  "sentiment": 0.8,
  "label": "POSITIVE",
  "confidence": 0.85,
  "rawScores": [
    { "label": "POSITIVE", "score": 0.85 },
    { "label": "NEGATIVE", "score": 0.15 }
  ]
}
```

---

## Model Validation

### Pre-Validation (Optional)

Enable pre-validation to check model availability before making inference calls:

```bash
HF_VALIDATE_MODELS=true
```

**How it works:**
1. Before calling a model for inference, system checks `https://huggingface.co/api/models/{model_id}`
2. Validates model has `pipeline_tag` or `inference !== false`
3. Caches result for 1 hour to reduce API calls
4. Skips inference if model is unavailable

**Trade-offs:**
- ✅ Prevents 404 errors and wasted inference calls
- ✅ Cached results reduce overhead
- ❌ Adds extra API call on first use
- ❌ May add latency (5s timeout per validation)

---

## Rate Limiting

### Free Tier (No API Token)
- **Limit**: ~30 requests/second per IP
- **Behavior**: Token bucket rate limiter enforces limit
- **Recommendation**: For production, add HF_TOKEN

### With API Token
- **Limit**: Higher limits based on HF account tier
- **Rate Limiting**: Still enforced by token bucket, but with higher capacity

---

## Logging and Debugging

### Model Failure Logs

When a model fails, the system logs detailed information:

```json
{
  "level": "error",
  "message": "HF API request failed",
  "modelId": "ElKulako/cryptobert",
  "statusCode": 404,
  "attempt": 1,
  "maxRetries": 3,
  "errorMessage": "Model not found or unavailable",
  "errorData": { ... }
}
```

### Check Logs

View logs for model failures:

```bash
# Development
npm run dev

# Production logs
pm2 logs

# Search for model errors
grep "HF API request failed" logs/*.log
```

---

## Testing Models

### Manual Model Testing

Test model availability:

```bash
# Check model metadata
curl https://huggingface.co/api/models/ElKulako/cryptobert

# Test inference (requires HF_TOKEN)
curl -X POST \
  https://api-inference.huggingface.co/models/ElKulako/cryptobert \
  -H "Authorization: Bearer YOUR_HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Bitcoin is looking bullish"}'
```

### Application Testing

Test sentiment analysis in the app:

1. Navigate to the News Sentiment Scanner component
2. Observe loading state (models may take 10-30s to load on first call)
3. Check for errors displayed in ErrorStateCard
4. Verify sentiment scores are displayed
5. Check browser console and server logs for any errors

---

## Updating Models

### To Change Primary Model:

1. Edit `src/services/HFSentimentService.ts`:
```typescript
private readonly PRIMARY_MODEL = 'your-model-id';
```

2. Test the new model:
```bash
curl https://huggingface.co/api/models/your-model-id
```

3. Verify model has inference endpoint:
   - Check model card at https://huggingface.co/your-model-id
   - Look for "Inference API" section
   - Test inference as shown above

4. Update this documentation with the new model

### Model Requirements:

- ✅ Must have public inference endpoint
- ✅ Must support sentiment analysis (text-classification pipeline)
- ✅ Should return labels like POSITIVE/NEGATIVE or similar
- ✅ Should be actively maintained (not deprecated)

---

## Troubleshooting

### Problem: All models returning 404

**Possible Causes:**
1. HuggingFace API is down or experiencing issues
2. Models have been moved/deleted/renamed
3. Inference API is disabled for these models

**Solutions:**
1. Check HuggingFace status: https://status.huggingface.co
2. Verify models exist manually
3. Enable local model fallback: `USE_LOCAL_MODEL=true`
4. Check logs for detailed error messages

### Problem: Models are slow to respond

**Possible Causes:**
1. Cold start - models need to load (10-30s first time)
2. High API load
3. Network latency

**Solutions:**
1. Wait for initial load (automatic)
2. Use HF_TOKEN for priority access
3. Enable model validation to pre-warm: `HF_VALIDATE_MODELS=true`
4. Use local models for faster response

### Problem: Rate limit errors

**Solutions:**
1. Add HF_TOKEN to increase rate limits
2. Reduce polling frequency in components
3. Increase cache TTL to reduce API calls

---

## Support

- **HuggingFace Docs**: https://huggingface.co/docs/api-inference
- **Model Issues**: Check model page on HuggingFace for discussions/issues
- **Platform Issues**: Check application logs and error messages

---

## Version History

- **2024-12-03**: Initial documentation
  - Added 404/403 error handling (no retries)
  - Added local model fallback support
  - Added model validation feature
  - Enhanced error logging
  - Updated frontend error displays
