# ============================================================
# Script 1: Create Publisher A, Solution A, Table A
# ============================================================
# Prerequisites: pac CLI installed and authenticated
#   pac auth create --url https://yourorg.crm.dynamics.com
# ============================================================

param(
    [string]$EnvironmentUrl
)

if ($EnvironmentUrl) {
    Write-Host "Authenticating to $EnvironmentUrl..."
    pac auth create --url $EnvironmentUrl
}

# --- Publisher A ---
Write-Host "`n=== Creating Publisher A ===" -ForegroundColor Cyan
pac solution publisher create `
    --name "PublisherA" `
    --displayName "Publisher A" `
    --prefix "puba"

# --- Solution A ---
Write-Host "`n=== Creating Solution A ===" -ForegroundColor Cyan
pac solution create `
    --name "SolutionA" `
    --displayName "Solution A" `
    --publisher "PublisherA"

# --- Table A ---
Write-Host "`n=== Creating Table A ===" -ForegroundColor Cyan
pac table create `
    --name "puba_TableA" `
    --displayName "Table A" `
    --primaryColumn "puba_Name" `
    --primaryColumnDisplayName "Name" `
    --solution "SolutionA"

Write-Host "`n=== Script 1 Complete ===" -ForegroundColor Green
Write-Host "Created: Publisher A, Solution A, Table A"
