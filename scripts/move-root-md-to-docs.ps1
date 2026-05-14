# Move top-level .md files into docs/ (use git mv when tracked)
$root = (Get-Location).Path
$mdFiles = Get-ChildItem -Path $root -File -Filter *.md | Where-Object { $_.DirectoryName -eq $root }
if ($mdFiles.Count -eq 0) { Write-Output "No top-level .md files found."; exit 0 }
foreach ($f in $mdFiles) {
  $name = $f.Name
  if ($name -match '^README' -or $name -match 'QUICKSTART|START|WEEK|WHATS_NEW') { $category='getting-started' }
  elseif ($name -match 'PRODUCTION|DEPLOYMENT|VERCEL|STAGING') { $category='deployment' }
  elseif ($name -match 'SECURITY|AUDIT|SECRETS') { $category='security' }
  elseif ($name -match 'BACKUP|RESTORE') { $category='backup' }
  else { $category='misc' }

  $newDir = Join-Path -Path 'docs' -ChildPath $category
  if (!(Test-Path $newDir)) { New-Item -ItemType Directory -Path $newDir | Out-Null }
  $source = Join-Path $root $name
  $target = Join-Path $newDir $name

  $tracked = (git ls-files -- "${source}" ) -ne $null -and (git ls-files -- "${source}" ) -ne ''
  if ($tracked) {
    Write-Output "git mv $source -> $target"
    git mv -f "$source" "$target"
  } else {
    Write-Output "Move-Item $source -> $target"
    Move-Item -Force "$source" "$target"
  }
}

# Stage and commit
if ((git status --porcelain) -ne '') {
  git add -A
  git commit -m "chore(docs): move top-level markdown files into docs/"
  Write-Output 'Committed root md moves.'
} else {
  Write-Output 'No changes to commit.'
}
