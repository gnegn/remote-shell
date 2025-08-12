from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Server(db.Model):
    __tablename__ = 'servers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)         
    remote_url = db.Column(db.String(500), nullable=False)    
    usable_by = db.Column(db.String(500), default='')         
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.String(100), nullable=False)   
    one_c_name = db.Column(db.String(200), nullable=True)    

class PendingCommand(db.Model):
    __tablename__ = 'pending_commands'
    id = db.Column(db.Integer, primary_key=True)
    server_id = db.Column(db.Integer, db.ForeignKey('servers.id'), nullable=False)
    command = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CommandResult(db.Model):
    __tablename__ = 'command_results'
    id = db.Column(db.Integer, primary_key=True)
    server_id = db.Column(db.Integer, db.ForeignKey('servers.id'), nullable=False)
    result = db.Column(db.Text, nullable=False) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)