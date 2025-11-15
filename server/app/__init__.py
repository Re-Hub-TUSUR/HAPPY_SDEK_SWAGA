from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate, bcrypt, jwt
from .auth.routes import auth_bp
from .main.routes import main_bp
from .cli import register_cli_commands
from .seeder import register_seeder
from .tests_bp import tests_bp

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='../static', static_url_path='/static')
    app.config.from_object(config_class)

    CORS(app) 
    
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(main_bp, url_prefix='/api/v1')
    app.register_blueprint(tests_bp, url_prefix='/api/v1/tests')
    
    register_cli_commands(app)
    register_seeder(app)

    return app