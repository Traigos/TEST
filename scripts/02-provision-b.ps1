# ============================================================
# Script 2: Create Publisher B, Solution B, Table B
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

# --- Publisher B ---
Write-Host "`n=== Creating Publisher B ===" -ForegroundColor Cyan
pac solution publisher create `
    --name "PublisherB" `
    --displayName "Publisher B" `
    --prefix "pubb"

# --- Solution B ---
Write-Host "`n=== Creating Solution B ===" -ForegroundColor Cyan
pac solution create `
    --name "SolutionB" `
    --displayName "Solution B" `
    --publisher "PublisherB"

# --- Table B ---
Write-Host "`n=== Creating Table B ===" -ForegroundColor Cyan
pac table create `
    --name "pubb_TableB" `
    --displayName "Table B" `
    --primaryColumn "pubb_Name" `
    --primaryColumnDisplayName "Name" `
    --solution "SolutionB"

Write-Host "`n=== Script 2 Complete ===" -ForegroundColor Green
Write-Host "Created: Publisher B, Solution B, Table B"
