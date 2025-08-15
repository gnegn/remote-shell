from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Server, PendingCommand, CommandResult
from config import Config
from datetime import datetime
import os
import flask
import logging


app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.logger.setLevel(logging.INFO)

with app.app_context():
    db.create_all() 

# Function to create tables if they do not exist
def create_tables():
    db.create_all()

# Function to convert Server object to JSON 
def server_to_json(s: Server):
    return {
        "id": s.id,
        "name": s.name,
        "remote-url": s.remote_url,
        "usable-by": s.usable_by,
        "created-at": s.created_at.isoformat() if s.created_at else None,
        "created-by": s.created_by,
        "1c-name": s.one_c_name
    }

def pick_field(data, *variants):
    for v in variants:
        if v in data:
            return data[v]
    return None

# -------------------------API Endpoints-------------------------

# GET all
@app.route("/api/servers", methods=["GET"])
def get_servers():
    servers = Server.query.order_by(Server.created_at.desc()).all()
    return jsonify([server_to_json(s) for s in servers]), 200

# GET single
@app.route("/api/servers/<int:server_id>", methods=["GET"])
def get_server(server_id):
    s = Server.query.get_or_404(server_id)
    return jsonify(server_to_json(s)), 200

# CREATE
@app.route("/api/servers", methods=["POST"])
def create_server():
    data = request.get_json() or {}

    name = pick_field(data, "name", "Name")
    remote_url = pick_field(data, "remote-url", "remote_url", "remoteUrl")
    usable_by = pick_field(data, "usable-by", "usable_by", "usableBy") or ""
    created_by = pick_field(data, "created-by", "created_by", "createdBy")
    one_c_name = pick_field(data, "1c-name", "one_c_name", "oneCName")

    if not name or not remote_url or not created_by:
        return jsonify({"error": "Missing required fields: name, remote-url, created-by"}), 400

    s = Server(
        name=name,
        remote_url=remote_url,
        usable_by=usable_by,
        created_by=created_by,
        one_c_name=one_c_name
    )
    db.session.add(s)
    db.session.commit()
    return jsonify(server_to_json(s)), 201

# ----------------------------COMMANDS--------------------------------

# Send Command
@app.route("/api/send-command", methods=["POST"])
def send_command():
    data = request.get_json() or {}
    script = data.get("script")  # наприклад: "basic/sys-info.ps1"
    command = data.get("command")
    server_id = data.get("server_id")

    if not server_id or (not script and not command):
        return jsonify({"error": "Missing server_id and script/command"}), 400

    if not Server.query.get(server_id):
        return jsonify({"error": "Server not found"}), 404

    if script:
        command = script
        is_script = True
    else:
        is_script = False

    cmd = PendingCommand(server_id=server_id, command=command, is_script=is_script)
    db.session.add(cmd)
    db.session.commit()

    return jsonify({"status": "ok", "command_id": cmd.id}), 201

# PULL Command
@app.route("/api/get-command/<int:server_id>", methods=["GET"])
def get_command_for_agent(server_id):
    cmd = PendingCommand.query.filter_by(server_id=server_id).order_by(PendingCommand.created_at.asc()).first()
    if cmd:
        payload = {
            "command_id": cmd.id,
            "command": cmd.command,
            "is_script": cmd.is_script
        }

        # Якщо це скрипт, додаємо вміст скрипта:
        if cmd.is_script:
            script_path = os.path.join("etc", "scripts", cmd.command)
            try:
                with open(script_path, "r", encoding="utf-8") as f:
                    payload["script_content"] = f.read()
            except Exception as e:
                payload["script_content"] = f"# Error loading script: {e}"

        db.session.delete(cmd)
        db.session.commit()
        return jsonify(payload), 200
    return jsonify({"command": None}), 200

# SEND Result
@app.route("/api/send-result", methods=["POST"])
def send_result():
    data = request.get_json() or {}
    app.logger.info(f"Received send-result request with data: {data}")

    server_id = data.get("server_id")
    result = data.get("result")
    if not server_id or result is None:
        app.logger.warning("send-result: Missing server_id or result")
        return jsonify({"error": "server_id and result are required"}), 400

    res = CommandResult(server_id=server_id, result=result)
    db.session.add(res)
    db.session.commit()
    app.logger.info(f"send-result: Result stored for server_id {server_id}")
    return jsonify({"status": "Result stored"}), 201

# GET Result
@app.route("/api/get-result/<int:server_id>", methods=["GET"])
def get_result(server_id):
    app.logger.info(f"get-result: Request for server_id {server_id}")
    res = CommandResult.query.filter_by(server_id=server_id).order_by(CommandResult.created_at.desc()).first()
    if res:
        app.logger.info(f"get-result: Returning result created at {res.created_at.isoformat()} for server_id {server_id}")
        return jsonify({"result": res.result, "created_at": res.created_at.isoformat()}), 200
    app.logger.info(f"get-result: No results found for server_id {server_id}")
    return jsonify({"result": None}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=True)
