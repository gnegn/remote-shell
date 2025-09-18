[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ignoredPattern = @(
    "admin",
    "administrator",
    "администратор",   
    "адміністратор", 
    "гость",           
    "defaultaccount",
    "softcom",
    "WDAGUtilityAccount",
    "softcom.it",
    "softcom_it"
)

$thresholdDays = 180
$today = Get-Date

$users = Get-LocalUser | Sort-Object Name
$normalUsers = @()  
$serviceUsers = @()  
$activeCount = 0     
$inactiveCount = 0   

foreach ($user in $users) {
    $name = $user.Name
    $lname = $name.ToLower()

    $isService = ($ignoredPattern -contains $lname) -or ($lname -match "\.admin$")

    $last = $user.LastLogon
    $displayLast = if ($last) { 
        $last.ToString("dd.MM.yyyy HH:mm:ss") 
    } else { 
        "Never" 
    }

    $status = if ($last -and (($today - $last).Days -le $thresholdDays)) { 
        "Active" 
    } elseif ($last) { 
        "Inactive" 
    } else { 
        "Inactive" 
    }

    $locked = if ($user.Enabled) { "No" } else { "Yes" }

    $obj = [PSCustomObject]@{
        User         = $name
        LastLogon    = $displayLast
        Active       = $status
        Locked       = $locked
    }

    if ($isService) {
        $serviceUsers += $obj
    } else {
        $normalUsers += $obj
        if ($status -eq "Active") { 
            $activeCount++ 
        } else { 
            $inactiveCount++ 
        }
    }
}

Write-Host "`n"
Write-Host "===== USERS ====="
if ($normalUsers.Count -gt 0) { 
    $normalUsers | Sort-Object Active -Descending | Format-Table -AutoSize 
} else { 
    Write-Host "No regular users found." 
}

Write-Output "===================================="
Write-Output "Active users: $activeCount"
Write-Output "Inactive users: $inactiveCount"
Write-Output "Total created users: $($normalUsers.Count)"

Write-Host "`n===== SERVICE ACCOUNTS =====" -ForegroundColor Yellow
if ($serviceUsers.Count -gt 0) { 
    $serviceUsers | Format-Table -AutoSize 
} else { 
    Write-Host "No service accounts found." 
}
