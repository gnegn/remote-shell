import requests
import time
import subprocess
import json
import os
import sys
import logging

# ──────────────────────────────────────────────────────────────────────────────
#                                Logging configuration

log_file = "agent.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(log_file, encoding="utf-8")
    ]
)
log = logging.getLogger("agent")

# ──────────────────────────────────────────────────────────────────────────────
#                                Directories & files

if getattr(sys, 'frozen', False):
    SCRIPT_DIR = os.path.dirname(sys.executable)
else:
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

CONFIG_FILE = os.path.join(SCRIPT_DIR, "config.json")
TEMP_DIR = os.path.join(SCRIPT_DIR, "temp")
os.makedirs(TEMP_DIR, exist_ok=True)
TEMP_SCRIPT = os.path.join(TEMP_DIR, "agent_temp_script.ps1")

# ──────────────────────────────────────────────────────────────────────────────
#                                Config file handling

if not os.path.exists(CONFIG_FILE):
    log.error(f"Config file {CONFIG_FILE} not found!")
    log.error(f"Please create a config.json file in the same directory as this exe: {SCRIPT_DIR}")
    sys.exit(1)

try:
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)
except json.JSONDecodeError as e:
    log.error(f"Invalid JSON in config file {CONFIG_FILE}: {e}")
    sys.exit(1)
except Exception as e:
    log.error(f"Error reading config file {CONFIG_FILE}: {e}")
    sys.exit(1)

SERVER_URL = config.get("server_url")
SERVER_ID = config.get("server_id")
POLL_INTERVAL = int(config.get("poll_interval", 5))
PASSWORD = config.get("password")

if not SERVER_URL or not SERVER_ID or not PASSWORD:
    log.error("Missing required configuration fields (server_url, server_id, password)")
    sys.exit(1)

# ──────────────────────────────────────────────────────────────────────────────
#                                API Communication

def get_command():
    try:
        url = f"{SERVER_URL}/api/get-command/{SERVER_ID}"
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            return r.json()
        log.error(f"Bad response ({r.status_code}): {r.text}")
    except Exception as e:
        log.error(f"Request error: {e}")
    return None

def send_result(command_id, result):
    try:
        url = f"{SERVER_URL}/api/send-result"
        payload = {
            "server_id": SERVER_ID,
            "command_id": command_id,
            "password": PASSWORD,
            "result": result
        }
        r = requests.post(url, json=payload, timeout=5)
        if r.status_code == 201:
            log.info(f"Result for command_id {command_id} sent successfully")
        else:
            log.error(f"Failed to send result: {r.text}")
    except Exception as e:
        log.error(f"Request error: {e}")

# ──────────────────────────────────────────────────────────────────────────────
#                                Command execution

def execute_command(cmd):
    try:
        log.info(f"Executing command: {cmd}")
        completed = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8")
        output = (completed.stdout or "") + (completed.stderr or "")
        log.info(f"Command output: {output[:200]}{'...' if len(output) > 200 else ''}")
        return output
    except Exception as e:
        log.error(f"Error executing command: {e}")
        return f"Error executing command: {e}"

# ──────────────────────────────────────────────────────────────────────────────
#                                Main agent loop

def main():
    log.info(f"Agent started with config: {CONFIG_FILE}")
    log.info(f"Connecting to {SERVER_URL} (server_id={SERVER_ID}, poll={POLL_INTERVAL}s)")

    while True:
        cmd_data = get_command()

        if cmd_data and cmd_data.get("command"):
            command = cmd_data["command"]
            is_script = cmd_data.get("is_script", False)

            if is_script:
                log.info(f"Received script: {command}")
                script_content = cmd_data.get("script_content", "")
                try:
                    with open(TEMP_SCRIPT, "w", encoding="utf-8") as f:
                        f.write(script_content)
                    log.info(f"Script saved to {TEMP_SCRIPT}")
                    
                    powershell_exe = r"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
                    powershell_cmd = f'"{powershell_exe}" -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; & \'{TEMP_SCRIPT}\'"'
                    result = execute_command(powershell_cmd)
                except Exception as e:
                    log.error(f"Failed to execute script: {e}")
                    result = f"[ERROR] Failed to execute script: {e}"
            else:
                log.info(f"Received command: {command}")
                result = execute_command(command)

            send_result(cmd_data["command_id"], result)
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
