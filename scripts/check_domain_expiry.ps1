<#
Sample PowerShell helper to check domain expiry using a WHOIS service.
This script is a placeholder and requires a WHOIS API key or `whois` client installed.

Usage:
  - Fill `$whoisApiKey` and `$whoisApiUrl` or install a local `whois` client.
  - Run: `pwsh .\scripts\check_domain_expiry.ps1 -Domain example.com`
#>

param(
  [string]$Domain
)

if (-not $Domain) {
  Write-Host "Usage: .\check_domain_expiry.ps1 -Domain example.com"
  exit 1
}

# TODO: wire to a WHOIS API or local whois binary
$whoisApiUrl = ''
$whoisApiKey = ''

if ($whoisApiUrl -and $whoisApiKey) {
  $url = "$whoisApiUrl?domain=$Domain&apiKey=$whoisApiKey"
  $resp = Invoke-RestMethod -Uri $url -Method Get
  $expiry = $resp.expiryDate
  Write-Host "$Domain expires on: $expiry"
} else {
  Write-Host "WHOIS API not configured. Please install 'whois' or provide API details in script."
}
