from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

def create_app(config_object='myapp.config.Config'):
    """Application factory for creating flask app"""
    app = Flask(__name__)
    app.config.from_object(config_object)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    # Register blueprints
    from myapp.routes import auth_bp, routines_bp, scoring_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(routines_bp)
    app.register_blueprint(scoring_bp)
    
    # Setup user loader
    from myapp.models.user import User
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app