[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ──────────────────────────────────────────────────────────────────────────────
#                               CPU Info
$cpuCores = (Get-CimInstance -ClassName Win32_Processor |
             Measure-Object -Property NumberOfCores -Sum).Sum
if (-not $cpuCores) { 
    $cpuCores = (Get-CimInstance -ClassName Win32_Processor |
                 Measure-Object -Property NumberOfLogicalProcessors -Sum).Sum 
}

# ──────────────────────────────────────────────────────────────────────────────
#                               RAM Info
$ramBytes = (Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory
$ramGB = [math]::Round($ramBytes / 1GB, 2)

# ──────────────────────────────────────────────────────────────────────────────
#                            Total disk space
$fixedDrives = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DriveType=3"
$diskFreeBytes = ($fixedDrives | Measure-Object -Property FreeSpace -Sum).Sum
$diskTotalBytes = ($fixedDrives | Measure-Object -Property Size -Sum).Sum

$diskFreeGB  = if ($diskFreeBytes)  { [math]::Round($diskFreeBytes  / 1GB, 2) } else { 0 }
$diskTotalGB = if ($diskTotalBytes) { [math]::Round($diskTotalBytes / 1GB, 2) } else { 0 }

# ──────────────────────────────────────────────────────────────────────────────
#                                  OS
$os = Get-CimInstance -ClassName Win32_OperatingSystem
$osName = $os.Caption
$osVersion = $os.Version

# ──────────────────────────────────────────────────────────────────────────────
#                               Activation
$activationStatus = "Unknown"
try {
    $sl = Get-CimInstance -ClassName SoftwareLicensingProduct `
          -Filter "PartialProductKey IS NOT NULL AND LicenseStatus=1" -ErrorAction Stop
    if ($sl) {
        $activationStatus = "Activated"
    } else {
        $activationStatus = "Not activated"
    }
} catch {
    $activationStatus = "Check failed: $_"
}

# ──────────────────────────────────────────────────────────────────────────────
#                                 Uptime
$lastBoot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
if ($lastBoot -is [string]) {
    $bootDT = [Management.ManagementDateTimeConverter]::ToDateTime($lastBoot)
} else {
    $bootDT = $lastBoot
}
$uptime = (New-TimeSpan -Start $bootDT -End (Get-Date))

# ──────────────────────────────────────────────────────────────────────────────
#                 Session info (LogonType = 10 => RemoteInteractive)
function Get-RDPSessions {
    $sessions = @()
    try {
        $rdpSessions = Get-CimInstance -ClassName Win32_LogonSession -Filter "LogonType = 10"
        foreach ($s in $rdpSessions) {
            $accounts = Get-CimAssociatedInstance -InputObject $s -ResultClassName Win32_Account -ErrorAction SilentlyContinue
            foreach ($a in $accounts) {
                $sessions += [PSCustomObject]@{
                    User        = ($a.Domain + "\" + $a.Name)
                    LogonId     = $s.LogonId
                    StartTime   = if ($s.StartTime) { ([Management.ManagementDateTimeConverter]::ToDateTime($s.StartTime)) } else { $null }
                    AuthenticationPackage = $s.AuthenticationPackage
                }
            }
        }
    } catch {
        $q = (quser 2>$null)
        if ($q) {
            $lines = $q | Select-Object -Skip 1
            foreach ($ln in $lines) {
                $cols = ($ln -replace '^\s+','') -split '\s+'
                if ($cols.Count -ge 1) {
                    $sessions += [PSCustomObject]@{
                        User = $cols[0]
                        LogonId = $null
                        StartTime = $null
                        AuthenticationPackage = $null
                    }
                }
            }
        }
    }
    return $sessions
}

$rdp = Get-RDPSessions

# ──────────────────────────────────────────────────────────────────────────────
#                                   Output
Write-Host "System Information`n"

Write-Host "Resources:"
Write-Host "CPU cores: $cpuCores"
Write-Host ("  RAM (Total physical): {0} GB" -f $ramGB)
Write-Host ("  Disk space (free/total): {0} GB / {1} GB" -f $diskFreeGB, $diskTotalGB)
Write-Host ""

$compactCpu = $cpuCores
$compactRam = [math]::Round($ramGB) 
$compactDisk = [math]::Round($diskFreeGB)
$compact = "{0}/{1}/{2}" -f $compactCpu, $compactRam, $compactDisk
Write-Host "Recources (compactly): $compact"
Write-Host ""

Write-Host "OS: $osName (Version $osVersion)"
Write-Host "Activation status: $activationStatus"
Write-Host ""

$days = $uptime.Days
$hours = $uptime.Hours
$minutes = $uptime.Minutes
Write-Host ("Uptime: {0} days, {1} hours, {2} minutes (last boot: {3})" -f $days, $hours, $minutes, $bootDT)
Write-Host ""

Write-Host "Active RDP session:"
if ($rdp -and $rdp.Count -gt 0) {
    $i = 1
    foreach ($s in $rdp) {
        $start = if ($s.StartTime) { $s.StartTime } else { "unknown" }
        Write-Host ("  {0}. User: {1}   LogonId: {2}   Start: {3}" -f $i, $s.User, ($s.LogonId -as [string]), $start)
        $i++ 
    }
} else {
    Write-Host "  No active RDP session."
}
