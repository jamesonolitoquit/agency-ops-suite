# GitHub Repository Setup Script for New Account
# Replace YOUR_NEW_USERNAME with your actual GitHub username

$NEW_USERNAME = "jamesonolitoquit"  # <-- SET TO YOUR GITHUB USERNAME

function Setup-Repository {
    param($Path, $RepoName)

    Write-Host "Setting up $RepoName..." -ForegroundColor Green
    cd $Path

    # Remove old remote
    git remote remove origin 2>$null

    # Add new remote
    git remote add origin "https://github.com/$NEW_USERNAME/$RepoName.git"

    # Get current branch name
    $currentBranch = git branch --show-current

    # Add and commit any changes
    git add .
    git commit -m "Ready for deployment" --allow-empty

    # Push to new remote
    git push -u origin $currentBranch

    Write-Host "$RepoName setup complete!" -ForegroundColor Yellow
}

# Setup each repository
Setup-Repository "c:\Users\Jaoce\OneDrive\Documents\Portfolio Files\business-website-sample" "business-website-sample"
Setup-Repository "c:\Users\Jaoce\OneDrive\Documents\Portfolio Files\landingpage-website-sample" "landingpage-website-sample"
Setup-Repository "c:\Users\Jaoce\OneDrive\Documents\Portfolio Files\portfolio-website" "portfolio-website"
Setup-Repository "c:\Users\Jaoce\OneDrive\Documents\Portfolio Files\web-application-sample" "web-application-sample"

Write-Host "`nAll repositories have been set up and pushed!" -ForegroundColor Green
Write-Host "Don't forget to create the repositories on GitHub first at:" -ForegroundColor Cyan
Write-Host "https://github.com/$NEW_USERNAME" -ForegroundColor Cyan