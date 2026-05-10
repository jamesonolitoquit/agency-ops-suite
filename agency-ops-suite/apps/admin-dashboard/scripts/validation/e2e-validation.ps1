#!/usr/bin/env pwsh

# E2E Validation Test Suite for Agency Ops Suite
# Tests: Clients, Leads, Reports, Health Checks, Audit Logs

$baseUrl = "http://localhost:3000/api"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body
    )
    
    Write-Host "`n📋 Testing: $Name" -ForegroundColor Cyan
    Write-Host "   Method: $Method | URI: $Uri" -ForegroundColor Gray
    
    try {
        $params = @{
            Method = $Method
            Uri = $Uri
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Headers = @{ "Content-Type" = "application/json" } + $Headers
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "   ✅ Success: HTTP $statusCode" -ForegroundColor Green
        
        # Log result
        $testResults += @{
            Name = $Name
            Status = "PASS"
            HttpCode = $statusCode
            Timestamp = $timestamp
        }
        
        return $data
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $errorMsg = $_.Exception.Message
        
        Write-Host "   ❌ Failed: HTTP $statusCode - $errorMsg" -ForegroundColor Red
        
        # Log result
        $testResults += @{
            Name = $Name
            Status = "FAIL"
            HttpCode = $statusCode
            Error = $errorMsg
            Timestamp = $timestamp
        }
        
        return $null
    }
}

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 E2E VALIDATION TEST SUITE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Started: $timestamp`n" -ForegroundColor Gray

# Test 1: Fetch all clients
$clients = Test-Endpoint -Name "GET /test-clients" -Uri "$baseUrl/test-clients"
$clientCount = $clients.clients.Count
Write-Host "   Found $clientCount clients" -ForegroundColor Gray

# Test 2: Create new lead
$newLeadData = @{
    name = "E2E Test Company"
    businessType = "Tech"
    source = "google"
    email = "contact@e2etest.com"
    phone = "+1-555-0100"
}

$leadHeaders = @{
    "x-intake-secret" = "local-test-secret-abc123xyz"
}

$leadResponse = Test-Endpoint `
    -Name "POST /intake/lead (Create)" `
    -Method "POST" `
    -Uri "$baseUrl/intake/lead" `
    -Headers $leadHeaders `
    -Body $newLeadData

if ($leadResponse) {
    $leadId = $leadResponse.leadId
    Write-Host "   Created lead: $leadId" -ForegroundColor Gray
}

# Test 3: Fetch all leads
$leads = Test-Endpoint -Name "GET /test-leads" -Uri "$baseUrl/test-leads"
$leadCount = $leads.leads.Count
Write-Host "   Found $leadCount leads (including new one)" -ForegroundColor Gray

# Test 4: Get reports
$reports = Test-Endpoint -Name "GET /test-reports" -Uri "$baseUrl/test-reports"
if ($reports) {
    $reportCount = $reports.reports.Count
    Write-Host "   Found $reportCount reports" -ForegroundColor Gray
}

# Test 5: Generate client report (JSON)
if ($clients.clients.Count -gt 0) {
    $firstClientId = $clients.clients[0].id
    $clientName = $clients.clients[0].name
    $reportJsonUri = "$baseUrl/report/export?client_id=$firstClientId`&format=json"
    
    $report = Test-Endpoint `
        -Name "GET /report/export (JSON)" `
        -Uri $reportJsonUri
    
    if ($report) {
        Write-Host "   Report for: $clientName" -ForegroundColor Gray
        Write-Host "   Ready to Deploy: $($report.report.deploymentReadiness.ready)" -ForegroundColor Gray
        Write-Host "   Deployment Completion: $($report.report.deploymentChecklist.completionPercent)%" -ForegroundColor Gray
    }
}

# Test 6: Generate client report (HTML)
if ($clients.clients.Count -gt 0) {
    $firstClientId = $clients.clients[0].id
    $reportHtmlUri = "$baseUrl/report/export?client_id=$firstClientId`&format=html"
    
    Write-Host "`n📋 Testing: GET /report/export (HTML)" -ForegroundColor Cyan
    Write-Host "   Method: GET | URI: $reportHtmlUri" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest `
            -Method GET `
            -Uri $reportHtmlUri `
            -UseBasicParsing `
            -ErrorAction Stop
        
        $htmlSize = $response.Content.Length
        $statusCode = $response.StatusCode
        $sizeKb = [math]::Round($htmlSize/1024, 2)
        
        Write-Host "   ✅ Success: HTTP $statusCode | HTML Size: $sizeKb KB" -ForegroundColor Green
        
        $testResults += @{
            Name = "GET /report/export (HTML)"
            Status = "PASS"
            HttpCode = $statusCode
            Timestamp = $timestamp
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        Write-Host "   ❌ Failed: HTTP $statusCode" -ForegroundColor Red
        
        $testResults += @{
            Name = "GET /report/export (HTML)"
            Status = "FAIL"
            HttpCode = $statusCode
            Timestamp = $timestamp
        }
    }
}

# Test 7: Provisioning health check
$health = Test-Endpoint -Name "GET /health/provisioning" -Uri "$baseUrl/health/provisioning"
if ($health) {
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Total Runs: $($health.metrics.totalRuns)" -ForegroundColor Gray
    Write-Host "   Success Rate: $($health.metrics.successRate)%" -ForegroundColor Gray
    Write-Host "   Alerts: $($health.alerts.Count)" -ForegroundColor Gray
}

# Test 8: Audit logs
$audit = Test-Endpoint -Name "GET /api/test-monitoring (Audit)" -Uri "$baseUrl/test-monitoring"
if ($audit) {
    Write-Host "   Audit entries available" -ForegroundColor Gray
}

# Test 9: Deployment checklist
Test-Endpoint -Name "GET /deployment-checklist" -Uri "$baseUrl/deployment-checklist" | Out-Null

# Test 10: Billing info
$billing = Test-Endpoint -Name "GET /test-billing" -Uri "$baseUrl/test-billing"
if ($billing) {
    $billingCount = $billing.invoices.Count
    Write-Host "   Found $billingCount billing records" -ForegroundColor Gray
}

# Summary
Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $testResults.Count

Write-Host "Total Tests: $total"
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -eq 0) {
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. See details above." -ForegroundColor Yellow
}

$completedTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "Completed: $completedTime" -ForegroundColor Gray
Write-Host ""

$testResults
