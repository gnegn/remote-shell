import os
import json
import tkinter as tk
from tkinter import messagebox

# ───────────────────────────────────── Dir ─────────────────────────────────────
BASE_DIR = r"C:\RmAgent"
CONFIG_DIR = os.path.join(BASE_DIR, "config")
TEMP_DIR = os.path.join(BASE_DIR, "temp")
os.makedirs(CONFIG_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# ───────────────────────────────────── Agent template ─────────────────────────────────────

AGENT_CODE_TEMPLATE = '''import requests
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

BASE_DIR = r"{base_dir}"
CONFIG_FILE = os.path.join(BASE_DIR, "config", "{config_filename}")

TEMP_DIR = os.path.join(BASE_DIR, "temp")
os.makedirs(TEMP_DIR, exist_ok=True)
TEMP_SCRIPT = os.path.join(TEMP_DIR, "agent_temp_script.ps1")

if not os.path.exists(CONFIG_FILE):
    log.error(f"Config file {{CONFIG_FILE}} not found!")
    sys.exit(1)

with open(CONFIG_FILE, "r", encoding="utf-8") as f:
    config = json.load(f)

SERVER_URL = config.get("server_url")
SERVER_ID = config.get("server_id")
POLL_INTERVAL = int(config.get("poll_interval", 5))
PASSWORD = config.get("password")

def get_command():
    try:
        url = f"{{SERVER_URL}}/api/get-command/{{SERVER_ID}}"
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            return r.json()
        log.error(f"Bad response ({{r.status_code}}): {{r.text}}")
    except Exception as e:
        log.error(f"Request error: {{e}}")
    return None

def send_result(command_id, result):
    try:
        url = f"{{SERVER_URL}}/api/send-result"
        payload = {{
            "server_id": SERVER_ID,
            "command_id": command_id,
            "password": PASSWORD,
            "result": result
        }}
        r = requests.post(url, json=payload, timeout=5)
        if r.status_code == 201:
            log.info(f"Result for command_id {{command_id}} sent successfully")
        else:
            log.error(f"Failed to send result: {{r.text}}")
    except Exception as e:
        log.error(f"Request error: {{e}}")

def execute_command(cmd):
    try:
        log.info(f"Executing command: {{cmd}}")
        completed = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8")
        output = completed.stdout.strip() + completed.stderr.strip()
        log.info(f"Command output: {{output[:200]}}{{'...' if len(output) > 200 else ''}}")
        return output
    except Exception as e:
        log.error(f"Error executing command: {{e}}")
        return f"Error executing command: {{e}}"

def main():
    log.info(f"Agent started with config: {{CONFIG_FILE}}")
    log.info(f"Connecting to {{SERVER_URL}} (server_id={{SERVER_ID}}, poll={{POLL_INTERVAL}}s)")

    while True:
        cmd_data = get_command()
        if cmd_data and cmd_data.get("command"):
            command = cmd_data["command"]
            is_script = cmd_data.get("is_script", False)

            if is_script:
                log.info(f"Received script: {{command}}")
                script_content = cmd_data.get("script_content", "")
                try:
                    with open(TEMP_SCRIPT, "w", encoding="utf-8") as f:
                        f.write(script_content)
                    log.info(f"Script saved to {{TEMP_SCRIPT}}")
                    result = execute_command(f'powershell -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; & \'{{TEMP_SCRIPT}}\'"')
                except Exception as e:
                    log.error(f"Failed to execute script: {{e}}")
                    result = f"[ERROR] Failed to execute script: {{e}}"
            else:
                log.info(f"Received command: {{command}}")
                result = execute_command(command)

            send_result(cmd_data["command_id"], result)

        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
'''


# ───────────────────────────────────── GUI ─────────────────────────────────────
root = tk.Tk()
root.title("Config Generator")

def paste(event):
    event.widget.insert(tk.INSERT, root.clipboard_get())
    return "break"

def save_config():
    config_name = entry_config_name.get().strip()
    server_url = entry_server_url.get().strip()
    server_id = entry_server_id.get().strip()
    password = entry_password.get().strip()
    poll_interval = entry_poll_interval.get().strip()

    if not config_name:
        messagebox.showerror("Error", "config_name can not be empty!")
        return

    config_filename = f"{config_name}.json"
    config_data = {
        "config_name": config_name,
        "server_url": server_url,
        "server_id": server_id,
        "password": password,
        "poll_interval": int(poll_interval) if poll_interval.isdigit() else 5
    }

    # ─────────────────────────────── Save config ───────────────────────────────
    config_path = os.path.join(CONFIG_DIR, config_filename)
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config_data, f, indent=4, ensure_ascii=False)

    # ─────────────────────────────── Make agent ───────────────────────────────
    agent_filename = os.path.join(BASE_DIR, f"agent_{config_name}.py")
    agent_code = AGENT_CODE_TEMPLATE.format(
        config_filename=config_filename,
        base_dir=BASE_DIR.replace("\\", "\\\\") 
    )

    with open(agent_filename, "w", encoding="utf-8") as f:
        f.write(agent_code)

    messagebox.showinfo("Success!", f"Config {config_filename} created, agent {agent_filename} created")
    root.destroy()

labels = ["config_name:", "server_url:", "server_id:", "password:", "poll_interval:"]
entries = []

for i, text in enumerate(labels):
    tk.Label(root, text=text).grid(row=i, column=0, sticky="w", padx=5, pady=5)
    entry = tk.Entry(root, width=30)
    if text == "password:":
        entry.config(show="*")
    entry.grid(row=i, column=1, padx=5, pady=5)
    entry.bind("<Control-v>", paste) 
    entries.append(entry)

entry_config_name, entry_server_url, entry_server_id, entry_password, entry_poll_interval = entries

btn_save = tk.Button(root, text="OK", command=save_config)
btn_save.grid(row=5, column=0, columnspan=2, pady=10)

root.mainloop()
