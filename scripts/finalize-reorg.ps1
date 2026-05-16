# Move remaining docs (use git mv if tracked, otherwise Move-Item), then git add & commit
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

  $source = Join-Path 'docs' $name
  $target = Join-Path $newDir $name

  # Check if file is tracked
  $tracked = (git ls-files -- "docs/$name") -ne $null -and (git ls-files -- "docs/$name") -ne ''
  if ($tracked) {
    Write-Output "git mv $source -> $target"
    git mv -f $source $target
  } else {
    Write-Output "Move-Item $source -> $target"
    Move-Item -Force $source $target
  }
}

# Stage and commit
git add -A
if ((git status --porcelain) -ne '') {
  git commit -m "chore(docs): reorganize documentation into categorized subfolders"
  Write-Output 'Committed reorganized docs.'
} else {
  Write-Output 'No changes to commit.'
}
