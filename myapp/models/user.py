from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime, timedelta
from myapp.models import db
import secrets

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=True)  # Made nullable for Google auth
    email_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(100), unique=True)
    email_verification_sent_at = db.Column(db.DateTime)
    password_reset_token = db.Column(db.String(100), unique=True)
    password_reset_expires_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Google authentication fields
    google_id = db.Column(db.String(100), unique=True)
    google_profile_pic = db.Column(db.String(200))
    is_google_user = db.Column(db.Boolean, default=False)
    
    # Relationships
    routines = db.relationship('Routine', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        if not self.password_hash:  # For Google users
            return False
        return check_password_hash(self.password_hash, password)

    def generate_email_verification_token(self):
        self.email_verification_token = secrets.token_urlsafe(32)
        self.email_verification_sent_at = datetime.utcnow()
        return self.email_verification_token

    def generate_password_reset_token(self):
        self.password_reset_token = secrets.token_urlsafe(32)
        self.password_reset_expires_at = datetime.utcnow() + timedelta(hours=24)
        return self.password_reset_token

    def verify_email(self, token):
        if self.email_verification_token == token:
            self.email_verified = True
            self.email_verification_token = None
            self.email_verification_sent_at = None
            return True
        return False

    def verify_reset_token(self, token):
        if self.password_reset_token != token:
            return False
        if datetime.utcnow() > self.password_reset_expires_at:
            return False
        return True

    def clear_reset_token(self):
        self.password_reset_token = None
        self.password_reset_expires_at = None

    @classmethod
    def get_or_create_google_user(cls, google_id, email, username, profile_pic=None):
        user = cls.query.filter_by(google_id=google_id).first()
        if not user:
            user = cls.query.filter_by(email=email).first()
            if user:
                # Link existing account with Google
                user.google_id = google_id
                user.is_google_user = True
                user.google_profile_pic = profile_pic
            else:
                # Create new user
                user = cls(
                    google_id=google_id,
                    email=email,
                    username=username,
                    email_verified=True,
                    is_google_user=True,
                    google_profile_pic=profile_pic
                )
                db.session.add(user)
        db.session.commit()
        return user

    def __repr__(self):
        return f'<User {self.username}>'