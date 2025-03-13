import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = db_url or 'postgresql://u3o8ait0e7auoj:pb6de4e3f85f7daca8b5134a992c18e2e177ae6485f537a1b5173df42b28a7313@cb5ajfjosdpmil.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d82gk852qieukc'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    
    # Session configuration
    PERMANENT_SESSION_LIFETIME = int(os.environ.get('SESSION_LIFETIME', 1800))  # 30 minutes in seconds
    SESSION_REFRESH_EACH_REQUEST = True

    # Email configuration
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', MAIL_USERNAME)