$ErrorActionPreference = 'Stop'

$base = 'http://localhost:3001'

function Parse-EnvFile([string]$path) {
  $map = @{}
  Get-Content $path | ForEach-Object {
    if ($_ -match '^[#\s]*$') { return }
    $parts = $_ -split '=', 2
    if ($parts.Count -eq 2) {
      $key = $parts[0].Trim()
      $val = $parts[1].Trim().Trim('"')
      $map[$key] = $val
    }
  }
  return $map
}

function Invoke-CurlJson([string]$method, [string]$url, [string]$body = $null) {
  $tmpBody = [System.IO.Path]::GetTempFileName()
  $tmpHeaders = [System.IO.Path]::GetTempFileName()
  try {
    $args = @('-sS', '-L', '-D', $tmpHeaders, '-o', $tmpBody, '-X', $method, '-H', 'content-type: application/json')
    if ($body) {
      $args += @('--data-raw', $body)
    }
    $args += $url
    & curl.exe @args | Out-Null
    $content = Get-Content -Raw -Path $tmpBody
    if ([string]::IsNullOrWhiteSpace($content)) { return $null }
    return $content | ConvertFrom-Json
  } finally {
    Remove-Item $tmpBody, $tmpHeaders -ErrorAction SilentlyContinue
  }
}

$clientsResp = Invoke-RestMethod -Uri "$base/api/test-clients" -Method Get
$client = $null
if ($clientsResp.clients -and $clientsResp.clients.Count -gt 0) {
  $client = $clientsResp.clients[0]
} else {
  $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $newClientBody = @{ name = "DryRun Client $ts"; domain = "dryrun-$ts.example.com"; businessType = "services"; plan = 'starter'; monthlyFee = 1999 } | ConvertTo-Json
  $createClient = Invoke-RestMethod -Uri "$base/api/test-clients" -Method Post -ContentType 'application/json' -Body $newClientBody
  $client = $createClient.client
}

$contractBody = @{
  clientId = $client.id
  contractType = 'service'
  metadata = @{
    packageName = 'starter'
    price = 1999
    timeline = '14 days'
    revisionLimit = '2'
    scope = 'Landing page build'
    terms = '50% upfront, 50% before launch'
  }
} | ConvertTo-Json -Depth 6

$contractResp = Invoke-RestMethod -Uri "$base/api/contracts" -Method Post -ContentType 'application/json' -Body $contractBody
$contractId = $contractResp.contract.id

$sendResp = Invoke-CurlJson -method 'POST' -url "$base/api/contracts/$contractId/send"
$signUrl = $sendResp.url
$token = ($signUrl -split '/')[-1]

Invoke-WebRequest -Uri "$base/api/contracts/sign/$token" -Method Get -UseBasicParsing | Out-Null

$headers = @{ 'content-type' = 'application/json'; 'x-forwarded-for' = '203.0.113.55'; 'user-agent' = 'dryrun-agent/1.0' }
$signBody = @{ signed_name = 'Dry Run Signer'; signed_email = 'dryrun@example.com'; signature_data = 'DRYRUN-SIGNATURE' } | ConvertTo-Json -Compress
$signResp = Invoke-RestMethod -Uri "$base/api/contracts/sign/$token" -Method Post -ContentType 'application/json' -Body $signBody

$contractGet = Invoke-CurlJson -method 'GET' -url "$base/api/contracts/$contractId"
$statusResp = Invoke-CurlJson -method 'GET' -url "$base/api/contracts/$contractId/signing-status"

$invalidAfterSign = $null
try {
  Invoke-WebRequest -Uri "$base/api/contracts/sign/$token" -Method Get -UseBasicParsing | Out-Null
  $invalidAfterSign = 'unexpected_success'
} catch {
  $invalidAfterSign = $_.Exception.Message
}

$doubleSign = $null
try {
  Invoke-RestMethod -Uri "$base/api/contracts/sign/$token" -Method Post -ContentType 'application/json' -Body $signBody | Out-Null
  $doubleSign = 'unexpected_success'
} catch {
  $doubleSign = $_.Exception.Message
}

$linkedInvoiceId = $contractGet.contract.invoice_id
$invoicesResp = Invoke-CurlJson -method 'GET' -url "$base/api/invoices"
$linkedInvoice = $invoicesResp.invoices | Where-Object { $_.id -eq $linkedInvoiceId } | Select-Object -First 1

$pdfHeaders = curl.exe -s -D - -o NUL "$base/api/invoices/$linkedInvoiceId/pdf"
$adminHeaders = curl.exe -s -D - -o NUL "$base/admin/invoices"

$envMap = Parse-EnvFile '.env.local'
$supabaseUrl = $envMap['NEXT_PUBLIC_SUPABASE_URL']
$serviceKey = $envMap['SUPABASE_SERVICE_ROLE_KEY']

$authHeaders = @{ apikey = $serviceKey; Authorization = "Bearer $serviceKey"; 'Content-Type' = 'application/json'; Prefer = 'return=representation' }

$expiredTs = (Get-Date).AddDays(-1).ToString('o')
$patchBody = @{ signing_expires_at = $expiredTs; status = 'sent' } | ConvertTo-Json
Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/contracts?id=eq.$contractId" -Method Patch -Headers $authHeaders -Body $patchBody | Out-Null

$expiredSend = Invoke-CurlJson -method 'POST' -url "$base/api/contracts/$contractId/send"
$expiredToken = ($expiredSend.url -split '/')[-1]
Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/contracts?signing_token=eq.$expiredToken" -Method Patch -Headers $authHeaders -Body (@{ signing_expires_at = $expiredTs } | ConvertTo-Json) | Out-Null

$expiredResult = $null
try {
  Invoke-RestMethod -Uri "$base/api/contracts/sign/$expiredToken" -Method Get | Out-Null
  $expiredResult = 'unexpected_success'
} catch {
  $expiredResult = $_.Exception.Message
}

$auditRows = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/audit_logs?select=entity_type,entity_id,action,summary,created_at&entity_id=eq.$contractId&order=created_at.desc" -Headers @{ apikey = $serviceKey; Authorization = "Bearer $serviceKey" }
$invoiceAudit = @()
if ($linkedInvoiceId) {
  $invoiceAudit = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/audit_logs?select=entity_type,entity_id,action,summary,created_at&entity_id=eq.$linkedInvoiceId&order=created_at.desc" -Headers @{ apikey = $serviceKey; Authorization = "Bearer $serviceKey" }
}

$systemEvents = @()
try {
  $systemEvents = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/system_events?select=type,severity,created_at&order=created_at.desc&limit=10" -Headers @{ apikey = $serviceKey; Authorization = "Bearer $serviceKey" }
} catch {
  $systemEvents = @('system_events_unavailable')
}

$invNums = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/invoices?select=invoice_number,created_at&order=created_at.desc&limit=30" -Headers @{ apikey = $serviceKey; Authorization = "Bearer $serviceKey" }
$dupNums = $invNums | Group-Object invoice_number | Where-Object { $_.Count -gt 1 } | Select-Object -ExpandProperty Name

$result = [ordered]@{
  clientId = $client.id
  contractId = $contractId
  signingUrl = $signUrl
  token = $token
  signedContractStatus = $contractGet.contract.status
  signedAt = $contractGet.contract.signed_at
  signedIp = $contractGet.contract.signed_ip
  tokenInvalidationCheck = $invalidAfterSign
  doubleSignCheck = $doubleSign
  linkedInvoiceId = $linkedInvoiceId
  invoiceFoundInApi = [bool]$linkedInvoice
  invoiceNumber = $linkedInvoice.invoice_number
  invoiceDuplicatesInLast30 = @($dupNums)
  signingStatusEndpoint = $statusResp.status
  pdfHeaders = $pdfHeaders
  adminHeaders = $adminHeaders
  expiredTokenCheck = $expiredResult
  auditContractActions = @($auditRows | Select-Object -ExpandProperty action)
  auditInvoiceActions = @($invoiceAudit | Select-Object -ExpandProperty action)
  systemEventsSample = $systemEvents
}

$result | ConvertTo-Json -Depth 8
