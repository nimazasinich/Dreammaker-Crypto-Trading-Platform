"""
Smart Proxy Manager v2.0 - Production Ready
============================================

کد کامل و عملیاتی برای مدیریت Proxy و DNS هوشمند
مخصوص دسترسی به Binance و CoinGecko از کشورهای تحریم‌شده

Features:
- ✅ Auto-fetch proxies from multiple free providers
- ✅ DNS over HTTPS (DoH) support
- ✅ Health checking and auto-rotation
- ✅ Load balancing based on success rate
- ✅ Circuit breaker pattern
- ✅ Comprehensive logging
- ✅ Metrics tracking

Usage:
    from smart_proxy_manager_v2 import get_proxy_manager
    
    proxy_manager = get_proxy_manager()
    await proxy_manager.initialize()
    
    # Get proxy for restricted provider
    proxy = await proxy_manager.get_proxy_for_provider("binance")
    
    # Fetch data with automatic proxy rotation
    data = await proxy_manager.fetch_with_proxy_rotation(
        "https://api.binance.com/api/v3/ticker/24hr",
        params={"symbol": "BTCUSDT"}
    )
"""

import aiohttp
import asyncio
import logging
import random
import time
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json
from collections import defaultdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# Configuration
# ============================================================================

class Config:
    """Configuration for Proxy Manager"""
    
    # Proxy settings
    PROXY_REFRESH_INTERVAL = 300  # 5 minutes
    PROXY_TEST_TIMEOUT = 5  # seconds
    PROXY_MAX_FAILURES = 3  # Deactivate after 3 failures
    PROXY_TEST_URL = "https://httpbin.org/ip"
    
    # DNS settings
    DNS_CACHE_TTL = 300  # 5 minutes
    DNS_TIMEOUT = 5  # seconds
    
    # Rate limiting
    MAX_REQUESTS_PER_MINUTE = 60
    
    # Restricted providers (need proxy)
    RESTRICTED_PROVIDERS = ["binance", "coingecko", "coinmarketcap"]
    
    # Proxy providers to use
    ENABLED_PROXY_PROVIDERS = [
        "proxyscrape",
        "proxylist",
        "geonode"
    ]


# ============================================================================
# Data Models
# ============================================================================

@dataclass
class ProxyInfo:
    """Proxy server information"""
    url: str
    protocol: str = "http"
    country: str = "unknown"
    anonymity: str = "unknown"
    
    # Performance metrics
    success_count: int = 0
    failure_count: int = 0
    total_response_time: float = 0.0
    last_used: Optional[datetime] = None
    last_tested: Optional[datetime] = None
    
    # Status
    is_active: bool = True
    is_testing: bool = False
    
    def get_proxy_url(self) -> str:
        """Get formatted proxy URL"""
        return f"{self.protocol}://{self.url}"
    
    def get_success_rate(self) -> float:
        """Calculate success rate"""
        total = self.success_count + self.failure_count
        if total == 0:
            return 0.0
        return self.success_count / total
    
    def get_avg_response_time(self) -> float:
        """Get average response time"""
        if self.success_count == 0:
            return float('inf')
        return self.total_response_time / self.success_count
    
    def record_success(self, response_time: float):
        """Record successful request"""
        self.success_count += 1
        self.total_response_time += response_time
        self.last_used = datetime.now()
        
        # Reset failure count on success
        if self.failure_count > 0:
            self.failure_count = max(0, self.failure_count - 1)
    
    def record_failure(self):
        """Record failed request"""
        self.failure_count += 1
        self.last_used = datetime.now()
        
        # Deactivate if too many failures
        if self.failure_count >= Config.PROXY_MAX_FAILURES:
            self.is_active = False
            logger.warning(f"⚠️ Proxy {self.url} deactivated due to failures")


@dataclass
class DNSCache:
    """DNS cache entry"""
    hostname: str
    ip: str
    cached_at: datetime
    ttl: int = 300  # seconds
    
    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        age = (datetime.now() - self.cached_at).total_seconds()
        return age > self.ttl


# ============================================================================
# Proxy Providers
# ============================================================================

class ProxyProvider:
    """Base class for proxy providers"""
    
    async def fetch_proxies(self) -> List[Dict[str, str]]:
        """Fetch proxy list from provider"""
        raise NotImplementedError
    
    def parse_proxy(self, proxy_data: Dict) -> Optional[ProxyInfo]:
        """Parse proxy data to ProxyInfo"""
        try:
            return ProxyInfo(
                url=f"{proxy_data['ip']}:{proxy_data['port']}",
                protocol=proxy_data.get('protocol', 'http'),
                country=proxy_data.get('country', 'unknown'),
                anonymity=proxy_data.get('anonymity', 'unknown')
            )
        except KeyError:
            return None


class ProxyScrapeProvider(ProxyProvider):
    """
    ProxyScrape.com - Free proxy provider
    Docs: https://docs.proxyscrape.com/
    """
    
    BASE_URL = "https://api.proxyscrape.com/v2/"
    
    async def fetch_proxies(self) -> List[Dict[str, str]]:
        """Fetch proxies from ProxyScrape"""
        
        params = {
            "request": "displayproxies",
            "protocol": "http",
            "timeout": "5000",
            "country": "all",
            "ssl": "all",
            "anonymity": "elite"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.BASE_URL,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    text = await resp.text()
                    
                    proxies = []
                    for line in text.split('\n'):
                        line = line.strip()
                        if ':' in line:
                            ip, port = line.split(':')
                            proxies.append({
                                'ip': ip,
                                'port': port,
                                'protocol': 'http',
                                'country': 'unknown',
                                'anonymity': 'elite'
                            })
                    
                    logger.info(f"✅ ProxyScrape: Fetched {len(proxies)} proxies")
                    return proxies
        
        except Exception as e:
            logger.error(f"❌ ProxyScrape fetch failed: {e}")
            return []


class GeonodeProvider(ProxyProvider):
    """
    Geonode.com - Free proxy API
    Docs: https://proxylist.geonode.com/api/proxy-list
    """
    
    BASE_URL = "https://proxylist.geonode.com/api/proxy-list"
    
    async def fetch_proxies(self) -> List[Dict[str, str]]:
        """Fetch proxies from Geonode"""
        
        params = {
            "limit": 100,
            "page": 1,
            "sort_by": "lastChecked",
            "sort_type": "desc",
            "protocols": "http,https"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.BASE_URL,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as resp:
                    data = await resp.json()
                    
                    proxies = []
                    for item in data.get('data', []):
                        proxies.append({
                            'ip': item['ip'],
                            'port': str(item['port']),
                            'protocol': item['protocols'][0] if item['protocols'] else 'http',
                            'country': item.get('country', 'unknown'),
                            'anonymity': item.get('anonymityLevel', 'unknown')
                        })
                    
                    logger.info(f"✅ Geonode: Fetched {len(proxies)} proxies")
                    return proxies
        
        except Exception as e:
            logger.error(f"❌ Geonode fetch failed: {e}")
            return []


class ProxyListProvider(ProxyProvider):
    """
    Free proxy lists from GitHub
    """
    
    GITHUB_URLS = [
        "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
        "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt",
        "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt"
    ]
    
    async def fetch_proxies(self) -> List[Dict[str, str]]:
        """Fetch proxies from GitHub lists"""
        
        all_proxies = []
        
        async with aiohttp.ClientSession() as session:
            for url in self.GITHUB_URLS:
                try:
                    async with session.get(
                        url,
                        timeout=aiohttp.ClientTimeout(total=10)
                    ) as resp:
                        text = await resp.text()
                        
                        for line in text.split('\n'):
                            line = line.strip()
                            if ':' in line:
                                ip, port = line.split(':')
                                all_proxies.append({
                                    'ip': ip,
                                    'port': port,
                                    'protocol': 'http',
                                    'country': 'unknown',
                                    'anonymity': 'unknown'
                                })
                
                except Exception as e:
                    logger.debug(f"Failed to fetch from {url}: {e}")
                    continue
        
        logger.info(f"✅ ProxyList: Fetched {len(all_proxies)} proxies")
        return all_proxies


# ============================================================================
# DNS over HTTPS
# ============================================================================

class DNSOverHTTPS:
    """
    DNS over HTTPS (DoH) implementation
    Supports Cloudflare and Google DNS
    """
    
    PROVIDERS = {
        "cloudflare": "https://cloudflare-dns.com/dns-query",
        "google": "https://dns.google/resolve",
        "quad9": "https://dns.quad9.net/dns-query"
    }
    
    def __init__(self):
        self.cache: Dict[str, DNSCache] = {}
    
    async def resolve(
        self,
        hostname: str,
        provider: str = "cloudflare",
        use_cache: bool = True
    ) -> Optional[str]:
        """
        Resolve hostname to IP using DoH
        
        Args:
            hostname: Domain to resolve
            provider: DNS provider to use
            use_cache: Use cached result if available
        
        Returns:
            IP address or None
        """
        
        # Check cache first
        if use_cache and hostname in self.cache:
            entry = self.cache[hostname]
            if not entry.is_expired():
                logger.debug(f"🔍 DNS Cache hit: {hostname} -> {entry.ip}")
                return entry.ip
        
        # Resolve using DoH
        url = self.PROVIDERS.get(provider, self.PROVIDERS["cloudflare"])
        
        params = {
            "name": hostname,
            "type": "A"
        }
        
        headers = {
            "accept": "application/dns-json"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=Config.DNS_TIMEOUT)
                ) as resp:
                    data = await resp.json()
                    
                    if "Answer" in data and len(data["Answer"]) > 0:
                        ip = data["Answer"][0]["data"]
                        
                        # Cache the result
                        self.cache[hostname] = DNSCache(
                            hostname=hostname,
                            ip=ip,
                            cached_at=datetime.now(),
                            ttl=Config.DNS_CACHE_TTL
                        )
                        
                        logger.info(f"🔍 DoH resolved: {hostname} -> {ip} (via {provider})")
                        return ip
                    
                    logger.warning(f"⚠️ No DNS answer for {hostname}")
                    return None
        
        except Exception as e:
            logger.error(f"❌ DoH resolution failed for {hostname}: {e}")
            
            # Try fallback provider
            if provider != "google":
                logger.info("🔄 Trying fallback DNS provider (Google)")
                return await self.resolve(hostname, provider="google", use_cache=False)
            
            return None
    
    def clear_cache(self):
        """Clear DNS cache"""
        self.cache.clear()
        logger.info("🗑️ DNS cache cleared")


# ============================================================================
# Main Proxy Manager
# ============================================================================

class SmartProxyManagerV2:
    """
    Smart Proxy Manager with auto-refresh and health checking
    """
    
    def __init__(self):
        # Providers
        self.proxy_providers: List[ProxyProvider] = []
        self._init_proxy_providers()
        
        # Proxies
        self.proxies: List[ProxyInfo] = []
        self.last_refresh: Optional[datetime] = None
        
        # DNS
        self.doh = DNSOverHTTPS()
        
        # Stats
        self.stats = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "proxy_rotations": 0
        }
        
        # Rate limiting
        self.request_times: Dict[str, List[float]] = defaultdict(list)
        
        logger.info("✅ SmartProxyManagerV2 initialized")
    
    def _init_proxy_providers(self):
        """Initialize proxy providers based on config"""
        
        provider_map = {
            "proxyscrape": ProxyScrapeProvider,
            "proxylist": ProxyListProvider,
            "geonode": GeonodeProvider
        }
        
        for provider_name in Config.ENABLED_PROXY_PROVIDERS:
            if provider_name in provider_map:
                self.proxy_providers.append(provider_map[provider_name]())
        
        logger.info(f"📋 Loaded {len(self.proxy_providers)} proxy providers")
    
    async def initialize(self):
        """Initialize proxy manager - fetch and test proxies"""
        logger.info("🚀 Initializing Proxy Manager...")
        await self.refresh_proxies()
        logger.info("✅ Proxy Manager ready!")
    
    async def refresh_proxies(self):
        """Refresh proxy list from all providers"""
        
        logger.info("🔄 Refreshing proxy list...")
        start_time = time.time()
        
        # Fetch from all providers
        all_proxy_data = []
        
        tasks = [provider.fetch_proxies() for provider in self.proxy_providers]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, list):
                all_proxy_data.extend(result)
        
        logger.info(f"📥 Fetched {len(all_proxy_data)} total proxies")
        
        # Convert to ProxyInfo objects
        new_proxies = []
        for data in all_proxy_data:
            proxy_info = self.proxy_providers[0].parse_proxy(data)
            if proxy_info:
                new_proxies.append(proxy_info)
        
        # Remove duplicates
        unique_proxies = {}
        for proxy in new_proxies:
            if proxy.url not in unique_proxies:
                unique_proxies[proxy.url] = proxy
        
        new_proxies = list(unique_proxies.values())
        logger.info(f"🔍 {len(new_proxies)} unique proxies")
        
        # Test proxies (sample for speed)
        sample_size = min(50, len(new_proxies))
        sample_proxies = random.sample(new_proxies, sample_size)
        
        logger.info(f"🧪 Testing {sample_size} random proxies...")
        working_proxies = await self._test_proxies(sample_proxies)
        
        # Update proxy list
        self.proxies = working_proxies
        self.last_refresh = datetime.now()
        
        elapsed = time.time() - start_time
        logger.info(
            f"✅ Proxy refresh complete: {len(self.proxies)} working proxies "
            f"({elapsed:.1f}s)"
        )
    
    async def _test_proxy(self, proxy: ProxyInfo) -> bool:
        """Test if proxy is working"""
        
        if proxy.is_testing:
            return False
        
        proxy.is_testing = True
        
        try:
            start_time = time.time()
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    Config.PROXY_TEST_URL,
                    proxy=proxy.get_proxy_url(),
                    timeout=aiohttp.ClientTimeout(total=Config.PROXY_TEST_TIMEOUT)
                ) as resp:
                    if resp.status == 200:
                        response_time = time.time() - start_time
                        proxy.record_success(response_time)
                        proxy.last_tested = datetime.now()
                        proxy.is_testing = False
                        
                        logger.debug(f"✅ Proxy {proxy.url} OK ({response_time:.2f}s)")
                        return True
            
            proxy.record_failure()
            proxy.is_testing = False
            return False
        
        except Exception as e:
            proxy.record_failure()
            proxy.is_testing = False
            logger.debug(f"❌ Proxy {proxy.url} failed: {e}")
            return False
    
    async def _test_proxies(self, proxies: List[ProxyInfo]) -> List[ProxyInfo]:
        """Test multiple proxies concurrently"""
        
        tasks = [self._test_proxy(proxy) for proxy in proxies]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        working = [
            proxy for proxy, result in zip(proxies, results)
            if result is True
        ]
        
        return working
    
    def _should_refresh(self) -> bool:
        """Check if proxies should be refreshed"""
        
        if not self.last_refresh:
            return True
        
        age = (datetime.now() - self.last_refresh).total_seconds()
        return age > Config.PROXY_REFRESH_INTERVAL
    
    async def get_proxy_for_provider(self, provider_name: str) -> Optional[str]:
        """
        Get proxy URL for provider
        
        Returns None if provider doesn't need proxy
        Returns proxy URL if provider is restricted
        """
        
        # Check if provider needs proxy
        if provider_name.lower() not in Config.RESTRICTED_PROVIDERS:
            logger.debug(f"ℹ️ Provider {provider_name} doesn't need proxy")
            return None
        
        # Refresh if needed
        if self._should_refresh():
            await self.refresh_proxies()
        
        # Get active proxies
        active_proxies = [p for p in self.proxies if p.is_active]
        
        if not active_proxies:
            logger.warning("⚠️ No active proxies available!")
            return None
        
        # Sort by success rate and response time
        active_proxies.sort(
            key=lambda p: (
                p.get_success_rate(),
                -p.get_avg_response_time()
            ),
            reverse=True
        )
        
        # Get best proxy
        best_proxy = active_proxies[0]
        
        logger.debug(
            f"🔄 Selected proxy for {provider_name}: {best_proxy.url} "
            f"(success rate: {best_proxy.get_success_rate():.1%})"
        )
        
        return best_proxy.get_proxy_url()
    
    async def fetch_with_proxy_rotation(
        self,
        url: str,
        provider_name: str = "unknown",
        max_retries: int = 3,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch URL with automatic proxy rotation on failure
        
        Args:
            url: URL to fetch
            provider_name: Name of provider (for routing decision)
            max_retries: Maximum retry attempts
            **kwargs: Additional arguments for aiohttp
        
        Returns:
            JSON response or None
        """
        
        self.stats["total_requests"] += 1
        
        for attempt in range(max_retries):
            # Get proxy (or None for non-restricted providers)
            proxy_url = await self.get_proxy_for_provider(provider_name)
            
            try:
                start_time = time.time()
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        url,
                        proxy=proxy_url,
                        timeout=aiohttp.ClientTimeout(total=15),
                        **kwargs
                    ) as resp:
                        resp.raise_for_status()
                        
                        response_time = time.time() - start_time
                        
                        # Record success
                        if proxy_url:
                            for proxy in self.proxies:
                                if proxy.get_proxy_url() == proxy_url:
                                    proxy.record_success(response_time)
                                    break
                        
                        self.stats["successful_requests"] += 1
                        
                        # Parse response
                        content_type = resp.headers.get('Content-Type', '')
                        if 'application/json' in content_type:
                            return await resp.json()
                        else:
                            return {"text": await resp.text()}
            
            except Exception as e:
                logger.warning(
                    f"⚠️ Request failed (attempt {attempt + 1}/{max_retries}): {e}"
                )
                
                # Record failure
                if proxy_url:
                    for proxy in self.proxies:
                        if proxy.get_proxy_url() == proxy_url:
                            proxy.record_failure()
                            break
                    
                    self.stats["proxy_rotations"] += 1
                
                # Last attempt failed
                if attempt == max_retries - 1:
                    self.stats["failed_requests"] += 1
                    logger.error(f"❌ All {max_retries} attempts failed for {url}")
                    return None
                
                # Wait before retry
                await asyncio.sleep(1 * (attempt + 1))
        
        return None
    
    async def resolve_hostname(self, hostname: str) -> Optional[str]:
        """Resolve hostname using DoH"""
        return await self.doh.resolve(hostname)
    
    def get_status(self) -> Dict[str, Any]:
        """Get proxy manager status"""
        
        active_proxies = [p for p in self.proxies if p.is_active]
        
        return {
            "status": "healthy" if active_proxies else "degraded",
            "total_proxies": len(self.proxies),
            "active_proxies": len(active_proxies),
            "inactive_proxies": len(self.proxies) - len(active_proxies),
            "last_refresh": self.last_refresh.isoformat() if self.last_refresh else None,
            "stats": self.stats,
            "top_proxies": [
                {
                    "url": p.url,
                    "success_rate": p.get_success_rate(),
                    "avg_response_time": p.get_avg_response_time(),
                    "country": p.country
                }
                for p in sorted(
                    active_proxies,
                    key=lambda x: x.get_success_rate(),
                    reverse=True
                )[:5]
            ]
        }


# ============================================================================
# Global Instance
# ============================================================================

_proxy_manager: Optional[SmartProxyManagerV2] = None


def get_proxy_manager() -> SmartProxyManagerV2:
    """Get global proxy manager instance"""
    global _proxy_manager
    if _proxy_manager is None:
        _proxy_manager = SmartProxyManagerV2()
    return _proxy_manager


# ============================================================================
# Usage Examples
# ============================================================================

async def example_usage():
    """Example usage of SmartProxyManagerV2"""
    
    # Initialize
    manager = get_proxy_manager()
    await manager.initialize()
    
    # Example 1: Fetch from Binance (needs proxy)
    print("\n" + "="*60)
    print("Example 1: Fetch from Binance")
    print("="*60)
    
    data = await manager.fetch_with_proxy_rotation(
        url="https://api.binance.com/api/v3/ticker/24hr",
        provider_name="binance",
        params={"symbol": "BTCUSDT"}
    )
    
    if data:
        print(f"✅ Binance data: {data['symbol']} = ${data['lastPrice']}")
    
    # Example 2: Fetch from CoinGecko (needs proxy)
    print("\n" + "="*60)
    print("Example 2: Fetch from CoinGecko")
    print("="*60)
    
    data = await manager.fetch_with_proxy_rotation(
        url="https://api.coingecko.com/api/v3/simple/price",
        provider_name="coingecko",
        params={"ids": "bitcoin", "vs_currencies": "usd"}
    )
    
    if data:
        print(f"✅ CoinGecko data: {data}")
    
    # Example 3: Fetch from non-restricted provider (no proxy)
    print("\n" + "="*60)
    print("Example 3: Fetch from CoinCap (no proxy needed)")
    print("="*60)
    
    data = await manager.fetch_with_proxy_rotation(
        url="https://api.coincap.io/v2/assets/bitcoin",
        provider_name="coincap"
    )
    
    if data:
        print(f"✅ CoinCap data: {data['data']['name']} = ${data['data']['priceUsd']}")
    
    # Example 4: DNS resolution
    print("\n" + "="*60)
    print("Example 4: DNS over HTTPS")
    print("="*60)
    
    ip = await manager.resolve_hostname("api.binance.com")
    print(f"✅ api.binance.com resolved to: {ip}")
    
    # Example 5: Status report
    print("\n" + "="*60)
    print("Example 5: Status Report")
    print("="*60)
    
    status = manager.get_status()
    print(json.dumps(status, indent=2))


if __name__ == "__main__":
    # Run examples
    asyncio.run(example_usage())
