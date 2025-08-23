import requests
import time
import subprocess
import json
import os
import sys
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger("agent")

CONFIG_FILE = sys.argv[1] if len(sys.argv) > 1 else "agent_config.json"

DEFAULT_CONFIG = {
    "server_url": "http://10.0.2.2:8000",
    "server_id": 1,
    "password": "",   
    "poll_interval": 2
}


if not os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(DEFAULT_CONFIG, f, indent=4)

with open(CONFIG_FILE, "r", encoding="utf-8") as f:
    config = json.load(f)

SERVER_URL = config.get("server_url", DEFAULT_CONFIG["server_url"])
SERVER_ID = config.get("server_id", DEFAULT_CONFIG["server_id"])
POLL_INTERVAL = config.get("poll_interval", DEFAULT_CONFIG["poll_interval"])


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


def send_result(result):
    try:
        url = f"{SERVER_URL}/api/send-result"
        payload = {
            "server_id": SERVER_ID,
            "password": config.get("password"),  
            "result": result
        }
        r = requests.post(url, json=payload, timeout=5)
        if r.status_code == 201:
            log.info("Result sent successfully")
        else:
            log.error(f"Failed to send result: {r.text}")
    except Exception as e:
        log.error(f"Request error: {e}")


def execute_command(cmd):
    try:
        log.info(f"Executing command: {cmd}")
        completed = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        output = completed.stdout.strip() + completed.stderr.strip()
        log.info(f"Command output: {output[:200]}{'...' if len(output) > 200 else ''}")
        return output
    except Exception as e:
        log.error(f"Error executing command: {e}")
        return f"Error executing command: {e}"


def download_script(script_name):
    try:
        url = f"{SERVER_URL}/api/download-script/{script_name}"
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()
            return data.get("content")
        log.error(f"Cannot download script: {r.status_code} {r.text}")
    except Exception as e:
        log.error(f"Failed to download script: {e}")
    return None


def main():
    log.info(f"Agent started with config: {CONFIG_FILE}")
    log.info(f"Connecting to {SERVER_URL} (server_id={SERVER_ID}, poll={POLL_INTERVAL}s)")

    while True:
        cmd_data = get_command()
        if cmd_data and cmd_data.get("command"):
            is_script = cmd_data.get("is_script", False)
            command = cmd_data["command"]

            if is_script:
                log.info(f"Received script: {command}")
                script_content = cmd_data.get("script_content", "")
                temp_path = os.path.join(os.getenv("TEMP", "C:\\Temp"), "agent_temp_script.ps1")

                try:
                    os.makedirs(os.path.dirname(temp_path), exist_ok=True)
                    with open(temp_path, "w", encoding="utf-8") as f:
                        f.write(script_content)
                    log.info(f"Script saved to {temp_path}")
                    result = execute_command(f"powershell -ExecutionPolicy Bypass -File \"{temp_path}\"")
                except Exception as e:
                    log.error(f"Failed to execute script: {e}")
                    result = f"[ERROR] Failed to execute script: {e}"
            else:
                log.info(f"Received command: {command}")
                result = execute_command(command)

            send_result(result)

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
