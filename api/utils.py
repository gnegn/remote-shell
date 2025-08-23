# utils.py
import secrets
import string
from functools import wraps
from flask import request, jsonify
from models import User

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
        "agent_password": s.agent_password
    }


def auth_required(role=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth = request.authorization
            if not auth:
                return jsonify({"error": "Authentication required"}), 401

            user = User.query.filter_by(username=auth.username).first()
            if not user or not user.check_password(auth.password):
                return jsonify({"error": "Invalid credentials"}), 403

            if role and user.role != role:
                return jsonify({"error": "Forbidden"}), 403

            return f(*args, user=user, **kwargs)
        return wrapper
    return decorator
