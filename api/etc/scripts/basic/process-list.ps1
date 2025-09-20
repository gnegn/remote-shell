# Отримуємо всі процеси з інформацією про пам'ять та CPU
Get-Process | Select-Object `
    Id, `
    ProcessName, `
    @{Name="Memory (MB)";Expression={ "{0:N2}" -f ($_.WorkingSet / 1MB) }}, `
    @{Name="CPU (s)";Expression={ "{0:N2}" -f ($_.CPU) }}, `
    @{Name="Threads";Expression={$_.Threads.Count}} |
# Сортуємо за використанням пам'яті (спадання)
Sort-Object "Memory (MB)" -Descending |
# Виводимо красиво у таблицю
Format-Table -AutoSize
