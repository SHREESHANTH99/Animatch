# Quick Start Script - Starts all services for the recommendation system
# Run this after completing the setup

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ANIMATCH - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This will start 3 services in separate windows:" -ForegroundColor Yellow
Write-Host "  1. Python Recommendation API (Port 5002)" -ForegroundColor White
Write-Host "  2. Node.js Backend (Port 5001)" -ForegroundColor White
Write-Host "  3. React Frontend (Port 3000)`n" -ForegroundColor White

Write-Host "Press Ctrl+C in each window to stop services`n" -ForegroundColor Gray

# Start Python API in new window
Write-Host "Starting Python Recommendation API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend\recommendation_system' ; Write-Host '🐍 Starting Python Recommendation API...' -ForegroundColor Cyan ; python start_api.py"

Start-Sleep -Seconds 2

# Start Node.js Backend in new window
Write-Host "Starting Node.js Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend' ; Write-Host '🟢 Starting Node.js Backend...' -ForegroundColor Cyan ; node server.js"

Start-Sleep -Seconds 2

# Start React Frontend in new window
Write-Host "Starting React Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD' ; Write-Host '⚛️  Starting React Frontend...' -ForegroundColor Cyan ; npm start"

Write-Host "`n✅ All services are starting in separate windows!`n" -ForegroundColor Green
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  • Python API: http://localhost:5002/api/recommend/health" -ForegroundColor White
Write-Host "  • Node Backend: http://localhost:5001" -ForegroundColor White
Write-Host "  • React App: http://localhost:3000`n" -ForegroundColor White

Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C in each window`n" -ForegroundColor Gray
