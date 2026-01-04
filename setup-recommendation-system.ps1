# Complete Setup Script for Recommendation System
# This script will set up the entire recommendation system

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ANIMATCH RECOMMENDATION SYSTEM SETUP" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Step 1: Check MongoDB Connection
Write-Host "Step 1: Testing MongoDB connection..." -ForegroundColor Yellow
Set-Location "backend"
$testResult = node scripts/test_mongodb.js 2>&1 | Out-String
if ($LASTEXITCODE -ne 0 -or $testResult -match "failed|error") {
    Write-Host "`n❌ MongoDB connection failed!" -ForegroundColor Red
    Write-Host "`n$testResult" -ForegroundColor Gray
    Write-Host "`n⚠️  IMPORTANT: You must whitelist your IP address in MongoDB Atlas" -ForegroundColor Yellow
    Write-Host "`nQuick Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://cloud.mongodb.com/" -ForegroundColor White
    Write-Host "2. Login and select your project" -ForegroundColor White
    Write-Host "3. Click 'Network Access' → 'ADD IP ADDRESS'" -ForegroundColor White
    Write-Host "4. Click 'ADD CURRENT IP ADDRESS' → Confirm" -ForegroundColor White
    Write-Host "5. Wait 1-2 minutes, then run this script again`n" -ForegroundColor White
    Set-Location $scriptDir
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ MongoDB connection successful!`n" -ForegroundColor Green

# Step 2: Import Anime Data
Write-Host "Step 2: Importing anime data from CSV..." -ForegroundColor Yellow
$importResult = node scripts/import_anime_data.js 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to import anime data`n" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Anime data imported!`n" -ForegroundColor Green

# Step 3: Create Sample Interactions
Write-Host "Step 3: Creating sample interaction data..." -ForegroundColor Yellow
$interactionResult = node scripts/create_interactions.js 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create interactions`n" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Interaction data created!`n" -ForegroundColor Green

# Step 4: Verify Data
Write-Host "Step 4: Verifying imported data..." -ForegroundColor Yellow
node scripts/verify_data.js

# Step 5: Check Python Environment
Write-Host "`nStep 5: Checking Python environment..." -ForegroundColor Yellow
cd recommendation_system
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    $pythonCmd = Get-Command python3 -ErrorAction SilentlyContinue
}

if (-not $pythonCmd) {
    Write-Host "❌ Python not found! Please install Python 3.8+`n" -ForegroundColor Red
    exit 1
}

$pythonVersion = & $pythonCmd.Source --version
Write-Host "✅ Found: $pythonVersion`n" -ForegroundColor Green

# Step 6: Install Python Dependencies
Write-Host "Step 6: Installing Python dependencies..." -ForegroundColor Yellow
& $pythonCmd.Source -m pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python dependencies`n" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python dependencies installed!`n" -ForegroundColor Green

# Success!
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the Python recommendation API:" -ForegroundColor White
Write-Host "   cd backend\recommendation_system" -ForegroundColor Gray
Write-Host "   python start_api.py`n" -ForegroundColor Gray

Write-Host "2. In another terminal, start the Node.js backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   node server.js`n" -ForegroundColor Gray

Write-Host "3. In another terminal, start the React frontend:" -ForegroundColor White
Write-Host "   npm start`n" -ForegroundColor Gray

Write-Host "4. Test the recommendation API:" -ForegroundColor White
Write-Host "   http://localhost:5002/api/recommend/health`n" -ForegroundColor Gray

cd ..\..
