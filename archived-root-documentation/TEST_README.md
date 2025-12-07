# راهنمای استفاده از فایل تست API

## 🔧 مشکلات احتمالی و راه حل‌ها

### 1. مشکل URL Space

**مشکل:** فایل تست از URL اشتباه استفاده می‌کند.

**راه حل:**
- اگر Space شما `really-amin-datasourceforcryptocurrency.hf.space` است (بدون `-2`):
  ```python
  BASE_URL = "https://really-amin-datasourceforcryptocurrency.hf.space"
  ```

- اگر Space شما `really-amin-datasourceforcryptocurrency-2.hf.space` است (با `-2`):
  ```python
  BASE_URL = "https://really-amin-datasourceforcryptocurrency-2.hf.space"
  ```

**چک کنید:**
1. به HuggingFace Spaces بروید
2. Space خود را باز کنید
3. URL را از address bar کپی کنید

---

### 2. مشکل Timeout

**مشکل:** درخواست‌ها timeout می‌شوند.

**راه حل:**
در فایل `smoke_test_all_endpoints_fixed.py`:
```python
REQUEST_TIMEOUT = 30  # افزایش دهید به 60 یا بیشتر
```

**نکته:** Spaceهای HuggingFace ممکن است کند باشند، خصوصاً در اولین درخواست.

---

### 3. مشکل Rate Limiting

**مشکل:** تعداد زیادی درخواست در زمان کوتاه.

**راه حل:**
- بین تست‌ها delay اضافه کنید
- یا تعداد endpointها را کم کنید

```python
# در تابع main، بعد از هر تست:
time.sleep(1)  # 1 ثانیه تاخیر
```

---

### 4. مشکل Endpoint وجود ندارد

**مشکل:** برخی endpointها ممکن است در Space شما پیاده‌سازی نشده باشند.

**راه حل:**
1. ابتدا فقط endpointهای اصلی را تست کنید:
   ```python
   ENDPOINTS = [
       ("GET", "/api/health", None, "Health check"),
       ("GET", "/api/market", {"limit": 10}, "Market snapshot"),
       ("GET", "/api/news/latest", {"symbol": "BTC", "limit": 5}, "Latest news"),
   ]
   ```

2. اگر Space شما endpoint خاصی ندارد، آن را از لیست حذف کنید.

---

### 5. مشکل CORS یا Authentication

**مشکل:** برخی endpointها نیاز به authentication دارند.

**راه حل:**
اگر endpoint خاصی نیاز به API key دارد:
```python
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "User-Agent": "CryptoAPI-SmokeTest/1.0",
    "Accept": "application/json"
}
```

---

### 6. مشکل Space در حال Sleep است

**مشکل:** Spaceهای HuggingFace بعد از مدتی غیرفعالی sleep می‌شوند.

**راه حل:**
1. ابتدا یک درخواست ساده بزنید تا Space بیدار شود:
   ```bash
   curl https://your-space.hf.space/api/health
   ```

2. سپس فایل تست را اجرا کنید.

---

## 📋 مراحل استفاده

### مرحله 1: نصب کتابخانه‌ها

```bash
pip install requests
```

### مرحله 2: تنظیم URL

فایل `smoke_test_all_endpoints_fixed.py` را باز کنید و URL را اصلاح کنید:

```python
BASE_URL = "https://really-amin-datasourceforcryptocurrency.hf.space"
# یا
BASE_URL = "https://really-amin-datasourceforcryptocurrency-2.hf.space"
```

### مرحله 3: اجرای تست

```bash
python smoke_test_all_endpoints_fixed.py
```

### مرحله 4: بررسی نتایج

نتایج در فایل `api_smoke_test_results.json` ذخیره می‌شود.

---

## 🔍 تشخیص مشکلات

### اگر همه endpointها fail شدند:

1. **چک کنید Space در دسترس است:**
   ```bash
   curl https://your-space.hf.space/api/health
   ```

2. **چک کنید URL درست است:**
   - به HuggingFace Spaces بروید
   - Space را باز کنید
   - URL را از address bar کپی کنید

3. **چک کنید Space در حال اجرا است:**
   - به Space بروید
   - اگر "This Space is sleeping" می‌بینید، روی "Wake up" کلیک کنید

### اگر برخی endpointها fail شدند:

1. **چک کنید endpoint وجود دارد:**
   - به `/docs` بروید: `https://your-space.hf.space/docs`
   - لیست endpointها را ببینید

2. **چک کنید پارامترها درست هستند:**
   - در Swagger UI (`/docs`) endpoint را تست کنید
   - ببینید چه پارامترهایی نیاز دارد

3. **چک کنید rate limiting:**
   - اگر خیلی سریع درخواست می‌زنید، delay اضافه کنید

---

## 📊 مثال خروجی موفق

```
======================================================================
🚀 Crypto API Smoke Test
======================================================================
Base URL: https://really-amin-datasourceforcryptocurrency.hf.space
Total Endpoints: 25
Timeout: 30s
Retries: 2
======================================================================

[1/25] Testing: GET /api/health
  Description: Health check
  URL: https://really-amin-datasourceforcryptocurrency.hf.space/api/health
  ✅ PASS (Status: 200)

[2/25] Testing: GET /api/service/rate
  Description: Get single rate
  URL: https://really-amin-datasourceforcryptocurrency.hf.space/api/service/rate?pair=BTC/USDT
  Params: {'pair': 'BTC/USDT'}
  ✅ PASS (Status: 200)

...

======================================================================
📊 SUMMARY
======================================================================
Total Endpoints: 25
✅ Passed: 20
❌ Failed: 5
⏱️  Time Elapsed: 45.32s
📈 Success Rate: 80.0%
======================================================================
```

---

## 🛠️ تنظیمات پیشرفته

### افزایش Timeout

```python
REQUEST_TIMEOUT = 60  # برای endpointهای سنگین
```

### افزایش Retry

```python
RETRY_COUNT = 3  # تعداد تلاش‌های بیشتر
RETRY_DELAY = 3  # تاخیر بیشتر بین تلاش‌ها
```

### اضافه کردن Delay بین تست‌ها

در تابع `main()` بعد از `test_endpoint()`:
```python
time.sleep(0.5)  # نیم ثانیه تاخیر
```

---

## 📝 نکات مهم

1. **اول تست ساده:** ابتدا فقط `/api/health` را تست کنید
2. **تدریجی اضافه کنید:** اگر health کار کرد، بقیه را اضافه کنید
3. **لاگ‌ها را چک کنید:** اگر Space شما لاگ دارد، آن را بررسی کنید
4. **Swagger UI:** از `/docs` برای تست دستی استفاده کنید

---

## ❓ سوالات متداول

**Q: چرا همه endpointها 404 می‌دهند؟**
A: احتمالاً URL اشتباه است یا Space در حال اجرا نیست.

**Q: چرا timeout می‌شود؟**
A: Space ممکن است کند باشد یا sleep باشد. Timeout را افزایش دهید.

**Q: چرا برخی endpointها 500 می‌دهند؟**
A: ممکن است endpoint پیاده‌سازی نشده باشد یا خطا در backend باشد.

**Q: چطور بفهمم کدام endpointها موجود هستند؟**
A: به `/docs` بروید و لیست endpointها را ببینید.

---

**موفق باشید! 🚀**

