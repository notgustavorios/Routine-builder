from functools import wraps
from datetime import datetime, timedelta
from flask import session, redirect, url_for, flash
from flask_login import current_user, logout_user

def check_session_timeout(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.is_authenticated:
            # Get the last activity time
            last_activity = session.get('last_activity')
            
            if last_activity is not None:
                last_activity = datetime.fromisoformat(last_activity)
                # Check if session has expired
                if datetime.utcnow() - last_activity > timedelta(seconds=session.get('session_lifetime', 1800)):
                    logout_user()
                    flash('Your session has expired. Please log in again.', 'info')
                    return redirect(url_for('auth.login'))
            
            # Update last activity time
            session['last_activity'] = datetime.utcnow().isoformat()
        
        return f(*args, **kwargs)
    return decorated_function 