# utils.py
import secrets
import string
from functools import wraps
from flask import request, jsonify
from models import User
import jwt
from flask import request, jsonify, current_app
from models import UserServer, User


def pick_field(data, *variants):
    for v in variants:
        if v in data:
            return data[v]
    return None

def generate_password(length=16):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def server_to_json(s):
    return {
        "id": s.id,
        "name": s.name,
        "remote-url": s.remote_url,
        "created-at": s.created_at.isoformat() if s.created_at else None,
        "created-by": s.created_by,
        "1c-name": s.one_c_name,
        "agent_password": s.agent_password,
         "users": [us.user.username for us in UserServer.query.filter_by(server_id=s.id).all()]
    }


def auth_required(role=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = None

            # --- 1. Спробувати JWT ---
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                try:
                    payload = jwt.decode(
                        token,
                        current_app.config["SECRET_KEY"],
                        algorithms=["HS256"]
                    )
                    user = User.query.get(payload["id"])
                    if not user:
                        return jsonify({"error": "User not found"}), 401
                except jwt.ExpiredSignatureError:
                    return jsonify({"error": "Token expired"}), 401
                except jwt.InvalidTokenError:
                    return jsonify({"error": "Invalid token"}), 401

            # --- 2. Якщо JWT нема → fallback на BasicAuth (CLI) ---
            else:
                auth = request.authorization
                if auth:
                    user = User.query.filter_by(username=auth.username).first()
                    if not user or not user.check_password(auth.password):
                        return jsonify({"error": "Invalid credentials"}), 403

            # --- Якщо все одно нема юзера ---
            if not user:
                return jsonify({"error": "Authentication required"}), 401

            # --- Перевірка ролі ---
            if role and user.role != role:
                return jsonify({"error": "Forbidden"}), 403

            return f(user=user, *args, **kwargs)
        return wrapper
    return decorator
