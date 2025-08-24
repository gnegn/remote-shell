from flask import Flask
from flask_cors import CORS
from models import db
from config import Config
import routes
from werkzeug.security import generate_password_hash
import os

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.logger.setLevel("INFO")

def create_default_admin():
    from models import db, User  #
    if User.query.count() == 0:
        admin = User(
            username="admin",
            password_hash=generate_password_hash("admin"),
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        print("Default admin created: username=admin, password=admin")

with app.app_context():
    db.create_all()
    create_default_admin()

routes.init_app(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=True)
