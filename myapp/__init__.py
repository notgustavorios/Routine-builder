from flask import Flask, request, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from myapp.services.email import mail

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
    mail.init_app(app)
    
    # Force HTTPS
    @app.before_request
    def force_https():
        if not request.is_secure and app.env != 'development':
            url = request.url.replace('http://', 'https://', 1)
            return redirect(url, code=301)
    
    # Add security headers
    @app.after_request
    def add_security_headers(response):
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response
    
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
    
    # Register CLI commands
    from myapp.cli import verify_all_users
    app.cli.add_command(verify_all_users)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app