from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Server(db.Model):
    __tablename__ = 'servers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)          # english name
    remote_url = db.Column(db.String(500), nullable=False)    # where agent polls (we'll serialize as 'remote-url')
    usable_by = db.Column(db.String(500), default='')         # comma-separated usernames
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.String(100), nullable=False)    # user who created (eng)
    one_c_name = db.Column(db.String(200), nullable=True)     # 1C legal name (ukr)
