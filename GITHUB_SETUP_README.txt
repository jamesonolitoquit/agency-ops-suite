# MANUAL GITHUB SETUP INSTRUCTIONS
# Replace YOUR_NEW_USERNAME with your actual GitHub username

# Step 1: Create new GitHub account at https://github.com/join
# Step 2: Create these repositories under your new account:
# - business-website-sample
# - landingpage-website-sample
# - portfolio-website
# - web-application-sample

# Step 3: Run these commands for each project:

# BUSINESS WEBSITE SAMPLE
cd "c:\Users\Jaoce\OneDrive\Documents\Portfolio Files\business-website-sample"
git remote remove origin
git remote add origin https://github.com/YOUR_NEW_USERNAME/business-website-sample.git
git add .
git commit -m "Ready for deployment" --allow-empty
git push -u origin main

# LANDING PAGE WEBSITE SAMPLE
cd "c:\Users\Jaoce\OneDrive\Documents\Portfolio Files\landingpage-website-sample"
git remote remove origin
git remote add origin https://github.com/YOUR_NEW_USERNAME/landingpage-website-sample.git
git add .
git commit -m "Ready for deployment" --allow-empty
git push -u origin main

# PORTFOLIO WEBSITE
cd "c:\Users\Jaoce\OneDrive\Documents\Portfolio Files\portfolio-website"
git remote remove origin
git remote add origin https://github.com/YOUR_NEW_USERNAME/portfolio-website.git
git add .
git commit -m "Ready for deployment" --allow-empty
git push -u origin main

# WEB APPLICATION SAMPLE
cd "c:\Users\Jaoce\OneDrive\Documents\Portfolio Files\web-application-sample"
git remote remove origin
git remote add origin https://github.com/YOUR_NEW_USERNAME/web-application-sample.git
git add .
git commit -m "Ready for deployment" --allow-empty
git push -u origin main