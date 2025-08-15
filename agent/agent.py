import requests
import time
import subprocess
import platform
import json
import os

CONFIG_FILE = "agent_config.json"

DEFAULT_CONFIG = {
    "server_url": "http://10.10.10.89:8000", 
    "server_id": 1,  
    "poll_interval": 2  
}

if not os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE, "w") as f:
        json.dump(DEFAULT_CONFIG, f, indent=4)

with open(CONFIG_FILE) as f:
    config = json.load(f)

SERVER_URL = config["server_url"]
SERVER_ID = config["server_id"]
POLL_INTERVAL = config["poll_interval"]


def get_command():
    try:
        url = f"{SERVER_URL}/api/get-command/{SERVER_ID}"
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()
            return data
        else:
            print(f"[ERROR] Bad response ({r.status_code}): {r.text}")
    except Exception as e:
        print(f"[ERROR] Request error: {e}")
    return None


def send_result(result):
    """Відправити результат виконання"""
    try:
        url = f"{SERVER_URL}/api/send-result"
        payload = {"server_id": SERVER_ID, "result": result}
        r = requests.post(url, json=payload, timeout=5)
        if r.status_code == 201:
            print("[INFO] Результат відправлено")
        else:
            print(f"[ERROR] Не вдалося відправити результат: {r.text}")
    except Exception as e:
        print(f"[ERROR] Request error: {e}")


def execute_command(cmd):
    """Виконати команду на клієнті"""
    try:
        completed = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        output = completed.stdout.strip() + completed.stderr.strip()
        return output
    except Exception as e:
        return f"Error executing command: {e}"

def download_script(script_name):
    try:
        url = f"{SERVER_URL}/api/download-script/{script_name}"
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()
            return data.get("content")
        else:
            print(f"[ERROR] Cannot download script: {r.status_code} {r.text}")
    except Exception as e:
        print(f"[ERROR] Failed to download script: {e}")
    return None


def main():
    print(f"[INFO] Агент запущено. Підключення до {SERVER_URL}")
    while True:
        cmd_data = get_command()
        if cmd_data and cmd_data.get("command"):
            is_script = cmd_data.get("is_script", False)
            command = cmd_data["command"]
            cmd_id = cmd_data.get("command_id")

            if is_script:
                print(f"[INFO] Отримано скрипт: {command}")
                script_content = cmd_data.get("script_content", "")
                temp_path = os.path.join(os.getenv("TEMP", "C:\\Temp"), "agent_temp_script.ps1")

                try:
                    os.makedirs(os.path.dirname(temp_path), exist_ok=True)
                    with open(temp_path, "w", encoding="utf-8") as f:
                        f.write(script_content)
                    print(f"[INFO] Скрипт збережено в {temp_path}")
                    result = execute_command(f"powershell -ExecutionPolicy Bypass -File \"{temp_path}\"")
                except Exception as e:
                    result = f"[ERROR] Не вдалося виконати скрипт: {e}"
            else:
                print(f"[INFO] Отримано команду: {command}")
                result = execute_command(command)

            send_result(result)
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
