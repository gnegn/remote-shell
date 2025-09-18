# Define variables
$url = "https://nssm.cc/release/nssm-2.24.zip"
$destinationFolder = "C:\RmAgent"
$zipFile = "$destinationFolder\nssm.zip"
$installBatchFile = "$destinationFolder\install_agent_service.bat"
$removeBatchFile = "$destinationFolder\remove_agent_service.bat"

# Create the destination folder if it doesn't exist
if (-not (Test-Path $destinationFolder)) {
    Write-Host "Creating folder: $destinationFolder"
    New-Item -Path $destinationFolder -ItemType Directory | Out-Null
}

# Download the NSSM zip file if it doesn't exist
if (-not (Test-Path $zipFile)) {
    Write-Host "Downloading NSSM from $url"
    Invoke-WebRequest -Uri $url -OutFile $zipFile
} else {
    Write-Host "NSSM zip file already exists. Skipping download."
}

# Unzip the file
Write-Host "Extracting NSSM..."
Expand-Archive -Path $zipFile -DestinationPath $destinationFolder -Force

# --- Content for the Install Batch File ---
$installBatchFileContent = @"
@echo off

REM Set the service name
set "SERVICE_NAME=RmAgent"

REM Set the path to the nssm executable
set "NSSM_PATH=C:\RmAgent\nssm-2.24\win64\nssm.exe"

REM Set the path to the agent executable
set "AGENT_PATH=C:\RmAgent\agent.exe"

REM Check if NSSM exists
if not exist "%NSSM_PATH%" (
    echo Error: nssm.exe not found at %NSSM_PATH%
    pause
    exit /b 1
)

REM Check if the agent executable exists
if not exist "%AGENT_PATH%" (
    echo Error: agent.exe not found at %AGENT_PATH%
    pause
    exit /b 1
)

REM Use NSSM to install the service
echo Installing service "%SERVICE_NAME%" with agent.exe...
"%NSSM_PATH%" install "%SERVICE_NAME%" "%AGENT_PATH%"

REM Optional: Set a description for the service
"%NSSM_PATH%" set "%SERVICE_NAME%" Description "My custom RmAgent service for monitoring."

echo Service "%SERVICE_NAME%" installed successfully.
pause
"@

# Create and write the content to the install batch file
Write-Host "Creating install batch file: $installBatchFile"
$installBatchFileContent | Out-File -FilePath $installBatchFile -Encoding Ascii

# --- Content for the Remove Batch File ---
$removeBatchFileContent = @"
@echo off

REM Set the service name
set "SERVICE_NAME=RmAgent"

REM Set the path to the nssm executable
set "NSSM_PATH=C:\RmAgent\nssm-2.24\win64\nssm.exe"

REM Check if NSSM exists
if not exist "%NSSM_PATH%" (
    echo Error: nssm.exe not found at %NSSM_PATH%
    pause
    exit /b 1
)

REM Stop the service first
echo Attempting to stop service "%SERVICE_NAME%"...
sc stop "%SERVICE_NAME%"

REM Use NSSM to remove the service
echo Removing service "%SERVICE_NAME%"...
"%NSSM_PATH%" remove "%SERVICE_NAME%"

echo Service "%SERVICE_NAME%" removed.
pause
"@

# Create and write the content to the remove batch file
Write-Host "Creating remove batch file: $removeBatchFile"
$removeBatchFileContent | Out-File -FilePath $removeBatchFile -Encoding Ascii

# Optional: Clean up the downloaded zip file
Remove-Item $zipFile

Write-Host "Script completed successfully."
Write-Host "Please run the '$installBatchFile' or '$removeBatchFile' as an administrator to manage the service."