"""
Integration Example: How to Use Smart Proxy Manager V2 with Existing Workers
===========================================================================

این فایل نشان می‌دهد چطور می‌توانید SmartProxyManagerV2 را
با worker های موجود در پروژه ادغام کنید.

مراحل ادغام:
1. جایگزینی /core/smart_proxy_manager.py با نسخه v2
2. بروزرسانی workers برای استفاده از proxy manager
3. افزودن health checks
4. تست و مانیتورینگ
"""

# ============================================================================
# STEP 1: Update requirements.txt
# ============================================================================

"""
Add these to requirements.txt:

aiohttp==3.9.1
asyncio-throttle==1.0.2
dnspython==2.4.2  # Optional for advanced DNS
"""

# ============================================================================
# STEP 2: Update Market Data Worker
# ============================================================================

"""
File: workers/market_data_worker.py
"""

import asyncio
import logging
from typing import List, Dict, Any
from datetime import datetime

# Import new proxy manager
from smart_proxy_manager_v2 import get_proxy_manager

logger = logging.getLogger(__name__)

# ====== BEFORE (OLD CODE) ======
"""
async def fetch_binance_ticker(symbol: str) -> Dict:
    url = f"https://api.binance.com/api/v3/ticker/24hr"
    params = {"symbol": symbol}
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as resp:
            return await resp.json()
"""

# ====== AFTER (NEW CODE WITH PROXY) ======

async def fetch_binance_ticker(symbol: str) -> Dict:
    """
    Fetch ticker from Binance with automatic proxy support
    """
    
    # Get proxy manager
    proxy_manager = get_proxy_manager()
    
    # Use fetch_with_proxy_rotation for automatic proxy handling
    data = await proxy_manager.fetch_with_proxy_rotation(
        url="https://api.binance.com/api/v3/ticker/24hr",
        provider_name="binance",  # This triggers proxy usage
        params={"symbol": symbol}
    )
    
    if data:
        logger.info(f"✅ Fetched Binance ticker for {symbol}")
        return data
    else:
        logger.error(f"❌ Failed to fetch Binance ticker for {symbol}")
        return None


async def fetch_coingecko_price(coin_id: str) -> Dict:
    """
    Fetch price from CoinGecko with automatic proxy support
    """
    
    proxy_manager = get_proxy_manager()
    
    data = await proxy_manager.fetch_with_proxy_rotation(
        url="https://api.coingecko.com/api/v3/simple/price",
        provider_name="coingecko",  # This triggers proxy usage
        params={
            "ids": coin_id,
            "vs_currencies": "usd",
            "include_24hr_change": "true"
        }
    )
    
    if data:
        logger.info(f"✅ Fetched CoinGecko price for {coin_id}")
        return data
    else:
        logger.error(f"❌ Failed to fetch CoinGecko price for {coin_id}")
        return None


async def fetch_coincap_price(asset_id: str) -> Dict:
    """
    Fetch from CoinCap (no proxy needed - not restricted)
    """
    
    proxy_manager = get_proxy_manager()
    
    # CoinCap is not in restricted list, so no proxy will be used
    data = await proxy_manager.fetch_with_proxy_rotation(
        url=f"https://api.coincap.io/v2/assets/{asset_id}",
        provider_name="coincap"  # Not restricted, direct connection
    )
    
    if data:
        logger.info(f"✅ Fetched CoinCap price for {asset_id}")
        return data['data']
    else:
        logger.error(f"❌ Failed to fetch CoinCap price for {asset_id}")
        return None


# ============================================================================
# STEP 3: Update OHLC Data Worker
# ============================================================================

"""
File: workers/ohlc_data_worker.py
"""

from typing import List, Dict
from smart_proxy_manager_v2 import get_proxy_manager

async def fetch_binance_klines(
    symbol: str,
    interval: str = "1h",
    limit: int = 100
) -> List[Dict]:
    """
    Fetch OHLCV data from Binance with proxy support
    
    Args:
        symbol: Trading pair (e.g., "BTCUSDT")
        interval: Candle interval (1m, 5m, 15m, 1h, 4h, 1d)
        limit: Number of candles (max 1000)
    
    Returns:
        List of OHLCV candles
    """
    
    proxy_manager = get_proxy_manager()
    
    data = await proxy_manager.fetch_with_proxy_rotation(
        url="https://api.binance.com/api/v3/klines",
        provider_name="binance",
        params={
            "symbol": symbol,
            "interval": interval,
            "limit": limit
        }
    )
    
    if not data:
        return []
    
    # Parse Binance kline format
    candles = []
    for kline in data:
        candles.append({
            "timestamp": kline[0],
            "open": float(kline[1]),
            "high": float(kline[2]),
            "low": float(kline[3]),
            "close": float(kline[4]),
            "volume": float(kline[5]),
            "provider": "binance"
        })
    
    logger.info(f"✅ Fetched {len(candles)} candles from Binance for {symbol}")
    return candles


async def fetch_coingecko_ohlc(
    coin_id: str,
    days: int = 7
) -> List[Dict]:
    """
    Fetch OHLC from CoinGecko with proxy support
    
    Args:
        coin_id: CoinGecko coin ID (e.g., "bitcoin")
        days: Number of days (1, 7, 14, 30, 90, 180, 365)
    
    Returns:
        List of OHLC candles
    """
    
    proxy_manager = get_proxy_manager()
    
    data = await proxy_manager.fetch_with_proxy_rotation(
        url=f"https://api.coingecko.com/api/v3/coins/{coin_id}/ohlc",
        provider_name="coingecko",
        params={
            "vs_currency": "usd",
            "days": days
        }
    )
    
    if not data:
        return []
    
    # Parse CoinGecko OHLC format
    candles = []
    for candle in data:
        candles.append({
            "timestamp": candle[0],
            "open": candle[1],
            "high": candle[2],
            "low": candle[3],
            "close": candle[4],
            "provider": "coingecko"
        })
    
    logger.info(f"✅ Fetched {len(candles)} candles from CoinGecko for {coin_id}")
    return candles


# ============================================================================
# STEP 4: Create Unified Data Collector with Fallback
# ============================================================================

"""
File: workers/unified_collector.py
"""

from typing import Dict, List, Optional
from smart_proxy_manager_v2 import get_proxy_manager

class UnifiedDataCollector:
    """
    Unified collector with automatic fallback between providers
    """
    
    def __init__(self):
        self.proxy_manager = get_proxy_manager()
    
    async def get_price(
        self,
        symbol: str,
        providers: List[str] = None
    ) -> Optional[Dict]:
        """
        Get price with automatic fallback
        
        Args:
            symbol: Asset symbol (e.g., "BTC", "ETH")
            providers: List of providers to try (in order)
        
        Returns:
            Price data or None
        """
        
        if providers is None:
            providers = ["binance", "coingecko", "coincap"]
        
        for provider in providers:
            try:
                if provider == "binance":
                    data = await self._get_binance_price(symbol)
                elif provider == "coingecko":
                    data = await self._get_coingecko_price(symbol)
                elif provider == "coincap":
                    data = await self._get_coincap_price(symbol)
                else:
                    continue
                
                if data:
                    logger.info(f"✅ Got price from {provider}: {data}")
                    return data
            
            except Exception as e:
                logger.warning(f"⚠️ Provider {provider} failed: {e}")
                continue
        
        logger.error(f"❌ All providers failed for {symbol}")
        return None
    
    async def _get_binance_price(self, symbol: str) -> Optional[Dict]:
        """Get price from Binance"""
        
        # Convert symbol to Binance format
        binance_symbol = f"{symbol}USDT"
        
        data = await self.proxy_manager.fetch_with_proxy_rotation(
            url="https://api.binance.com/api/v3/ticker/24hr",
            provider_name="binance",
            params={"symbol": binance_symbol}
        )
        
        if data:
            return {
                "symbol": symbol,
                "price": float(data["lastPrice"]),
                "change_24h": float(data["priceChangePercent"]),
                "volume_24h": float(data["volume"]),
                "provider": "binance",
                "timestamp": data["closeTime"]
            }
        
        return None
    
    async def _get_coingecko_price(self, symbol: str) -> Optional[Dict]:
        """Get price from CoinGecko"""
        
        # Map symbols to CoinGecko IDs
        symbol_map = {
            "BTC": "bitcoin",
            "ETH": "ethereum",
            "BNB": "binancecoin",
            "XRP": "ripple",
            # Add more mappings
        }
        
        coin_id = symbol_map.get(symbol.upper())
        if not coin_id:
            return None
        
        data = await self.proxy_manager.fetch_with_proxy_rotation(
            url="https://api.coingecko.com/api/v3/simple/price",
            provider_name="coingecko",
            params={
                "ids": coin_id,
                "vs_currencies": "usd",
                "include_24hr_change": "true",
                "include_24hr_vol": "true"
            }
        )
        
        if data and coin_id in data:
            coin_data = data[coin_id]
            return {
                "symbol": symbol,
                "price": coin_data["usd"],
                "change_24h": coin_data.get("usd_24h_change", 0),
                "volume_24h": coin_data.get("usd_24h_vol", 0),
                "provider": "coingecko",
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        
        return None
    
    async def _get_coincap_price(self, symbol: str) -> Optional[Dict]:
        """Get price from CoinCap"""
        
        # CoinCap uses lowercase asset IDs
        asset_id = symbol.lower()
        
        data = await self.proxy_manager.fetch_with_proxy_rotation(
            url=f"https://api.coincap.io/v2/assets/{asset_id}",
            provider_name="coincap"
        )
        
        if data and "data" in data:
            asset = data["data"]
            return {
                "symbol": symbol,
                "price": float(asset["priceUsd"]),
                "change_24h": float(asset.get("changePercent24Hr", 0)),
                "volume_24h": float(asset.get("volumeUsd24Hr", 0)),
                "provider": "coincap",
                "timestamp": int(datetime.now().timestamp() * 1000)
            }
        
        return None


# ============================================================================
# STEP 5: Add to FastAPI/Flask App
# ============================================================================

"""
File: app.py or fastapi_app.py
"""

from fastapi import FastAPI, HTTPException
from smart_proxy_manager_v2 import get_proxy_manager

app = FastAPI()

# Initialize proxy manager on startup
@app.on_event("startup")
async def startup_event():
    """Initialize proxy manager when app starts"""
    proxy_manager = get_proxy_manager()
    await proxy_manager.initialize()
    logger.info("✅ Proxy Manager initialized")


# Health check endpoint
@app.get("/api/proxy/health")
async def proxy_health():
    """Get proxy manager health status"""
    proxy_manager = get_proxy_manager()
    return proxy_manager.get_status()


# Refresh proxies endpoint
@app.post("/api/proxy/refresh")
async def refresh_proxies():
    """Manually trigger proxy refresh"""
    proxy_manager = get_proxy_manager()
    await proxy_manager.refresh_proxies()
    return {"message": "Proxy list refreshed", "status": proxy_manager.get_status()}


# DNS resolution endpoint
@app.get("/api/dns/resolve/{hostname}")
async def resolve_dns(hostname: str):
    """Resolve hostname using DoH"""
    proxy_manager = get_proxy_manager()
    ip = await proxy_manager.resolve_hostname(hostname)
    
    if ip:
        return {"hostname": hostname, "ip": ip}
    else:
        raise HTTPException(status_code=404, detail="DNS resolution failed")


# Price endpoint with automatic fallback
@app.get("/api/price/{symbol}")
async def get_price(symbol: str):
    """
    Get price with automatic provider fallback
    """
    collector = UnifiedDataCollector()
    price_data = await collector.get_price(symbol)
    
    if price_data:
        return price_data
    else:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to fetch price for {symbol} from any provider"
        )


# ============================================================================
# STEP 6: Testing Script
# ============================================================================

"""
File: test_proxy_integration.py
"""

import asyncio
from smart_proxy_manager_v2 import get_proxy_manager

async def test_integration():
    """Test proxy manager integration"""
    
    print("=" * 80)
    print("Testing Smart Proxy Manager V2 Integration")
    print("=" * 80)
    
    # Initialize
    manager = get_proxy_manager()
    await manager.initialize()
    
    # Test 1: Binance
    print("\n[TEST 1] Fetching from Binance...")
    data = await manager.fetch_with_proxy_rotation(
        url="https://api.binance.com/api/v3/ticker/24hr",
        provider_name="binance",
        params={"symbol": "BTCUSDT"}
    )
    if data:
        print(f"✅ SUCCESS: BTC price = ${data['lastPrice']}")
    else:
        print("❌ FAILED")
    
    # Test 2: CoinGecko
    print("\n[TEST 2] Fetching from CoinGecko...")
    data = await manager.fetch_with_proxy_rotation(
        url="https://api.coingecko.com/api/v3/simple/price",
        provider_name="coingecko",
        params={"ids": "bitcoin", "vs_currencies": "usd"}
    )
    if data:
        print(f"✅ SUCCESS: BTC price = ${data['bitcoin']['usd']}")
    else:
        print("❌ FAILED")
    
    # Test 3: CoinCap (no proxy)
    print("\n[TEST 3] Fetching from CoinCap (no proxy)...")
    data = await manager.fetch_with_proxy_rotation(
        url="https://api.coincap.io/v2/assets/bitcoin",
        provider_name="coincap"
    )
    if data:
        print(f"✅ SUCCESS: BTC price = ${data['data']['priceUsd']}")
    else:
        print("❌ FAILED")
    
    # Test 4: DNS Resolution
    print("\n[TEST 4] DNS Resolution...")
    ip = await manager.resolve_hostname("api.binance.com")
    if ip:
        print(f"✅ SUCCESS: api.binance.com = {ip}")
    else:
        print("❌ FAILED")
    
    # Test 5: Status Report
    print("\n[TEST 5] Status Report")
    print("=" * 80)
    status = manager.get_status()
    print(f"Status: {status['status']}")
    print(f"Total Proxies: {status['total_proxies']}")
    print(f"Active Proxies: {status['active_proxies']}")
    print(f"Total Requests: {status['stats']['total_requests']}")
    print(f"Successful: {status['stats']['successful_requests']}")
    print(f"Failed: {status['stats']['failed_requests']}")
    
    if status['top_proxies']:
        print("\nTop 3 Proxies:")
        for i, proxy in enumerate(status['top_proxies'][:3], 1):
            print(f"  {i}. {proxy['url']} - Success Rate: {proxy['success_rate']:.1%}")


if __name__ == "__main__":
    asyncio.run(test_integration())


# ============================================================================
# STEP 7: Environment Configuration
# ============================================================================

"""
Create .env file with:

# Proxy Settings
PROXY_REFRESH_INTERVAL=300  # 5 minutes
PROXY_TEST_TIMEOUT=5
PROXY_MAX_FAILURES=3

# DNS Settings
DNS_CACHE_TTL=300
DNS_TIMEOUT=5

# Restricted Providers (comma-separated)
RESTRICTED_PROVIDERS=binance,coingecko,coinmarketcap

# Enabled Proxy Providers
ENABLED_PROXY_PROVIDERS=proxyscrape,proxylist,geonode
"""


# ============================================================================
# SUMMARY: Migration Checklist
# ============================================================================

"""
✅ MIGRATION CHECKLIST:

1. [ ] Replace /core/smart_proxy_manager.py with smart_proxy_manager_v2.py
2. [ ] Update requirements.txt with new dependencies
3. [ ] Update workers/market_data_worker.py
4. [ ] Update workers/ohlc_data_worker.py
5. [ ] Create workers/unified_collector.py
6. [ ] Add proxy health endpoints to API
7. [ ] Initialize proxy manager on app startup
8. [ ] Run test_proxy_integration.py
9. [ ] Update documentation
10. [ ] Deploy and monitor

TESTING:
- [ ] Test Binance API access with proxy
- [ ] Test CoinGecko API access with proxy
- [ ] Test non-restricted providers (direct connection)
- [ ] Test DNS over HTTPS
- [ ] Test proxy rotation on failures
- [ ] Test health checks
- [ ] Load testing

MONITORING:
- [ ] Set up alerts for proxy failures
- [ ] Monitor success rates
- [ ] Track response times
- [ ] Monitor provider availability
"""
