# Install agent skills from VoltAgent/awesome-agent-skills into ~/.claude/skills/
# Run this script on your Windows PC to install skills for Claude Code
#
# Usage:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\install-skills.ps1
#
# Requirements:
#   - PowerShell 5.1+ or PowerShell Core 7+
#   - Internet access to raw.githubusercontent.com and officialskills.sh

$SkillsDir = "$env:USERPROFILE\.claude\skills"
$ReadmeUrl = "https://raw.githubusercontent.com/VoltAgent/awesome-agent-skills/main/README.md"

Write-Host ""
Write-Host "=========================================="  -ForegroundColor Cyan
Write-Host "  Awesome Agent Skills Installer"           -ForegroundColor Cyan
Write-Host "=========================================="  -ForegroundColor Cyan
Write-Host ""

# Download README
Write-Host "Downloading skill list..." -ForegroundColor Cyan
try {
    $ReadmeContent = (Invoke-WebRequest -Uri $ReadmeUrl -UseBasicParsing).Content
} catch {
    Write-Host "ERROR: Could not download README. Check your internet connection." -ForegroundColor Red
    exit 1
}

$Success  = 0
$Fail     = 0
$Skip     = 0
$Total    = 0
$Failures = @()

# ── Helpers ────────────────────────────────────────────────────────────────

function Try-Download {
    param([string]$Url, [string]$OutFile)
    try {
        $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200 -and $r.Content.Length -gt 0) {
            $dir = Split-Path $OutFile -Parent
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
            [System.IO.File]::WriteAllBytes($OutFile, $r.Content)
            return $true
        }
    } catch {}
    return $false
}

function Get-GitHubRawUrl {
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
    }
    return "https://raw.githubusercontent.com/$Owner/$Repo/main/SKILL.md"
}

function Install-Skill {
    param([string]$Author, [string]$SkillName, [string]$Url, [bool]$IsOfficialSkill)

    $OutFile = Join-Path $SkillsDir "$Author\$SkillName\SKILL.md"

    if (Test-Path $OutFile) {
        return "skip"
    }

    if ($IsOfficialSkill) {
        # officialskills.sh skill — try the raw endpoint
        $rawUrl = "https://officialskills.sh/$Author/skills/$SkillName/raw"
        if (Try-Download -Url $rawUrl -OutFile $OutFile) { return "ok" }
        # Fallback: try without /raw
        $rawUrl2 = "https://officialskills.sh/$Author/skills/$SkillName"
        if (Try-Download -Url $rawUrl2 -OutFile $OutFile) { return "ok" }
        return "fail"
    } else {
        # GitHub-linked skill
        $rawUrl = Get-GitHubRawUrl -GhPath $Url
        if (Try-Download -Url $rawUrl -OutFile $OutFile) { return "ok" }
        # Fallback: try master branch
        if ($rawUrl -match "/main/") {
            $masterUrl = $rawUrl -replace "/main/", "/master/"
            if (Try-Download -Url $masterUrl -OutFile $OutFile) { return "ok" }
        }
        return "fail"
    }
}

# ── Parse README ────────────────────────────────────────────────────────────

# Pattern 1 — officialskills.sh: **[author/skill](https://officialskills.sh/author/skills/skill)**
$OfficialPattern = [regex]'\*\*\[([^/\]]+)/([^\]]+)\]\(https://officialskills\.sh/([^/]+)/skills/([^)]+)\)\*\*'

# Pattern 2 — GitHub: **[author/skill](https://github.com/owner/repo/...)**
$GithubPattern   = [regex]'\*\*\[([^/\]]+)/([^\]]+)\]\(https://github\.com/([^)]+)\)\*\*'

Write-Host "Installing skills..." -ForegroundColor Cyan
Write-Host ""

foreach ($Line in ($ReadmeContent -split "`n")) {

    # Try officialskills.sh match first
    $m = $OfficialPattern.Match($Line)
    if ($m.Success) {
        $Author    = $m.Groups[3].Value.Trim()
        $SkillName = $m.Groups[4].Value.Trim()
        $Total++

        $result = Install-Skill -Author $Author -SkillName $SkillName -Url "" -IsOfficialSkill $true

        switch ($result) {
            "ok"   { Write-Host "  OK    $Author/$SkillName" -ForegroundColor Green;   $Success++ }
            "skip" { Write-Host "  SKIP  $Author/$SkillName" -ForegroundColor DarkGray; $Skip++ }
            "fail" { Write-Host "  FAIL  $Author/$SkillName" -ForegroundColor Red;     $Failures += "$Author/$SkillName"; $Fail++ }
        }

        if ($Total % 50 -eq 0) {
            Write-Host ""
            Write-Host "  ... $Total skills processed (OK:$Success  Skip:$Skip  Fail:$Fail) ..." -ForegroundColor Cyan
            Write-Host ""
        }
        continue
    }

    # Try GitHub match
    $m = $GithubPattern.Match($Line)
    if ($m.Success) {
        $Author    = $m.Groups[1].Value.Trim()
        $SkillName = $m.Groups[2].Value.Trim() -replace '[^a-zA-Z0-9_\-]', '-'
        $GhPath    = $m.Groups[3].Value.Trim()
        $Total++

        $result = Install-Skill -Author $Author -SkillName $SkillName -Url $GhPath -IsOfficialSkill $false

        switch ($result) {
            "ok"   { Write-Host "  OK    $Author/$SkillName" -ForegroundColor Green;    $Success++ }
            "skip" { Write-Host "  SKIP  $Author/$SkillName" -ForegroundColor DarkGray; $Skip++ }
            "fail" { Write-Host "  FAIL  $Author/$SkillName" -ForegroundColor Red;      $Failures += "$Author/$SkillName"; $Fail++ }
        }

        if ($Total % 50 -eq 0) {
            Write-Host ""
            Write-Host "  ... $Total skills processed (OK:$Success  Skip:$Skip  Fail:$Fail) ..." -ForegroundColor Cyan
            Write-Host ""
        }
    }
}

# ── Summary ─────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Total processed: $Total"
Write-Host "  Installed:       $Success skills"        -ForegroundColor Green
Write-Host "  Skipped:         $Skip (already present)" -ForegroundColor DarkGray
Write-Host "  Failed:          $Fail"                  -ForegroundColor $(if ($Fail -gt 0) { "Yellow" } else { "Green" })
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Skills saved to: $SkillsDir"
Write-Host ""
Write-Host "Structure:"
Write-Host "  $SkillsDir\"
Write-Host "    anthropics\docx\SKILL.md"
Write-Host "    stripe\stripe-best-practices\SKILL.md"
Write-Host "    ..."
Write-Host ""
Write-Host "Use them in Claude Code as /skill-name"
Write-Host ""

if ($Failures.Count -gt 0) {
    Write-Host "Failed ($($Failures.Count) — private repos or missing SKILL.md):" -ForegroundColor Yellow
    $Failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
