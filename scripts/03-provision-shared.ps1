# ============================================================
# Script 3: Create Publisher Shared, Solution Shared,
#           and a Lookup Column on Table A -> Table B
# ============================================================
# Prerequisites:
#   - pac CLI installed and authenticated
#   - Scripts 01 and 02 must be run first (Table A and Table B must exist)
# ============================================================

param(
    [string]$EnvironmentUrl
)

if ($EnvironmentUrl) {
    Write-Host "Authenticating to $EnvironmentUrl..."
    pac auth create --url $EnvironmentUrl
}

# --- Publisher Shared ---
Write-Host "`n=== Creating Publisher Shared ===" -ForegroundColor Cyan
pac solution publisher create `
    --name "PublisherShared" `
    --displayName "Publisher Shared" `
    --prefix "pubsh"

# --- Solution Shared ---
Write-Host "`n=== Creating Solution Shared ===" -ForegroundColor Cyan
pac solution create `
    --name "SolutionShared" `
    --displayName "Solution Shared" `
    --publisher "PublisherShared"

# --- Lookup Column on Table A referencing Table B ---
Write-Host "`n=== Creating Lookup Column (Table A -> Table B) ===" -ForegroundColor Cyan
pac table column create `
    --table "puba_TableA" `
    --name "pubsh_TableBLookup" `
    --displayName "Table B Lookup" `
    --type "Lookup" `
    --lookupTable "pubb_TableB" `
    --solution "SolutionShared"

Write-Host "`n=== Script 3 Complete ===" -ForegroundColor Green
Write-Host "Created: Publisher Shared, Solution Shared, Lookup Column (Table A -> Table B)"
