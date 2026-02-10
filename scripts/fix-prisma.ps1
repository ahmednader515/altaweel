# Fix Prisma Engine Paths Issue
# This script regenerates Prisma Client and ensures engines are properly installed

Write-Host "Fixing Prisma Engine Paths..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean Prisma Client
Write-Host "Step 1: Cleaning old Prisma Client..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
    Write-Host "  Removed old Prisma Client cache" -ForegroundColor Green
} else {
    Write-Host "  No Prisma cache found" -ForegroundColor Gray
}

if (Test-Path "node_modules\@prisma\client") {
    Remove-Item -Recurse -Force "node_modules\@prisma\client" -ErrorAction SilentlyContinue
    Write-Host "  Removed old Prisma Client" -ForegroundColor Green
}

Write-Host ""

# Step 2: Regenerate Prisma Client
Write-Host "Step 2: Regenerating Prisma Client..." -ForegroundColor Yellow
try {
    npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Prisma Client generated successfully" -ForegroundColor Green
    } else {
        Write-Host "  Failed to generate Prisma Client" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Verify installation
Write-Host "Step 3: Verifying Prisma installation..." -ForegroundColor Yellow
if (Test-Path "node_modules\@prisma\client") {
    Write-Host "  Prisma Client is installed" -ForegroundColor Green
} else {
    Write-Host "  Prisma Client not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Prisma fix completed!" -ForegroundColor Green
Write-Host ""
Write-Host "If you're still seeing errors in Prisma Studio:" -ForegroundColor Yellow
Write-Host "  1. Close Prisma Studio completely" -ForegroundColor White
Write-Host "  2. Restart your terminal/IDE" -ForegroundColor White
Write-Host "  3. Run: npm run prisma:studio" -ForegroundColor White
Write-Host ""
