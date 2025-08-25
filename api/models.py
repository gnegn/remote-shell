from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
db = SQLAlchemy()
import random
from sqlalchemy import event

def generate_unique_server_id():
    for _ in range(1000):
        candidate = random.randint(10000, 99999)
        if not db.session.get(Server, candidate):
            return candidate
    raise ValueError("No free server IDs available")

class Server(db.Model):
    __tablename__ = 'servers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)         
    remote_url = db.Column(db.String(500), nullable=False)    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.String(100), nullable=False)   
    one_c_name = db.Column(db.String(200), nullable=True)    
    agent_password = db.Column(db.String(64), nullable=False)  

@event.listens_for(Server, "before_insert")
def assign_id(mapper, connection, target):
    if target.id is None:
        target.id = generate_unique_server_id()

class PendingCommand(db.Model):
    __tablename__ = 'pending_commands'
    id = db.Column(db.Integer, primary_key=True)
    server_id = db.Column(db.Integer, db.ForeignKey('servers.id'), nullable=False)
    command = db.Column(db.Text, nullable=False)
    is_script = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CommandResult(db.Model):
    __tablename__ = 'command_results'
    id = db.Column(db.Integer, primary_key=True)
    server_id = db.Column(db.Integer, db.ForeignKey('servers.id'), nullable=False)
    result = db.Column(db.Text, nullable=False) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user") 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_servers = db.relationship("UserServer", back_populates="user", cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    

class UserServer(db.Model):
    __tablename__ = "user_servers"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    server_id = db.Column(db.Integer, db.ForeignKey("servers.id"), nullable=False)

    user = db.relationship("User", back_populates="user_servers")
    server = db.relationship("Server")
