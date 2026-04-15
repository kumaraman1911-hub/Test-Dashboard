# Install agent skills from VoltAgent/awesome-agent-skills into ~/.claude/commands/
# Run this script on your Windows PC to install skills for Claude Code
#
# Usage:
#   .\install-skills.ps1
#
# Requirements:
#   - PowerShell 5.1+ or PowerShell Core 7+
#   - Internet access to raw.githubusercontent.com

$CommandsDir = "$env:USERPROFILE\.claude\commands"
$ReadmeUrl   = "https://raw.githubusercontent.com/VoltAgent/awesome-agent-skills/main/README.md"

# Create commands directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $CommandsDir | Out-Null

Write-Host ""
Write-Host "Downloading README from awesome-agent-skills..." -ForegroundColor Cyan

try {
    $ReadmeContent = (Invoke-WebRequest -Uri $ReadmeUrl -UseBasicParsing).Content
} catch {
    Write-Host "ERROR: Could not download README. Check your internet connection." -ForegroundColor Red
    exit 1
}

# Regex to match: **[prefix/skill-name](https://github.com/owner/repo/...)**
$SkillPattern = [regex]'\*\*\[([^/\]]+)/([^\]]+)\]\(https://github\.com/([^)]+)\)\*\*'

$Success = 0
$Fail    = 0
$Skip    = 0
$Failures = @()

function Get-RawUrl {
    param([string]$GhPath)

    $GhPath = $GhPath.Trim("/")
    $Parts  = $GhPath -split "/"
    $Owner  = $Parts[0]
    $Repo   = $Parts[1]

    if ($Parts.Length -ge 4 -and ($Parts[2] -eq "tree" -or $Parts[2] -eq "blob")) {
        $Branch  = $Parts[3]
        $SubPath = ($Parts[4..($Parts.Length - 1)]) -join "/"
        if ($SubPath -match "\.md$") {
            return "https://raw.githubusercontent.com/$Owner/$Repo/$Branch/$SubPath"
        } elseif ($SubPath) {
            return "https://raw.githubusercontent.com/$Owner/$Repo/$Branch/$SubPath/SKILL.md"
        } else {
            return "https://raw.githubusercontent.com/$Owner/$Repo/$Branch/SKILL.md"
        }
    } else {
        return "https://raw.githubusercontent.com/$Owner/$Repo/main/SKILL.md"
    }
}

function Try-Download {
    param([string]$Url, [string]$OutFile)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            [System.IO.File]::WriteAllBytes($OutFile, $response.Content)
            return $true
        }
    } catch {}
    return $false
}

Write-Host "Installing skills..." -ForegroundColor Cyan
Write-Host ""

foreach ($Line in ($ReadmeContent -split "`n")) {
    $Match = $SkillPattern.Match($Line)
    if (-not $Match.Success) { continue }

    $SkillName = $Match.Groups[2].Value
    $GhPath    = $Match.Groups[3].Value

    # Sanitize filename
    $SafeName = $SkillName -replace '[^a-zA-Z0-9_\-]', '-'
    $OutFile  = Join-Path $CommandsDir "$SafeName.md"

    if (Test-Path $OutFile) {
        Write-Host "  SKIP  $SkillName" -ForegroundColor DarkGray
        $Skip++
        continue
    }

    $RawUrl = Get-RawUrl -GhPath $GhPath
    $ok     = Try-Download -Url $RawUrl -OutFile $OutFile

    # Fallback: try master branch
    if (-not $ok -and $RawUrl -match "/main/") {
        $MasterUrl = $RawUrl -replace "/main/", "/master/"
        $ok = Try-Download -Url $MasterUrl -OutFile $OutFile
    }

    if ($ok) {
        Write-Host "  OK    $SkillName" -ForegroundColor Green
        $Success++
    } else {
        Write-Host "  FAIL  $SkillName" -ForegroundColor Red
        $Failures += $SkillName
        $Fail++
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Installed: $Success skills"              -ForegroundColor Green
Write-Host "  Skipped:   $Skip (already present)"      -ForegroundColor DarkGray
Write-Host "  Failed:    $Fail"                        -ForegroundColor $(if ($Fail -gt 0) { "Yellow" } else { "Green" })
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Skills saved to: $CommandsDir"
Write-Host "Use them in Claude Code as /skill-name"
Write-Host ""

if ($Failures.Count -gt 0) {
    Write-Host "Failed skills (private repos or missing SKILL.md):" -ForegroundColor Yellow
    $Failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
