# 🔒 Security & Best Practices Guide
# راهنمای امنیت و بهترین روش‌ها

## 📋 فهرست مطالب

1. [امنیت Proxy و DNS](#امنیت-proxy-و-dns)
2. [مدیریت API Keys](#مدیریت-api-keys)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Logging و Privacy](#logging-و-privacy)
6. [Performance Optimization](#performance-optimization)
7. [Production Deployment](#production-deployment)

---

## 🔐 امنیت Proxy و DNS

### ✅ DO: کارهایی که باید انجام بدی

#### 1. استفاده از HTTPS همیشه

```python
# ✅ GOOD
url = "https://api.binance.com/api/v3/ticker"  # HTTPS

# ❌ BAD
url = "http://api.binance.com/api/v3/ticker"  # HTTP (ناامن)
```

#### 2. Validate کردن Proxy Response

```python
async def safe_proxy_fetch(url: str, provider: str):
    """Fetch با validation"""
    
    manager = get_proxy_manager()
    data = await manager.fetch_with_proxy_rotation(
        url=url,
        provider_name=provider
    )
    
    # ✅ Validate response
    if not data:
        logger.warning(f"No data received from {provider}")
        return None
    
    # ✅ Check for expected fields
    if provider == "binance" and "lastPrice" not in data:
        logger.warning(f"Unexpected response format from Binance")
        return None
    
    return data
```

#### 3. DNS over HTTPS (DoH) همیشه فعال باشه

```python
# ✅ GOOD: استفاده از DoH
ip = await manager.resolve_hostname("api.binance.com")

# ❌ BAD: استفاده از DNS معمولی (قابل رهگیری)
import socket
ip = socket.gethostbyname("api.binance.com")
```

#### 4. Proxy Validation قبل از استفاده

```python
class SmartProxyManagerV2:
    async def _test_proxy(self, proxy: ProxyInfo) -> bool:
        """Test proxy با security checks"""
        
        try:
            # ✅ Test با URL معتبر
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    "https://httpbin.org/ip",  # ✅ HTTPS
                    proxy=proxy.get_proxy_url(),
                    timeout=aiohttp.ClientTimeout(total=5),
                    ssl=True  # ✅ Verify SSL
                ) as resp:
                    if resp.status == 200:
                        # ✅ Validate response
                        data = await resp.json()
                        if "origin" in data:  # Expected field
                            return True
            
            return False
        
        except Exception as e:
            logger.debug(f"Proxy test failed: {e}")
            return False
```

### ❌ DON'T: کارهایی که نباید انجام بدی

#### 1. استفاده از Proxy های ناشناس بدون تست

```python
# ❌ BAD: اضافه کردن proxy بدون validation
def add_untrusted_proxy(url: str):
    proxy = ProxyInfo(url=url)
    self.proxies.append(proxy)  # خطرناک!

# ✅ GOOD: Test before adding
async def add_trusted_proxy(url: str):
    proxy = ProxyInfo(url=url)
    if await self._test_proxy(proxy):
        self.proxies.append(proxy)
    else:
        logger.warning(f"Proxy {url} failed validation")
```

#### 2. لاگ کردن Sensitive Data

```python
# ❌ BAD: لاگ کردن URL کامل با parameters
logger.info(f"Fetching: {url}?apiKey=SECRET123")  # خطرناک!

# ✅ GOOD: Sanitize logs
logger.info(f"Fetching: {url.split('?')[0]}")  # فقط base URL
```

#### 3. Hard-coding API Keys

```python
# ❌ BAD
BINANCE_API_KEY = "abc123xyz"  # خطرناک!

# ✅ GOOD
import os
BINANCE_API_KEY = os.getenv("BINANCE_API_KEY")
```

---

## 🔑 مدیریت API Keys

### Environment Variables

#### .env فایل:

```env
# API Keys
BINANCE_API_KEY=your_binance_key_here
BINANCE_SECRET_KEY=your_binance_secret_here
COINGECKO_API_KEY=your_coingecko_key_here

# Proxy Settings
PROXY_REFRESH_INTERVAL=300
PROXY_TEST_TIMEOUT=5

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_PER_MINUTE=60
```

#### کد:

```python
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SecureConfig:
    """Secure configuration management"""
    
    # API Keys
    BINANCE_API_KEY = os.getenv("BINANCE_API_KEY")
    BINANCE_SECRET_KEY = os.getenv("BINANCE_SECRET_KEY")
    
    # ✅ Validate that keys exist
    @classmethod
    def validate(cls):
        """Validate that required keys are present"""
        required_vars = [
            "BINANCE_API_KEY",
            "BINANCE_SECRET_KEY"
        ]
        
        missing = [var for var in required_vars if not os.getenv(var)]
        
        if missing:
            raise ValueError(f"Missing environment variables: {missing}")
    
    # ✅ Method to get key safely
    @classmethod
    def get_api_key(cls, provider: str) -> str:
        """Get API key for provider"""
        key_map = {
            "binance": cls.BINANCE_API_KEY,
            "coingecko": os.getenv("COINGECKO_API_KEY")
        }
        
        key = key_map.get(provider)
        if not key:
            logger.warning(f"No API key configured for {provider}")
        
        return key

# Validate on startup
SecureConfig.validate()
```

### API Key Rotation

```python
class APIKeyRotator:
    """Rotate API keys to avoid rate limits"""
    
    def __init__(self):
        self.keys = {
            "binance": [
                os.getenv("BINANCE_KEY_1"),
                os.getenv("BINANCE_KEY_2"),
                os.getenv("BINANCE_KEY_3")
            ]
        }
        self.current_index = {"binance": 0}
    
    def get_next_key(self, provider: str) -> str:
        """Get next API key in rotation"""
        keys = [k for k in self.keys.get(provider, []) if k]
        
        if not keys:
            return None
        
        index = self.current_index.get(provider, 0)
        key = keys[index % len(keys)]
        
        # Rotate to next
        self.current_index[provider] = (index + 1) % len(keys)
        
        return key
```

---

## ⏱️ Rate Limiting

### Per-Provider Rate Limits

```python
from collections import defaultdict
from datetime import datetime, timedelta

class SmartRateLimiter:
    """Rate limiter per provider"""
    
    def __init__(self):
        self.limits = {
            "binance": {"requests": 1200, "window": 60},  # 1200/min
            "coingecko": {"requests": 50, "window": 60},  # 50/min
            "coincap": {"requests": 200, "window": 60}    # 200/min
        }
        
        self.requests = defaultdict(list)
    
    async def check_limit(self, provider: str) -> bool:
        """Check if request is allowed"""
        
        if provider not in self.limits:
            return True  # No limit
        
        limit_config = self.limits[provider]
        max_requests = limit_config["requests"]
        window = limit_config["window"]
        
        now = datetime.now()
        cutoff = now - timedelta(seconds=window)
        
        # Remove old requests
        self.requests[provider] = [
            req_time for req_time in self.requests[provider]
            if req_time > cutoff
        ]
        
        # Check limit
        if len(self.requests[provider]) >= max_requests:
            logger.warning(f"Rate limit exceeded for {provider}")
            return False
        
        # Record request
        self.requests[provider].append(now)
        return True
    
    async def wait_if_needed(self, provider: str):
        """Wait if rate limit exceeded"""
        
        while not await self.check_limit(provider):
            logger.info(f"Waiting for rate limit reset ({provider})")
            await asyncio.sleep(1)

# Global instance
rate_limiter = SmartRateLimiter()

# Usage
async def fetch_with_rate_limit(url: str, provider: str):
    # ✅ Wait if needed
    await rate_limiter.wait_if_needed(provider)
    
    # Proceed with request
    return await manager.fetch_with_proxy_rotation(url, provider)
```

### FastAPI Rate Limiting

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Per-endpoint limits
@app.get("/api/prices")
@limiter.limit("100/minute")
async def get_prices(request: Request):
    """Get prices (100 requests per minute)"""
    pass

@app.get("/api/ohlcv")
@limiter.limit("50/minute")
async def get_ohlcv(request: Request):
    """Get OHLCV data (50 requests per minute)"""
    pass
```

---

## 🛡️ Error Handling

### Circuit Breaker Pattern

```python
from datetime import datetime, timedelta
from typing import Callable

class CircuitBreaker:
    """Circuit breaker for failing providers"""
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type = Exception
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self.failures = 0
        self.opened_at = None
        self.state = "closed"  # closed, open, half-open
    
    def call(self, func: Callable, *args, **kwargs):
        """Execute function with circuit breaker"""
        
        # Check if circuit is open
        if self.state == "open":
            if datetime.now() - self.opened_at > timedelta(seconds=self.recovery_timeout):
                self.state = "half-open"
                logger.info("Circuit breaker entering half-open state")
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            # Execute function
            result = func(*args, **kwargs)
            
            # Success - reset if in half-open
            if self.state == "half-open":
                self.state = "closed"
                self.failures = 0
                logger.info("Circuit breaker closed")
            
            return result
        
        except self.expected_exception as e:
            # Failure
            self.failures += 1
            
            if self.failures >= self.failure_threshold:
                self.state = "open"
                self.opened_at = datetime.now()
                logger.error(f"Circuit breaker OPENED after {self.failures} failures")
            
            raise

# Usage
binance_circuit = CircuitBreaker(failure_threshold=5, recovery_timeout=60)

async def fetch_binance_with_circuit():
    try:
        return binance_circuit.call(
            lambda: manager.fetch_with_proxy_rotation(
                "https://api.binance.com/api/v3/ticker",
                provider_name="binance"
            )
        )
    except Exception as e:
        logger.error(f"Circuit breaker prevented call: {e}")
        # Fallback to another provider
        return await fetch_from_coingecko()
```

### Retry with Exponential Backoff

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(aiohttp.ClientError)
)
async def fetch_with_retry(url: str, provider: str):
    """Fetch with automatic retry and exponential backoff"""
    
    manager = get_proxy_manager()
    return await manager.fetch_with_proxy_rotation(url, provider)

# Usage
try:
    data = await fetch_with_retry(
        "https://api.binance.com/api/v3/ticker",
        "binance"
    )
except Exception as e:
    logger.error(f"All retry attempts failed: {e}")
```

---

## 📝 Logging و Privacy

### Structured Logging

```python
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()

# Usage
logger.info(
    "proxy_request",
    provider="binance",
    endpoint="/api/v3/ticker",
    proxy_used="45.76.123.45:8080",
    duration_ms=150,
    status="success"
)
```

### Privacy-Safe Logging

```python
import re

class PrivacySafeLogger:
    """Logger that sanitizes sensitive data"""
    
    PATTERNS = {
        "api_key": r"apikey=[\w\d]+",
        "secret": r"secret=[\w\d]+",
        "token": r"token=[\w\d]+",
        "password": r"password=[\w\d]+"
    }
    
    @classmethod
    def sanitize(cls, message: str) -> str:
        """Remove sensitive data from log message"""
        
        sanitized = message
        
        for pattern_name, pattern in cls.PATTERNS.items():
            sanitized = re.sub(
                pattern,
                f"{pattern_name}=***REDACTED***",
                sanitized,
                flags=re.IGNORECASE
            )
        
        return sanitized
    
    @classmethod
    def info(cls, message: str):
        """Log info with sanitization"""
        logger.info(cls.sanitize(message))

# Usage
PrivacySafeLogger.info("Request: /api/v3/ticker?apikey=ABC123")
# Output: Request: /api/v3/ticker?apikey=***REDACTED***
```

---

## 🚀 Performance Optimization

### Connection Pooling

```python
import aiohttp

class ConnectionPool:
    """Reusable connection pool"""
    
    def __init__(self, pool_size: int = 100):
        self.connector = aiohttp.TCPConnector(
            limit=pool_size,
            limit_per_host=30,
            ttl_dns_cache=300
        )
        self.session = None
    
    async def get_session(self) -> aiohttp.ClientSession:
        """Get or create session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                connector=self.connector,
                timeout=aiohttp.ClientTimeout(total=15)
            )
        return self.session
    
    async def close(self):
        """Close session"""
        if self.session:
            await self.session.close()

# Global pool
connection_pool = ConnectionPool()

# Usage
async def fetch_optimized(url: str):
    session = await connection_pool.get_session()
    async with session.get(url) as resp:
        return await resp.json()
```

### Caching Strategy

```python
from cachetools import TTLCache
import hashlib

class SmartCache:
    """Smart caching with TTL"""
    
    def __init__(self):
        self.caches = {
            "prices": TTLCache(maxsize=1000, ttl=60),      # 1 minute
            "ohlcv": TTLCache(maxsize=500, ttl=300),       # 5 minutes
            "news": TTLCache(maxsize=200, ttl=600),        # 10 minutes
            "provider_health": TTLCache(maxsize=50, ttl=30) # 30 seconds
        }
    
    def _make_key(self, *args, **kwargs) -> str:
        """Generate cache key"""
        key_str = str(args) + str(sorted(kwargs.items()))
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, cache_type: str, *args, **kwargs):
        """Get from cache"""
        cache = self.caches.get(cache_type)
        if not cache:
            return None
        
        key = self._make_key(*args, **kwargs)
        return cache.get(key)
    
    def set(self, cache_type: str, value, *args, **kwargs):
        """Set to cache"""
        cache = self.caches.get(cache_type)
        if cache:
            key = self._make_key(*args, **kwargs)
            cache[key] = value

# Usage
cache = SmartCache()

async def get_price_cached(symbol: str):
    # Check cache
    cached = cache.get("prices", symbol=symbol)
    if cached:
        return cached
    
    # Fetch
    data = await fetch_price(symbol)
    
    # Cache
    cache.set("prices", data, symbol=symbol)
    
    return data
```

---

## 🏭 Production Deployment

### Docker Best Practices

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Security: Run as non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:7860/health')"

# Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
```

### Environment-Specific Config

```python
import os

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    PROXY_REFRESH_INTERVAL = 600  # 10 minutes (slower in dev)

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    PROXY_REFRESH_INTERVAL = 300  # 5 minutes
    
    # Production-specific security
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")

# Select config based on environment
ENV = os.getenv("APP_ENV", "development")
config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig
}
config = config_map.get(ENV, DevelopmentConfig)()
```

### Monitoring در Production

```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest

# Metrics
request_count = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'api_request_duration_seconds',
    'API request duration',
    ['endpoint']
)

active_proxies_gauge = Gauge(
    'active_proxies',
    'Number of active proxies'
)

# Middleware
@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    
    # Record metrics
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    request_duration.labels(
        endpoint=request.url.path
    ).observe(duration)
    
    return response

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(
        content=generate_latest(),
        media_type="text/plain"
    )
```

---

## ✅ Security Checklist

### Pre-Production

- [ ] همه API keys در environment variables هستند
- [ ] HTTPS برای همه external requests
- [ ] Rate limiting فعال است
- [ ] Logging sensitive data ندارد
- [ ] Circuit breaker برای failing providers
- [ ] CORS تنظیم شده
- [ ] Health checks فعال است

### Production

- [ ] Docker با non-root user اجرا می‌شود
- [ ] SSL/TLS certificates معتبر
- [ ] Firewall rules تنظیم شده
- [ ] Monitoring و alerting فعال
- [ ] Backup strategy وجود دارد
- [ ] Rate limiting در چند لایه
- [ ] Secret rotation در production

---

## 📚 منابع اضافی

### Security Resources
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Python Security Best Practices: https://python.readthedocs.io/en/stable/library/security_warnings.html

### Performance
- FastAPI Best Practices: https://fastapi.tiangolo.com/deployment/
- aiohttp Performance: https://docs.aiohttp.org/en/stable/

### Monitoring
- Prometheus Python Client: https://github.com/prometheus/client_python
- Grafana: https://grafana.com/docs/

---

## 🎯 نتیجه‌گیری

با رعایت این best practices:
- ✅ امنیت سیستم تضمین می‌شود
- ✅ Performance بهینه است
- ✅ Error handling robust است
- ✅ Monitoring کامل است
- ✅ Production-ready است

**موفق باشید! 🚀**
