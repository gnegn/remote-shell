from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Server
from config import Config
from datetime import datetime
import os
import flask

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

with app.app_context():
    db.create_all() 

print("Flask version:", flask.__version__)

def create_tables():
    db.create_all()

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

# GET list
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=True)
