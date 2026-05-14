# Reorganize docs into categorized subfolders
$files = Get-ChildItem -Path docs -File -Filter *.md
foreach ($f in $files) {
  $name = $f.Name
  $category = 'misc'
  if ($name -match 'VERCEL|DEPLOYMENT|STAGING|PRODUCTION') { $category='deployment' }
  elseif ($name -match 'MONITOR|ALERT|PERFORMANCE') { $category='monitoring' }
  elseif ($name -match 'BACKUP|RESTORE') { $category='backup' }
  elseif ($name -match 'SECURITY|AUDIT|SECRETS|ADVISORY') { $category='security' }
  elseif ($name -match 'UAT|E2E|TEST|SMOKE') { $category='testing' }
  elseif ($name -match 'ARCHITECT|HYBRID|OPERATIONAL_READINESS|ARCHITECTURE') { $category='architecture' }
  elseif ($name -match 'IMPLEMENTATION|CHECKLIST|MASTER_ACTION|READINESS|RUNBOOK|TROUBLESHOOTING') { $category='runbooks' }
  elseif ($name -match 'SUPABASE|MIGRATION') { $category='supabase' }
  elseif ($name -match 'START|QUICK|README|WHATS_NEW|HANDOFF|FINAL') { $category='getting-started' }
  else { $category='misc' }

  $newDir = Join-Path -Path 'docs' -ChildPath $category
  if (!(Test-Path $newDir)) { New-Item -ItemType Directory -Path $newDir | Out-Null }
  Write-Output "Moving $name -> $category"
  git mv -f (Join-Path 'docs' $name) (Join-Path $newDir $name)
}
Write-Output 'Done.'
