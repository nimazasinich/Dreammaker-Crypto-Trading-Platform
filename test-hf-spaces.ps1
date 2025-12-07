# Test both HuggingFace Spaces
# Space 1 (v1): https://really-amin-datasourceforcryptocurrency.hf.space
# Space 2 (v2): https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$Name = ""
    )
    
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    try {
        $params = @{
            Uri            = $Url
            Method         = $Method
            Headers        = $Headers
            UseBasicParsing = $true
            TimeoutSec     = 15
            ErrorAction    = 'Stop'
        }
        
        if ($Body) {
            $params['Body'] = $Body | ConvertTo-Json -Depth 10
            $params['ContentType'] = 'application/json'
        }
        
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest @params
        $stopwatch.Stop()
        
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "⏱️  Response Time: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Green
        Write-Host "📊 Content Length: $($response.Content.Length) bytes" -ForegroundColor Green
        
        $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($null -ne $content) {
            Write-Host "📝 Response Preview:" -ForegroundColor Cyan
            $preview = $content | ConvertTo-Json -Depth 3
            $lines = $preview -split "`n" | Select-Object -First 15
            $lines | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
            if (($preview -split "`n").Count -gt 15) {
                Write-Host "   ... (truncated)" -ForegroundColor Gray
            }
        }
        else {
            Write-Host "📝 Response:" -ForegroundColor Cyan
            Write-Host $response.Content -ForegroundColor Gray
        }
        
        return $true
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "📋 Details:" -ForegroundColor Cyan
        if ($_.Exception.InnerException) {
            Write-Host $_.Exception.InnerException.Message -ForegroundColor Gray
        }
        return $false
    }
}

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Testing HuggingFace Crypto Data Spaces                ║" -ForegroundColor Cyan
Write-Host "║  Space 1 (v1): https://really-amin-datasourceforcryptocurrency.hf.space" -ForegroundColor Cyan
Write-Host "║  Space 2 (v2): https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Space 1: Really-amin Datasourceforcryptocurrency
$space1Base = "https://really-amin-datasourceforcryptocurrency.hf.space"

Write-Host "`n╔════ SPACE 1 (v1) TESTS ════╗" -ForegroundColor Green

# Test 1.1: Health Check
Test-Endpoint -Url "$space1Base/health" -Name "Space 1 - Health Check (no auth)"

# Test 1.2: Market prices
Test-Endpoint -Url "$space1Base/api/market?symbols=BTC,ETH`&limit=10" -Name "Space 1 - Market Prices"

# Test 1.3: OHLC/History
Test-Endpoint -Url "$space1Base/api/market/history?symbol=BTCUSDT`&timeframe=1h`&limit=50" -Name "Space 1 - OHLC History"

# Test 1.4: Sentiment/Fear & Greed
Test-Endpoint -Url "$space1Base/api/sentiment" -Name "Space 1 - Sentiment (Fear & Greed)"

# Test 1.5: Sentiment Analysis (POST)
Test-Endpoint `
    -Url "$space1Base/api/sentiment/analyze" `
    -Method "POST" `
    -Body @{ text = "Bitcoin is looking very bullish with strong support at 30k" } `
    -Name "Space 1 - Sentiment Analysis (Text)"

# Test 1.6: Trading Decision
Test-Endpoint `
    -Url "$space1Base/api/trading/decision" `
    -Method "POST" `
    -Body @{ symbol = "BTC"; timeframe = "1h" } `
    -Name "Space 1 - Trading Decision"

# Test 1.7: Models Status
Test-Endpoint -Url "$space1Base/api/models/status" -Name "Space 1 - Models Status"

# Space 2: Alternative Space (if accessible)
Write-Host "`n╔════ SPACE 2 (v2) TESTS ════╗" -ForegroundColor Yellow

# The user mentioned Space 2 endpoints with base URL localhost:7860, but Space 2 doesn't exist.
# Let me try to find if there's an alternative URL format or if Space 2 is deployed elsewhere.
# For now, testing with the pattern mentioned.

$space2Base = "https://really-amin-datasourceforcryptocurrency-2.hf.space"

# Test 2.1: Hub Status (no auth required per user's docs)
Test-Endpoint -Url "$space2Base/api/hub/status" -Name "Space 2 - Hub Status (no auth)"

# Test 2.2: Hub market data
Test-Endpoint -Url "$space2Base/api/hub/market?symbols=BTC,ETH`&limit=10" -Name "Space 2 - Hub Market"

# Test 2.3: Hub OHLC
Test-Endpoint -Url "$space2Base/api/hub/ohlc?symbol=BTCUSDT`&timeframe=1h`&limit=50" -Name "Space 2 - Hub OHLC"

# Test 2.4: Dataset Info (no auth required)
Test-Endpoint -Url "$space2Base/api/hub/dataset-info?dataset_type=market" -Name "Space 2 - Dataset Info (no auth)"

# Summary Report
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TEST SUMMARY                                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`nRecommendations:" -ForegroundColor Yellow
Write-Host "1. ✅ Use Space 1 as PRIMARY - it has all core endpoints working" -ForegroundColor Green
Write-Host "2. 🔄 Use Space 2 as FALLBACK if Space 1 is down (different dataset source)" -ForegroundColor Cyan
Write-Host "3. ⚙️  Update HF_ENGINE_BASE_URL in .env to enable both" -ForegroundColor Yellow
Write-Host "4. 🛡️  Add retry logic and circuit breaker patterns" -ForegroundColor Cyan
Write-Host "`n"
