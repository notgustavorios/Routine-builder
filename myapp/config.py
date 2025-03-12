import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://u3o8ait0e7auoj:pb6de4e3f85f7daca8b5134a992c18e2e177ae6485f537a1b5173df42b28a7313@cb5ajfjosdpmil.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d82gk852qieukc')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    
    # Session configuration
    PERMANENT_SESSION_LIFETIME = int(os.environ.get('SESSION_LIFETIME', 1800))  # 30 minutes in seconds
    SESSION_REFRESH_EACH_REQUEST = True