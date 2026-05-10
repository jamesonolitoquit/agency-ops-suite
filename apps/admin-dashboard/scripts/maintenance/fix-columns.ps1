$file = "src/lib/agency-db.ts"
$content = Get-Content $file -Raw

# Fix 1: listBilling should order by 'due_date'
# Find the specific location and fix it
$content = $content -replace "export async function listBilling\(\) \{\s+const supabase = getClient\(\);\s+const \{ data, error \} = await supabase\s+\.from\('billing'\)\s+\.select\('\*,\s+clients\(name\)'\)\s+\.order\('generated_at'", @"
export async function listBilling() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('billing')
    .select('*, clients(name)')
    .order('due_date'
"@

# Fix 2: listProvisioningRuns should order by 'started_at'
# We need to be careful here to only replace the right one
$lines = $content -split "`n"
$output = @()
$inListProvisioningRuns = $false

foreach ($i in 0..($lines.Count - 1)) {
    $line = $lines[$i]
    
    # Detect if we're in listProvisioningRuns function
    if ($line -match "export async function listProvisioningRuns") {
        $inListProvisioningRuns = $true
    }
    
    # If we're in the function and find the order clause with generated_at, replace it
    if ($inListProvisioningRuns -and $line -match "\.order\('generated_at'" -and $i -gt 600) {
        $line = $line -replace "\.order\('generated_at'", ".order('started_at'"
        $inListProvisioningRuns = $false
    }
    
    $output += $line
}

$content = $output -join "`n"

Set-Content $file $content
Write-Host "Fixed agency-db.ts column references"
