# Quick Start Script for AI Recommendation System
# Run this script to start all services

Write-Host "🚀 Starting AI Recommendation System..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

# Install Python dependencies
Write-Host "Installing Python packages..." -ForegroundColor Yellow
Set-Location backend\recommendation_system
pip install -r requirements.txt | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python packages installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some Python packages may have issues" -ForegroundColor Yellow
}

# Install Node.js backend dependencies
Set-Location ..
Write-Host "Installing backend Node.js packages..." -ForegroundColor Yellow
npm install axios | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend packages installed" -ForegroundColor Green
}

# Install frontend dependencies
Set-Location ..
Write-Host "Installing frontend packages..." -ForegroundColor Yellow
npm install | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend packages installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Running tests..." -ForegroundColor Cyan
Set-Location backend\recommendation_system
python test_system.py
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the output above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the services, open 3 separate terminals:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 (Flask API):" -ForegroundColor Yellow
Write-Host "  cd backend\recommendation_system" -ForegroundColor White
Write-Host "  python api.py --mode server --port 5000" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Node.js Backend):" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 3 (React Frontend):" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Or run this command to start Flask API now:" -ForegroundColor Cyan
$response = Read-Host "Start Flask API server now? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "🐍 Starting Flask API server on port 5000..." -ForegroundColor Cyan
    python api.py --mode server --port 5000
} else {
    Write-Host ""
    Write-Host "✅ Setup complete. Start services manually when ready." -ForegroundColor Green
}
