import os
import json
import tkinter as tk
from tkinter import messagebox
import subprocess
import sys
import signal
from datetime import datetime
import threading

CONFIG_DIR = "configs"
LOG_DIR = "logs"
os.makedirs(CONFIG_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

DEFAULT_FONT = ("Segoe UI", 9)


class ConfigManagerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Agent Config Manager")
        self.root.geometry("1000x550")
        self.root.resizable(False, False)

        self.selected_config = None
        self.running_agents = {}  

        try:
            self.root.iconphoto(False, tk.PhotoImage(file="icon.png"))
        except Exception:
            pass

        self.log_text = tk.Text(root, bg="white", fg="black", font=DEFAULT_FONT)
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        right_frame = tk.Frame(root, bg="white")
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        self.config_listbox = tk.Listbox(right_frame, font=DEFAULT_FONT)
        self.config_listbox.pack(fill=tk.BOTH, expand=True)
        self.config_listbox.bind("<<ListboxSelect>>", self.on_config_select)

        btn_frame = tk.Frame(right_frame, bg="white")
        btn_frame.pack(fill=tk.X)

        buttons = [
            ("➕ New", self.new_config),
            ("✏️ Edit", self.edit_selected_config),
            ("💾 Save", self.save_config),
            ("🔄 Refresh", self.refresh_config_list),
            ("❌ Delete", self.delete_config),
            ("▶ Run", self.run_agent),
            ("⏹ Stop", self.stop_agent),
        ]
        for txt, cmd in buttons:
            tk.Button(btn_frame, text=txt, command=cmd, font=DEFAULT_FONT).pack(side=tk.LEFT, padx=3, pady=3)

        self.editor = tk.Text(right_frame, height=15, bg="white", fg="black", font=DEFAULT_FONT)
        self.editor.pack(fill=tk.BOTH, expand=True)

        tk.Label(right_frame, text="Running agents:", font=("Segoe UI", 10, "bold"), bg="white").pack(anchor="w")
        self.running_listbox = tk.Listbox(right_frame, font=DEFAULT_FONT, fg="green")
        self.running_listbox.pack(fill=tk.X)

        self.context_menu = tk.Menu(self.config_listbox, tearoff=0, font=DEFAULT_FONT)
        self.context_menu.add_command(label="Edit", command=self.edit_selected_config)
        self.context_menu.add_command(label="Delete", command=self.delete_config)
        self.config_listbox.bind("<Button-3>", self.show_context_menu)

        self.refresh_config_list()

    def log(self, message: str):
        ts = datetime.now().strftime("%H:%M:%S")
        self.log_text.insert(tk.END, f"[{ts}] {message}\n")
        self.log_text.see(tk.END)

    def refresh_config_list(self):
        self.config_listbox.delete(0, tk.END)
        for file in sorted(os.listdir(CONFIG_DIR)):
            if file.endswith(".json"):
                self.config_listbox.insert(tk.END, file)
        self.log("[INFO] Config list refreshed")

    def get_selected_filename(self):
        selection = self.config_listbox.curselection()
        return self.config_listbox.get(selection[0]) if selection else None

    def on_config_select(self, event=None):
        filename = self.get_selected_filename()
        if filename:
            self.selected_config = os.path.join(CONFIG_DIR, filename)
            self.log(f"[INFO] Selected config: {filename}")
            self.load_config()

    def load_config(self, event=None):
        filename = self.get_selected_filename()
        if not filename:
            return
        try:
            with open(os.path.join(CONFIG_DIR, filename), "r", encoding="utf-8") as f:
                self.editor.delete("1.0", tk.END)
                self.editor.insert(tk.END, f.read())
        except Exception as e:
            self.log(f"[ERROR] Failed to load {filename}: {e}")

    def new_config(self):
        self.show_config_form("New Config")

    def edit_selected_config(self):
        filename = self.get_selected_filename()
        if not filename:
            messagebox.showwarning("Edit Error", "No config selected!")
            return
        try:
            with open(os.path.join(CONFIG_DIR, filename), "r", encoding="utf-8") as f:
                data = json.load(f)
            self.show_config_form("Edit Config", filename, data)
        except Exception as e:
            self.log(f"[ERROR] Failed to edit {filename}: {e}")

    def show_config_form(self, title, filename=None, data=None):
        form = tk.Toplevel(self.root)
        form.title(title)
        form.geometry("350x250")

        entries = {}
        fields = {
            "name": "",
            "server_url": "http://10.0.2.2:8000/",
            "server_id": "1",
            "poll_interval": "5",
            "password": ""
        }
        if data:
            fields.update({k: str(v) for k, v in data.items()})

        for i, (field, value) in enumerate(fields.items()):
            tk.Label(form, text=field, font=DEFAULT_FONT).grid(row=i, column=0, sticky="w")
            entry = tk.Entry(form, font=DEFAULT_FONT)
            entry.grid(row=i, column=1)
            entry.insert(0, value)
            entries[field] = entry

        def save_form():
            try:
                new_data = {f: entries[f].get() for f in fields}
                new_data["server_id"] = int(new_data["server_id"])
                new_data["poll_interval"] = int(new_data["poll_interval"])
            except ValueError:
                messagebox.showerror("Invalid Input", "server_id and poll_interval must be integers!")
                return

            fname = filename or f"{new_data['name']}.json"
            with open(os.path.join(CONFIG_DIR, fname), "w", encoding="utf-8") as f:
                json.dump(new_data, f, indent=4)
            self.refresh_config_list()
            self.log(f"[INFO] Saved {fname}")
            form.destroy()

        tk.Button(form, text="Save", command=save_form, font=DEFAULT_FONT).grid(row=len(fields), column=0, columnspan=2, pady=5)

    def save_config(self):
        filename = self.get_selected_filename()
        if not filename:
            messagebox.showwarning("Save Error", "No config selected!")
            return
        try:
            content = self.editor.get("1.0", tk.END).strip()
            json.loads(content)  # перевірка валідності JSON
            with open(os.path.join(CONFIG_DIR, filename), "w", encoding="utf-8") as f:
                f.write(content)
            self.log(f"[INFO] Saved {filename}")
        except json.JSONDecodeError:
            messagebox.showerror("Invalid JSON", "The config is not valid JSON!")
            self.log("[ERROR] Invalid JSON, save failed")

    def delete_config(self):
        filename = self.get_selected_filename()
        if not filename:
            messagebox.showwarning("Delete Error", "No config selected!")
            return
        if messagebox.askyesno("Confirm Delete", f"Delete {filename}?"):
            try:
                os.remove(os.path.join(CONFIG_DIR, filename))
                self.refresh_config_list()
                self.editor.delete("1.0", tk.END)
                self.log(f"[INFO] Deleted {filename}")
            except Exception as e:
                self.log(f"[ERROR] Failed to delete {filename}: {e}")

    def show_context_menu(self, event):
        try:
            index = self.config_listbox.nearest(event.y)
            self.config_listbox.selection_clear(0, tk.END)
            self.config_listbox.selection_set(index)
            self.context_menu.tk_popup(event.x_root, event.y_root)
        finally:
            self.context_menu.grab_release()

    def run_agent(self):
        if not self.selected_config:
            messagebox.showwarning("Run Error", "No config selected!")
            return

        config_name = os.path.basename(self.selected_config)
        if config_name in self.running_agents:
            self.log(f"[WARN] Agent {config_name} is already running")
            return

        log_file = os.path.join(LOG_DIR, f"agent_{config_name.replace('.json','')}.log")
        self.log(f"[INFO] Running agent with config {self.selected_config}")

        try:
            f = open(log_file, "a", encoding="utf-8")
            proc = subprocess.Popen(
                [sys.executable, "agent.py", self.selected_config],
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                bufsize=1, universal_newlines=True
            )
            self.running_agents[config_name] = proc
            self.running_listbox.insert(tk.END, config_name)

            def reader():
                for line in proc.stdout:
                    ts = datetime.now().strftime("%H:%M:%S")
                    msg = f"[{config_name}] {line.strip()}"
                    self.log_text.insert(tk.END, f"[{ts}] {msg}\n")
                    self.log_text.see(tk.END)
                    f.write(msg + "\n")
                    f.flush()

            threading.Thread(target=reader, daemon=True).start()

        except Exception as e:
            self.log(f"[ERROR] Failed to run agent: {e}")


    def stop_agent(self):
        selection = self.running_listbox.curselection()
        if not selection:
            messagebox.showwarning("Stop Error", "No running agent selected!")
            return
        config_name = self.running_listbox.get(selection[0])

        proc = self.running_agents.get(config_name)
        if proc and proc.poll() is None:  
            try:
                proc.kill()  # force kill
                proc.wait(timeout=5)  
                self.log(f"[INFO] Killed agent {config_name}")
            except Exception as e:
                self.log(f"[ERROR] Failed to kill {config_name}: {e}")
        else:
            self.log(f"[WARN] Agent {config_name} is not running")

        self.running_listbox.delete(selection[0])
        self.running_agents.pop(config_name, None)



if __name__ == "__main__":
    root = tk.Tk()
    ConfigManagerApp(root)
    root.mainloop()
