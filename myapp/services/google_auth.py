from google.oauth2 import id_token
from google.auth.transport import requests
from flask import current_app
from myapp.models.user import User
import requests as http_requests

def verify_google_token(token):
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            current_app.config['GOOGLE_CLIENT_ID']
        )

        # Get user info
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        picture = idinfo.get('picture')

        # Get or create user
        user = User.get_or_create_google_user(
            google_id=google_id,
            email=email,
            username=name,
            profile_pic=picture
        )

        return user
    except ValueError:
        # Invalid token
        return None 