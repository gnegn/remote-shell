# routes.py
from flask import request, jsonify
from models import Server, PendingCommand, CommandResult, db
from utils import pick_field, generate_password, server_to_json
import os
from utils import auth_required
from models import Server, PendingCommand, CommandResult, UserServer, db
from models import User
from werkzeug.security import generate_password_hash
import jwt
from datetime import datetime, timedelta
from flask import current_app


def init_app(app):

    # -------------------- SERVERS --------------------
    # GET /api/servers - list of servers
    # GET /api/servers/<id> - server information
    # POST /api/servers - create server
    # GET /api/servers/last-created - get the last created server

    @app.route("/api/servers", methods=["GET"])
    @auth_required()
    def get_servers(user):  
        servers = Server.query.order_by(Server.created_at.desc()).all()
        return jsonify([server_to_json(s) for s in servers]), 200

    @app.route("/api/servers/<int:server_id>", methods=["GET"])
    @auth_required()
    def get_server(user, server_id):
        s = Server.query.get_or_404(server_id)
        return jsonify(server_to_json(s)), 200

    @app.route("/api/servers", methods=["POST"])
    @auth_required()
    def create_server(user): 
        data = request.get_json() or {}
        name = pick_field(data, "name", "Name")
        remote_url = pick_field(data, "remote-url", "remote_url", "remoteUrl")
        created_by = pick_field(data, "created-by", "created_by", "createdBy")
        one_c_name = pick_field(data, "1c-name", "one_c_name", "oneCName")

        if not name or not remote_url or not created_by:
            return jsonify({"error": "Missing required fields: name, remote-url, created-by"}), 400

        password = generate_password()
        s = Server(
            name=name,
            remote_url=remote_url,
            created_by=created_by,
            one_c_name=one_c_name,
            agent_password=password
        )
        db.session.add(s)
        db.session.commit()

        response = server_to_json(s)
        response["agent_password"] = password
        return jsonify(response), 201


    @app.route("/api/servers/last-created", methods=["GET"])
    @auth_required()
    def get_last_created_server(user):
        s = Server.query.order_by(Server.created_at.desc()).first()
        if not s:
            return jsonify({"error": "No servers found"}), 404

        response = server_to_json(s)
        response["agent_password"] = s.agent_password
        return jsonify(response), 200


    # -------------------- COMMANDS --------------------
    # POST /api/send-command - create a command
    # GET /api/get-command/<server_id> - get a command for the agent


    @app.route("/api/send-command", methods=["POST"])
    @auth_required()
    def send_command(user):
        data = request.get_json() or {}
        script = data.get("script")
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

    @app.route("/api/get-command/<int:server_id>", methods=["GET"])
    def get_command_for_agent(server_id): 
        cmd = PendingCommand.query.filter_by(server_id=server_id).order_by(PendingCommand.created_at.asc()).first()
        if cmd:
            payload = {"command_id": cmd.id, "command": cmd.command, "is_script": cmd.is_script}
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


    # -------------------- RESULTS --------------------
    # POST /api/send-result - send the result of command execution
    # GET /api/get-result/<server_id> - get the latest command execution result


    @app.route("/api/send-result", methods=["POST"])
    def send_result():  
        data = request.get_json() or {}
        app.logger.info(f"Received send-result request with data: {data}")

        server_id = data.get("server_id")
        result = data.get("result")
        password = data.get("password")

        if not server_id or result is None or not password:
            return jsonify({"error": "server_id, result and password are required"}), 400

        server = Server.query.get(server_id)
        if not server:
            return jsonify({"error": "Server not found"}), 404

        if server.agent_password != password:
            app.logger.warning(f"send-result: Wrong password for server_id {server_id}")
            return jsonify({"error": "Invalid password"}), 403

        res = CommandResult(server_id=server_id, result=result)
        db.session.add(res)
        db.session.commit()
        app.logger.info(f"send-result: Result stored for server_id {server_id}")
        return jsonify({"status": "Result stored"}), 201

    @app.route("/api/get-result/<int:server_id>", methods=["GET"])
    def get_result(server_id): 
        app.logger.info(f"get-result: Request for server_id {server_id}")
        res = CommandResult.query.filter_by(server_id=server_id).order_by(CommandResult.created_at.desc()).first()
        if res:
            app.logger.info(f"get-result: Returning result created at {res.created_at.isoformat()} for server_id {server_id}")
            return jsonify({"result": res.result, "created_at": res.created_at.isoformat()}), 200
        app.logger.info(f"get-result: No results found for server_id {server_id}")
        return jsonify({"result": None}), 200

    #------------------- USERS --------------------------
    # GET /api/users - list users 
    # PUT /api/users/<username>/password - update user password 
    # DELETE /api/users/<username> - delete user
    # POST /api/users - create user

    @app.route("/api/users", methods=["GET"])
    @auth_required(role="admin")
    def list_users(user):
        users = User.query.all()
        return jsonify([
            {"id": u.id, "username": u.username, "role": u.role, "created_at": u.created_at.isoformat()}
            for u in users
        ]), 200
    
    @app.route("/api/users/<username>/password", methods=["PUT"])
    @auth_required(role="admin")
    def update_user_password(user, username):
        data = request.get_json() or {}
        new_password = data.get("password")
        if not new_password:
            return jsonify({"error": "password required"}), 400

        u = User.query.filter_by(username=username).first()
        if not u:
            return jsonify({"error": "user not found"}), 404

        u.password_hash = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({"status": "password updated"}), 200


    @app.route("/api/users/<username>", methods=["DELETE"])
    @auth_required(role="admin")
    def delete_user(user, username):
        u = User.query.filter_by(username=username).first()
        if not u:
            return jsonify({"error": "user not found"}), 404

        db.session.delete(u)
        db.session.commit()
        return jsonify({"status": "deleted"}), 200

    @app.route("/api/users", methods=["POST"])
    @auth_required(role="admin")
    def create_user(user):
        data = request.get_json() or {}
        username = data.get("username")
        password = data.get("password")
        role = data.get("role", "user")

        if not username or not password:
            return jsonify({"error": "username and password required"}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "username already exists"}), 400

        new_user = User(
            username=username,
            password_hash=generate_password_hash(password),
            role=role
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"status": "user created", "username": username, "role": role}), 201

    # -------------------- USER SERVERS --------------------
    # GET /api/user-servers - list of servers assigned to the authenticated user
    # POST /api/assign-server - assign a server to the authenticated user
    # DELETE /api/unassign-server/<server_id> - unassign a server from the

    @app.route("/api/user-servers", methods=["GET"])
    @auth_required()
    def get_user_servers(user):
        user_servers = [us.server for us in user.user_servers]

        result = [{"id": s.id, "name": s.name, "one_c_name": s.one_c_name} for s in user_servers]
        return jsonify(result), 200
    
    @app.route("/api/assign-server", methods=["POST"])
    @auth_required()
    def assign_server(user):
        data = request.get_json() or {}
        server_id = data.get("server_id")
        if not server_id:
            return jsonify({"error": "server_id required"}), 400

        server = Server.query.get(server_id)
        if not server:
            return jsonify({"error": "Server not found"}), 404

        existing = UserServer.query.filter_by(user_id=user.id, server_id=server_id).first()
        if existing:
            return jsonify({"status": "already assigned"}), 200

        us = UserServer(user_id=user.id, server_id=server_id)
        db.session.add(us)
        db.session.commit()
        return jsonify({"status": "assigned"}), 201
    

    @app.route("/api/unassign-server/<int:server_id>", methods=["DELETE"])
    @auth_required()
    def unassign_server(user, server_id):
        us = UserServer.query.filter_by(user_id=user.id, server_id=server_id).first()
        if not us:
            return jsonify({"error": "Server not assigned to user"}), 404

        db.session.delete(us)
        db.session.commit()
        return jsonify({"status": "unassigned"}), 200


    # -------------------- AUTH --------------------
    # POST /api/login - user login, returns JWT token

    @app.route("/api/login", methods=["POST"])
    def login():
        data = request.get_json() or {}
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid credentials"}), 401

        token = jwt.encode(
            {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "exp": datetime.utcnow() + timedelta(hours=2)
            },
            current_app.config["SECRET_KEY"],
            algorithm="HS256"
        )
        return jsonify({"token": token, "role": user.role}), 200
