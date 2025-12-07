# ⚡ راهنمای شروع سریع - Crypto Intelligence Hub V2

## 🎯 هدف
این راهنما به شما کمک می‌کند در **15 دقیقه** پروژه را ارتقا دهید و Proxy Manager را فعال کنید.

---

## 📋 Checklist سریع

- [ ] کپی `smart_proxy_manager_v2.py` به پروژه
- [ ] نصب dependencies جدید
- [ ] تست اولیه
- [ ] ادغام با workers
- [ ] اجرای برنامه

---

## 🚀 مرحله 1: نصب فایل‌های جدید (2 دقیقه)

```bash
# 1. رفتن به پوشه پروژه
cd /path/to/crypto-dt-source-main

# 2. ایجاد backup از فایل قدیمی
cp core/smart_proxy_manager.py core/smart_proxy_manager.old.py

# 3. کپی فایل جدید
cp /path/to/smart_proxy_manager_v2.py core/smart_proxy_manager.py

# 4. یا rename کن (اگر می‌خوای هر دو رو داشته باشی)
cp /path/to/smart_proxy_manager_v2.py core/smart_proxy_manager_v2.py
```

---

## 📦 مرحله 2: نصب Dependencies (3 دقیقه)

```bash
# نصب minimum dependencies برای proxy
pip install aiohttp==3.9.3 asyncio-throttle==1.0.2

# یا نصب کامل (پیشنهادی)
pip install -r requirements_updated.txt
```

### اگر فقط می‌خوای Proxy رو تست کنی:

```bash
pip install aiohttp asyncio-throttle
```

---

## 🧪 مرحله 3: تست سریع (5 دقیقه)

ایجاد فایل `test_proxy_quick.py`:

```python
"""
تست سریع Proxy Manager
اجرا: python test_proxy_quick.py
"""

import asyncio
import sys

# اضافه کردن path پروژه
sys.path.insert(0, '.')

from core.smart_proxy_manager_v2 import get_proxy_manager

async def quick_test():
    print("=" * 70)
    print("🚀 شروع تست Smart Proxy Manager V2")
    print("=" * 70)
    
    # Initialize
    print("\n1️⃣ در حال initialize کردن proxy manager...")
    manager = get_proxy_manager()
    await manager.initialize()
    print("✅ Proxy manager آماده است!")
    
    # تست 1: Binance
    print("\n2️⃣ تست Binance API (با proxy)...")
    try:
        data = await manager.fetch_with_proxy_rotation(
            url="https://api.binance.com/api/v3/ticker/24hr",
            provider_name="binance",
            params={"symbol": "BTCUSDT"},
            max_retries=2
        )
        
        if data and 'lastPrice' in data:
            print(f"✅ SUCCESS: BTC/USDT = ${data['lastPrice']}")
        else:
            print("⚠️ داده دریافت شد اما format متفاوت است")
            print(f"Response: {data}")
    except Exception as e:
        print(f"❌ خطا: {e}")
    
    # تست 2: CoinCap (بدون proxy)
    print("\n3️⃣ تست CoinCap API (بدون proxy)...")
    try:
        data = await manager.fetch_with_proxy_rotation(
            url="https://api.coincap.io/v2/assets/bitcoin",
            provider_name="coincap"
        )
        
        if data and 'data' in data:
            price = data['data']['priceUsd']
            print(f"✅ SUCCESS: BTC = ${float(price):,.2f}")
        else:
            print("⚠️ داده دریافت شد اما format متفاوت است")
    except Exception as e:
        print(f"❌ خطا: {e}")
    
    # Status Report
    print("\n4️⃣ گزارش وضعیت:")
    print("-" * 70)
    status = manager.get_status()
    print(f"📊 تعداد کل proxies: {status['total_proxies']}")
    print(f"✅ Proxies فعال: {status['active_proxies']}")
    print(f"📈 تعداد کل درخواست‌ها: {status['stats']['total_requests']}")
    print(f"✅ درخواست‌های موفق: {status['stats']['successful_requests']}")
    print(f"❌ درخواست‌های ناموفق: {status['stats']['failed_requests']}")
    
    if status['active_proxies'] > 0:
        print(f"\n🏆 بهترین proxy: {status['top_proxies'][0]['url']}")
        print(f"   Success Rate: {status['top_proxies'][0]['success_rate']:.1%}")
    
    print("\n" + "=" * 70)
    print("✅ تست کامل شد!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(quick_test())
```

**اجرا:**

```bash
python test_proxy_quick.py
```

**خروجی مورد انتظار:**

```
======================================================================
🚀 شروع تست Smart Proxy Manager V2
======================================================================

1️⃣ در حال initialize کردن proxy manager...
✅ Proxy manager آماده است!

2️⃣ تست Binance API (با proxy)...
✅ SUCCESS: BTC/USDT = $43250.50

3️⃣ تست CoinCap API (بدون proxy)...
✅ SUCCESS: BTC = $43,245.67

4️⃣ گزارش وضعیت:
----------------------------------------------------------------------
📊 تعداد کل proxies: 45
✅ Proxies فعال: 38
📈 تعداد کل درخواست‌ها: 2
✅ درخواست‌های موفق: 2
❌ درخواست‌های ناموفق: 0

🏆 بهترین proxy: 45.76.123.45:8080
   Success Rate: 100.0%

======================================================================
✅ تست کامل شد!
======================================================================
```

---

## 🔧 مرحله 4: ادغام سریع با Workers (5 دقیقه)

### گزینه A: ادغام با Market Data Worker

`workers/market_data_worker.py`:

```python
# در ابتدای فایل
from core.smart_proxy_manager_v2 import get_proxy_manager

# تابع قدیمی (قبل از تغییر)
async def old_fetch_binance():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.binance.com/...") as resp:
            return await resp.json()

# تابع جدید (بعد از تغییر)
async def new_fetch_binance():
    manager = get_proxy_manager()
    return await manager.fetch_with_proxy_rotation(
        url="https://api.binance.com/api/v3/ticker/24hr",
        provider_name="binance",
        params={"symbol": "BTCUSDT"}
    )
```

### گزینه B: ایجاد Wrapper Function

`workers/proxy_wrapper.py`:

```python
"""
Wrapper function برای استفاده آسان در همه workers
"""

from typing import Optional, Dict, Any
from core.smart_proxy_manager_v2 import get_proxy_manager

# Global instance
_manager = None

async def get_manager():
    """Get or initialize proxy manager"""
    global _manager
    if _manager is None:
        _manager = get_proxy_manager()
        await _manager.initialize()
    return _manager

async def fetch_with_proxy(
    url: str,
    provider: str,
    params: Optional[Dict] = None,
    **kwargs
) -> Optional[Dict[str, Any]]:
    """
    یک wrapper ساده برای fetch کردن با proxy
    
    Usage:
        data = await fetch_with_proxy(
            url="https://api.binance.com/api/v3/ticker/24hr",
            provider="binance",
            params={"symbol": "BTCUSDT"}
        )
    """
    manager = await get_manager()
    return await manager.fetch_with_proxy_rotation(
        url=url,
        provider_name=provider,
        params=params,
        **kwargs
    )
```

حالا در هر worker:

```python
from workers.proxy_wrapper import fetch_with_proxy

# استفاده
data = await fetch_with_proxy(
    url="https://api.binance.com/api/v3/ticker/24hr",
    provider="binance",
    params={"symbol": "BTCUSDT"}
)
```

---

## 🎮 مرحله 5: اجرا و مانیتور

### روش 1: اجرای مستقیم

```bash
# اجرای FastAPI
python -m uvicorn main:app --host 0.0.0.0 --port 7860 --reload
```

### روش 2: با Docker

```bash
# Build
docker build -t crypto-hub:v2 .

# Run
docker run -p 7860:7860 crypto-hub:v2
```

### بررسی Health

```bash
# API health
curl http://localhost:7860/api/health

# Proxy status
curl http://localhost:7860/api/proxy/health
```

---

## 🔍 Troubleshooting سریع

### مشکل 1: Proxy ها کار نمی‌کنند

```python
# اجرای این کد برای debug
import asyncio
from core.smart_proxy_manager_v2 import get_proxy_manager

async def debug():
    manager = get_proxy_manager()
    await manager.initialize()
    
    # بررسی تعداد proxies
    print(f"Total: {len(manager.proxies)}")
    
    # Refresh دستی
    await manager.refresh_proxies()
    
    # تست یکی از proxies
    if manager.proxies:
        result = await manager._test_proxy(manager.proxies[0])
        print(f"Test result: {result}")

asyncio.run(debug())
```

### مشکل 2: Import Error

```python
# اگر این خطا رو گرفتی:
# ImportError: cannot import name 'get_proxy_manager'

# مطمئن شو که:
# 1. فایل در مسیر درست است: core/smart_proxy_manager_v2.py
# 2. __init__.py در پوشه core وجود داره
# 3. path درست اضافه شده: sys.path.insert(0, '.')
```

### مشکل 3: Connection Timeout

```python
# افزایش timeout
from core.smart_proxy_manager_v2 import Config

# در ابتدای برنامه
Config.PROXY_TEST_TIMEOUT = 10  # از 5 به 10 افزایش
Config.PROXY_REFRESH_INTERVAL = 600  # از 300 به 600
```

---

## 📊 Monitoring Dashboard (سریع)

ایجاد یک endpoint ساده برای monitoring:

`app.py`:

```python
@app.get("/admin/proxy-dashboard")
async def proxy_dashboard():
    """Simple proxy monitoring dashboard"""
    manager = get_proxy_manager()
    status = manager.get_status()
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Proxy Dashboard</title>
        <style>
            body {{ font-family: monospace; padding: 20px; background: #1a1a1a; color: #00ff00; }}
            .stat {{ padding: 10px; margin: 5px; background: #2a2a2a; border-left: 4px solid #00ff00; }}
            .error {{ border-left-color: #ff0000; }}
        </style>
    </head>
    <body>
        <h1>🔧 Proxy Manager Dashboard</h1>
        
        <div class="stat">
            <strong>Status:</strong> {status['status']}
        </div>
        
        <div class="stat">
            <strong>Active Proxies:</strong> {status['active_proxies']} / {status['total_proxies']}
        </div>
        
        <div class="stat">
            <strong>Success Rate:</strong> 
            {status['stats']['successful_requests']} / {status['stats']['total_requests']}
            ({status['stats']['successful_requests'] / max(status['stats']['total_requests'], 1) * 100:.1f}%)
        </div>
        
        <h2>Top Proxies:</h2>
        {''.join([f'<div class="stat">{p["url"]} - {p["success_rate"]:.1%}</div>' for p in status['top_proxies'][:5]])}
        
        <p style="margin-top: 20px;">
            <a href="/admin/proxy-dashboard" style="color: #00ff00;">Refresh</a>
        </p>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html)
```

دسترسی: http://localhost:7860/admin/proxy-dashboard

---

## 🎯 Next Steps

بعد از اینکه همه چی کار کرد:

1. ✅ **Caching اضافه کن:**
   ```bash
   pip install redis
   docker run -d -p 6379:6379 redis
   ```

2. ✅ **Background Workers:**
   ```bash
   pip install apscheduler
   # افزودن scheduler برای auto-refresh proxies
   ```

3. ✅ **Monitoring:**
   ```bash
   pip install prometheus-client
   # افزودن metrics endpoints
   ```

4. ✅ **UI Upgrade:**
   ```bash
   npx create-next-app@latest crypto-dashboard
   # شروع ساخت داشبورد React
   ```

---

## 📞 پشتیبانی سریع

### سوالات متداول:

**س: چقدر طول می‌کشه تا proxies آماده بشن؟**
ج: معمولاً 10-30 ثانیه. اولین بار ممکنه 1-2 دقیقه طول بکشه.

**س: چند تا proxy نیاز دارم؟**
ج: حداقل 5-10 proxy فعال کافیه. سیستم اتوماتیک proxies رو مدیریت می‌کنه.

**س: اگه همه proxies fail شدن چی کار کنم؟**
ج: سیستم به صورت اتوماتیک هر 5 دقیقه proxies رو refresh می‌کنه. می‌تونی دستی refresh کنی:
```python
await manager.refresh_proxies()
```

**س: چطور provider جدید اضافه کنم؟**
ج: در `Config.RESTRICTED_PROVIDERS` اسم provider رو اضافه کن:
```python
Config.RESTRICTED_PROVIDERS = ["binance", "coingecko", "your_provider"]
```

---

## ✅ Final Checklist

قبل از production:

- [ ] همه تست‌ها pass شدن
- [ ] Health check کار می‌کنه
- [ ] Logging فعال است
- [ ] Environment variables تنظیم شدن
- [ ] Backup از کد قدیمی گرفتی
- [ ] Documentation بروز شده

---

## 🎉 تمام!

اگه همه مراحل رو انجام دادی، الان:
- ✅ Proxy Manager فعال و کار می‌کنه
- ✅ Binance و CoinGecko قابل دسترسی هستند
- ✅ Automatic fallback و retry فعال است
- ✅ Health monitoring در دسترس است

**موفق باشید! 🚀**
