from flask import Flask
from flask_cors import CORS
from models import db
from config import Config
import routes
from werkzeug.security import generate_password_hash
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.logger.setLevel("INFO")

def create_default_admin():
    from models import User

    if not User.query.filter_by(username="admin").first():
        admin = User(
            username="admin",
            password_hash=generate_password_hash("admin"),
            role="admin"
        )
        db.session.add(admin)
        try:
            db.session.commit()
            print("Default admin created: username=admin, password=admin")
        except IntegrityError:
            db.session.rollback()
            print("Default admin already exists")
    else:
        print("Default admin already exists")

routes.init_app(app)
