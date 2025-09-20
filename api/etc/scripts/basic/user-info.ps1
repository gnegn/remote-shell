[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
# ──────────────────────────────────────────────────────────────────────────────
#                            Config
$ignoredPattern = @("admin","administrator","администратор","гость","defaultaccount","softcom","WDAGUtilityAccount", "softcom.it", "softcom_it")
$thresholdDays = 180
$today = Get-Date

$users = Get-LocalUser | Sort-Object Name
$normalUsers = @()
$serviceUsers = @()
$activeCount = 0
$inactiveCount = 0

# ──────────────────────────────────────────────────────────────────────────────
#                               Get data

foreach ($user in $users) {
    $name = $user.Name
    $lname = $name.ToLower()
    $isService = ($ignoredPattern -contains $lname) -or ($lname -match "\.admin$")

    $last = $user.LastLogon
    $displayLast = if ($last) { $last.ToString("dd.MM.yyyy HH:mm:ss") } else { "Never" }
    $status = if ($last -and (($today - $last).Days -le $thresholdDays)) { "Активний" } elseif ($last) { "Неактивний" } else { "Неактивний" }
    $locked = if ($user.Enabled) { "Ні" } else { "Так" }

    $obj = [PSCustomObject]@{
        Користувач   = $name
        ОстаннійВхід = $displayLast
        Активний     = $status
        Заблокований = $locked
    }

    if ($isService) {
        $serviceUsers += $obj
    } else {
        $normalUsers += $obj
        if ($status -eq "Активний") { $activeCount++ } else { $inactiveCount++ }
    }
}
# ──────────────────────────────────────────────────────────────────────────────
#                            Output
Write-Host "`n"
if ($normalUsers.Count -gt 0) { $normalUsers | Sort-Object Активний -Descending | Format-Table -AutoSize } else { Write-Host "Звичайних користувачів не знайдено." }

Write-Host "`n"
Write-Output "Активні користувачі: $activeCount"
Write-Output "Неактивні користувачі: $inactiveCount"
Write-Output "Кількість користувачів створених: $($normalUsers.Count)"

Write-Host "`nСлужбові акаунти:" 
if ($serviceUsers.Count -gt 0) { $serviceUsers | Format-Table -AutoSize } else { Write-Host "Службових акаунтів не знайдено." }