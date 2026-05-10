$baseUrl = "http://localhost:3000/api"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$testResults = @()

Write-Host ""
Write-Host "E2E VALIDATION TEST SUITE" -ForegroundColor Cyan
Write-Host "Started: $timestamp" -ForegroundColor Gray
Write-Host ""

# Test 1: Clients
Write-Host "Test 1: GET /test-clients" -ForegroundColor Cyan
try {
    $clients = Invoke-WebRequest -Uri "$baseUrl/test-clients" -UseBasicParsing | ConvertFrom-Json
    Write-Host "  PASS - Found $($clients.clients.Count) clients" -ForegroundColor Green
    $testResults += @{ Name="GET /test-clients"; Status="PASS" }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $testResults += @{ Name="GET /test-clients"; Status="FAIL" }
}

# Test 2: Create lead
Write-Host "Test 2: POST /intake/lead" -ForegroundColor Cyan
try {
    $leadBody = @{
        name = "E2E Test Lead"
        businessType = "Technology"
        source = "google"
    } | ConvertTo-Json
    
    $lead = Invoke-WebRequest `
        -Uri "$baseUrl/intake/lead" `
        -Method POST `
        -Headers @{"x-intake-secret"="local-test-secret-abc123xyz"} `
        -Body $leadBody `
        -UseBasicParsing | ConvertFrom-Json
    
    Write-Host "  PASS - Created lead" -ForegroundColor Green
    $testResults += @{ Name="POST /intake/lead"; Status="PASS" }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $testResults += @{ Name="POST /intake/lead"; Status="FAIL" }
}

# Test 3: Leads
Write-Host "Test 3: GET /test-leads" -ForegroundColor Cyan
try {
    $leads = Invoke-WebRequest -Uri "$baseUrl/test-leads" -UseBasicParsing | ConvertFrom-Json
    Write-Host "  PASS - Found $($leads.leads.Count) leads" -ForegroundColor Green
    $testResults += @{ Name="GET /test-leads"; Status="PASS" }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $testResults += @{ Name="GET /test-leads"; Status="FAIL" }
}

# Test 4: Report JSON
Write-Host "Test 4: GET /report/export (JSON)" -ForegroundColor Cyan
try {
    $clients = Invoke-WebRequest -Uri "$baseUrl/test-clients" -UseBasicParsing | ConvertFrom-Json
    if ($clients.clients.Count -gt 0) {
        $clientId = $clients.clients[0].id
        $uri = "$baseUrl/report/export?client_id=$clientId" + "&format=json"
        $report = Invoke-WebRequest -Uri $uri -UseBasicParsing | ConvertFrom-Json
        Write-Host "  PASS - Report generated" -ForegroundColor Green
        $testResults += @{ Name="GET /report/export (JSON)"; Status="PASS" }
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $testResults += @{ Name="GET /report/export (JSON)"; Status="FAIL" }
}

# Test 5: Report HTML
Write-Host "Test 5: GET /report/export (HTML)" -ForegroundColor Cyan
try {
    $clients = Invoke-WebRequest -Uri "$baseUrl/test-clients" -UseBasicParsing | ConvertFrom-Json
    if ($clients.clients.Count -gt 0) {
        $clientId = $clients.clients[0].id
        $uri = "$baseUrl/report/export?client_id=$clientId" + "&format=html"
        $response = Invoke-WebRequest -Uri $uri -UseBasicParsing
        $sizeKb = [math]::Round($response.Content.Length / 1024, 2)
        Write-Host "  PASS - HTML Report generated ($sizeKb KB)" -ForegroundColor Green
        $testResults += @{ Name="GET /report/export (HTML)"; Status="PASS" }
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $testResults += @{ Name="GET /report/export (HTML)"; Status="FAIL" }
}

# Test 6: Health Check
Write-Host "Test 6: GET /health/provisioning" -ForegroundColor Cyan
try {
    $health = Invoke-WebRequest -Uri "$baseUrl/health/provisioning" -UseBasicParsing | ConvertFrom-Json
    Write-Host "  PASS - Status: $($health.status)" -ForegroundColor Green
    $testResults += @{ Name="GET /health/provisioning"; Status="PASS" }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $testResults += @{ Name="GET /health/provisioning"; Status="FAIL" }
}

# Test 7: Reports
Write-Host "Test 7: GET /test-reports" -ForegroundColor Cyan
try {
    $reports = Invoke-WebRequest -Uri "$baseUrl/test-reports" -UseBasicParsing | ConvertFrom-Json
    Write-Host "  PASS - Found $($reports.count) reports" -ForegroundColor Green
    $testResults += @{ Name="GET /test-reports"; Status="PASS" }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $testResults += @{ Name="GET /test-reports"; Status="FAIL" }
}

# Test 8: Billing
Write-Host "Test 8: GET /test-billing" -ForegroundColor Cyan
try {
    $billing = Invoke-WebRequest -Uri "$baseUrl/test-billing" -UseBasicParsing | ConvertFrom-Json
    Write-Host "  PASS - Billing data retrieved" -ForegroundColor Green
    $testResults += @{ Name="GET /test-billing"; Status="PASS" }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $testResults += @{ Name="GET /test-billing"; Status="FAIL" }
}

# Test 9: Provisioning
Write-Host "Test 9: GET /test-provisioning" -ForegroundColor Cyan
try {
    $provisioning = Invoke-WebRequest -Uri "$baseUrl/test-provisioning" -UseBasicParsing | ConvertFrom-Json
    Write-Host "  PASS - Found $($provisioning.count) provisioning runs" -ForegroundColor Green
    $testResults += @{ Name="GET /test-provisioning"; Status="PASS" }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $testResults += @{ Name="GET /test-provisioning"; Status="FAIL" }
}

# Summary
Write-Host ""
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $testResults.Count

Write-Host "Total: $total"
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Some tests failed!" -ForegroundColor Yellow
}

Write-Host ""
