# Database Migration Script
# Migrates all data from the old Aiven database to the new Prisma database
#
# IMPORTANT: Before running this script, make sure you have:
# 1. OLD_DATABASE_URL - Connection string for the old Aiven database
# 2. OLD_DIRECT_DATABASE_URL - Direct connection string for old Aiven database (optional)
# 3. DATABASE_URL - Connection string for the new Prisma database (already set)
# 4. DIRECT_DATABASE_URL - Direct connection string for new Prisma database (already set)
#
# If you've already updated DATABASE_URL to point to the new database, you need to
# temporarily save the old Aiven URLs as OLD_DATABASE_URL and OLD_DIRECT_DATABASE_URL

Write-Host "🚀 Database Migration Script" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env file if it exists
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "📄 Loading environment variables from .env file..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            $value = $value.Trim('"', "'")
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✅ Environment variables loaded" -ForegroundColor Green
    Write-Host ""
}

# Check for required environment variables
$oldDbUrl = $env:OLD_DATABASE_URL
$oldDirectDbUrl = $env:OLD_DIRECT_DATABASE_URL
$newDbUrl = $env:DATABASE_URL
$newDirectDbUrl = $env:DIRECT_DATABASE_URL

if (-not $oldDbUrl) {
    Write-Host "❌ Error: OLD_DATABASE_URL environment variable not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set OLD_DATABASE_URL to your old Aiven database connection string." -ForegroundColor Yellow
    Write-Host "You can add it to your .env file:" -ForegroundColor Yellow
    Write-Host "  OLD_DATABASE_URL=postgres://user:password@old-host:port/database" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: If you've already updated DATABASE_URL to point to the new database," -ForegroundColor Yellow
    Write-Host "you need to save the old Aiven URL as OLD_DATABASE_URL." -ForegroundColor Yellow
    exit 1
}

if (-not $newDbUrl) {
    Write-Host "❌ Error: DATABASE_URL environment variable not found!" -ForegroundColor Red
    Write-Host "Please set DATABASE_URL to your new Prisma database connection string." -ForegroundColor Yellow
    exit 1
}

Write-Host "📊 Migration Configuration:" -ForegroundColor Cyan
Write-Host "  Old Database: $($oldDbUrl.Substring(0, [Math]::Min(50, $oldDbUrl.Length)))..." -ForegroundColor White
Write-Host "  New Database: $($newDbUrl.Substring(0, [Math]::Min(50, $newDbUrl.Length)))..." -ForegroundColor White
Write-Host ""

# Generate Prisma Client to ensure it's up to date
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Cyan
try {
    # Clean and regenerate to avoid engine path issues
    if (Test-Path "node_modules\.prisma") {
        Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
    }
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to generate Prisma Client!" -ForegroundColor Red
        Write-Host "   Try running: npm run fix:prisma" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error generating Prisma Client: $_" -ForegroundColor Red
    Write-Host "   Try running: npm run fix:prisma" -ForegroundColor Yellow
    exit 1
}

# Check if new database schema exists
Write-Host "🔍 Checking if new database schema exists..." -ForegroundColor Cyan
Write-Host "   Running Prisma migrations to ensure tables are created..." -ForegroundColor Yellow
Write-Host ""

try {
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to deploy Prisma migrations!" -ForegroundColor Red
        Write-Host "   Please ensure your DATABASE_URL is correct and the database is accessible." -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Database schema is ready" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error running Prisma migrations: $_" -ForegroundColor Red
    exit 1
}

# Confirm before proceeding
Write-Host "⚠️  WARNING: This will migrate all data from the old database to the new database." -ForegroundColor Yellow
Write-Host "   Make sure you have:" -ForegroundColor Yellow
Write-Host "   1. Backed up both databases" -ForegroundColor Yellow
Write-Host "   2. Tested the connection to both databases" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to proceed? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Starting migration..." -ForegroundColor Cyan
Write-Host ""

# Run the TypeScript migration script
try {
    npm run migrate:db
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error running migration script: $_" -ForegroundColor Red
    exit 1
}

