agent/temp# PowerShell script: Analyze-Freeable-Space.ps1

Write-Host "🔎 Аналіз зайвих файлів, які можна видалити..."

# Функція для отримання розміру директорії
function Get-FolderSize {
    param([string]$Path)
    if (Test-Path $Path) {
        return (Get-ChildItem -Path $Path -Recurse -ErrorAction SilentlyContinue | 
                Measure-Object -Property Length -Sum).Sum
    }
    return 0
}

# Тимчасові папки
$tempUser = $env:TEMP
$tempWindows = "$env:windir\Temp"

# Кеши Windows Update
$updateCache = "$env:windir\SoftwareDistribution\Download"

# Prefetch
$prefetch = "$env:windir\Prefetch"

# Журнал оновлень драйверів
$driverCache = "$env:windir\System32\DriverStore\FileRepository"

# Кошик (усі диски)
function Get-RecycleBinSize {
    $shell = New-Object -ComObject Shell.Application
    $bin = $shell.Namespace(0xA) # Recycle Bin
    $size = 0
    foreach ($item in $bin.Items()) {
        $size += $item.Size
    }
    return $size
}

# Збираємо результати
$result = @{}
$result["Temp (користувач)"] = Get-FolderSize $tempUser
$result["Temp (Windows)"]   = Get-FolderSize $tempWindows
$result["Windows Update кеш"] = Get-FolderSize $updateCache
$result["Prefetch"] = Get-FolderSize $prefetch
$result["Driver Cache"] = Get-FolderSize $driverCache
$result["Кошик"] = Get-RecycleBinSize

# Виводимо результати у зручному форматі
$total = 0
foreach ($key in $result.Keys) {
    $mb = [Math]::Round($result[$key] / 1MB, 2)
    $total += $result[$key]
    Write-Host "$key : $mb MB"
}

Write-Host "-----------------------------------"
Write-Host "Загалом можна потенційно звільнити: " ([Math]::Round($total / 1GB, 2)) "GB"
