# Test both HuggingFace Spaces for crypto data endpoints
# Space 1 (v1): https://really-amin-datasourceforcryptocurrency.hf.space
# Space 2 (v2): https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2

$space1Base = "https://really-amin-datasourceforcryptocurrency.hf.space"
$space2Base = "https://really-amin-datasourceforcryptocurrency-2.hf.space"

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$Name = ""
    )
    
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host "--- Testing: $Name ---" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Cyan
    
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
        
        Write-Host "[OK] Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "[OK] Time: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Green
        
        try {
            $content = $response.Content | ConvertFrom-Json -ErrorAction Stop
            Write-Host "[INFO] Response (JSON):" -ForegroundColor Cyan
            $preview = $content | ConvertTo-Json -Depth 2
            $lines = $preview -split "`n" | Select-Object -First 10
            $lines | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
            if (($preview -split "`n").Count -gt 10) {
                Write-Host "  ... (truncated)" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "[INFO] Response (text): $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Cyan
        }
        
        return $true
    }
    catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.InnerException) {
            Write-Host "[DETAIL] $($_.Exception.InnerException.Message)" -ForegroundColor Gray
        }
        return $false
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing HuggingFace Crypto Data Spaces" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test Space 1
Write-Host "`n=== SPACE 1 (v1) Tests ===" -ForegroundColor Yellow

Test-Endpoint -Url "$space1Base/health" -Name "Health Check"
Test-Endpoint -Url "$space1Base/api/market?symbols=BTC,ETH`&limit=10" -Name "Market Prices"
Test-Endpoint -Url "$space1Base/api/market/history?symbol=BTCUSDT`&timeframe=1h`&limit=50" -Name "OHLC History"
Test-Endpoint -Url "$space1Base/api/sentiment" -Name "Sentiment (Fear & Greed)"
Test-Endpoint -Url "$space1Base/api/sentiment/analyze" -Method "POST" -Body @{text="Bitcoin rally expected"} -Name "Sentiment Analysis"
Test-Endpoint -Url "$space1Base/api/trading/decision" -Method "POST" -Body @{symbol="BTCUSDT"; timeframe="1h"} -Name "Trading Decision"
Test-Endpoint -Url "$space1Base/api/models/status" -Name "Models Status"

# Test Space 2
Write-Host "`n=== SPACE 2 (v2) Tests ===" -ForegroundColor Yellow

Test-Endpoint -Url "$space2Base/api/hub/status" -Name "Hub Status"
Test-Endpoint -Url "$space2Base/api/hub/market?symbols=BTC,ETH`&limit=10" -Name "Hub Market"
Test-Endpoint -Url "$space2Base/api/hub/ohlc?symbol=BTCUSDT`&timeframe=1h`&limit=50" -Name "Hub OHLC"
Test-Endpoint -Url "$space2Base/api/hub/dataset-info" -Name "Dataset Info"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
