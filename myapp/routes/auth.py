from flask import render_template, request, redirect, url_for, flash, session, current_app, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from myapp.models.user import User
from myapp.models import db
from myapp.routes import auth_bp
from myapp.session_manager import check_session_timeout
from myapp.services.email import send_verification_email, send_password_reset_email
from myapp.services.google_auth import verify_google_token
from datetime import datetime
from urllib.parse import urljoin

@auth_bp.route('/')
@login_required
@check_session_timeout
def index():
    return render_template('index.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].lower()  # Convert to lowercase for case-insensitive comparison
        email = request.form['email'].lower()
        password = request.form['password']
        
        if User.query.filter(User.username.ilike(username)).first():
            flash('Username already exists')
            return redirect(url_for('auth.register'))
        
        if User.query.filter(User.email.ilike(email)).first():
            flash('Email already registered')
            return redirect(url_for('auth.register'))
        
        user = User(username=username, email=email)
        user.set_password(password)
        
        # Generate verification token
        token = user.generate_email_verification_token()
        
        db.session.add(user)
        db.session.commit()
        
        # Send verification email
        verification_url = urljoin(
            request.host_url,
            url_for('auth.verify_email', token=token)
        )
        send_verification_email(user, verification_url)
        
        flash('Registration successful. Please check your email to verify your account.')
        return redirect(url_for('auth.login'))
    
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.is_json and 'google_token' in request.json:
            # Handle Google Sign In
            user = verify_google_token(request.json['google_token'])
            if user:
                login_user(user)
                session['last_activity'] = datetime.utcnow().isoformat()
                session['session_lifetime'] = current_app.config['PERMANENT_SESSION_LIFETIME'].total_seconds()
                session.permanent = True
                return jsonify({'success': True, 'redirect': url_for('auth.index')})
            return jsonify({'success': False, 'error': 'Invalid token'}), 400
        
        # Handle regular login
        username = request.form['username'].lower()
        user = User.query.filter(User.username.ilike(username)).first()
        
        if user and user.check_password(request.form['password']):
            if not user.email_verified and not user.is_google_user:
                flash('Please verify your email address before logging in.')
                return redirect(url_for('auth.login'))
            
            login_user(user)
            session['last_activity'] = datetime.utcnow().isoformat()
            session['session_lifetime'] = current_app.config['PERMANENT_SESSION_LIFETIME'].total_seconds()
            session.permanent = True
            flash('Logged in successfully')
            return redirect(url_for('auth.index'))
        else:
            flash('Invalid username or password')
    return render_template('login.html', google_client_id=current_app.config['GOOGLE_CLIENT_ID'])

@auth_bp.route('/request-verification', methods=['GET', 'POST'])
def request_verification():
    if request.method == 'POST':
        email = request.form['email'].lower()
        user = User.query.filter(User.email.ilike(email)).first()
        
        if user:
            if user.email_verified:
                flash('This email is already verified.')
            else:
                token = user.generate_email_verification_token()
                db.session.commit()
                
                verification_url = urljoin(
                    request.host_url,
                    url_for('auth.verify_email', token=token)
                )
                send_verification_email(user, verification_url)
                flash('Verification email has been sent. Please check your inbox.')
        else:
            # Don't reveal if email exists
            flash('If an account exists with this email, a verification link will be sent.')
        
        return redirect(url_for('auth.login'))
    
    return render_template('request_verification.html')

@auth_bp.route('/verify-email/<token>')
def verify_email(token):
    user = User.query.filter_by(email_verification_token=token).first()
    if user and user.verify_email(token):
        db.session.commit()
        flash('Email verified successfully! You can now log in.')
    else:
        flash('Invalid or expired verification link.')
    return redirect(url_for('auth.login'))

@auth_bp.route('/resend-verification')
@login_required
def resend_verification():
    if current_user.email_verified:
        flash('Your email is already verified.')
        return redirect(url_for('auth.index'))
    
    token = current_user.generate_email_verification_token()
    db.session.commit()
    
    verification_url = urljoin(
        request.host_url,
        url_for('auth.verify_email', token=token)
    )
    send_verification_email(current_user, verification_url)
    
    flash('Verification email has been resent.')
    return redirect(url_for('auth.login'))

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form['email'].lower()
        user = User.query.filter(User.email.ilike(email)).first()
        
        if user:
            token = user.generate_password_reset_token()
            db.session.commit()
            
            reset_url = urljoin(
                request.host_url,
                url_for('auth.reset_password', token=token)
            )
            send_password_reset_email(user, reset_url)
        
        # Always show this message to prevent email enumeration
        flash('If an account exists with this email, you will receive password reset instructions.')
        return redirect(url_for('auth.login'))
    
    return render_template('forgot_password.html')

@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    user = User.query.filter_by(password_reset_token=token).first()
    
    if not user or not user.verify_reset_token(token):
        flash('Invalid or expired password reset link.')
        return redirect(url_for('auth.login'))
    
    if request.method == 'POST':
        password = request.form['password']
        user.set_password(password)
        user.clear_reset_token()
        db.session.commit()
        
        flash('Your password has been reset successfully. You can now log in.')
        return redirect(url_for('auth.login'))
    
    return render_template('reset_password.html')

@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
@check_session_timeout
def profile():
    if request.method == 'POST':
        # Update email
        new_email = request.form.get('email', '').lower()
        if new_email and new_email != current_user.email:
            if User.query.filter(User.email.ilike(new_email)).first():
                flash('Email already registered')
            else:
                current_user.email = new_email
                current_user.email_verified = False
                token = current_user.generate_email_verification_token()
                db.session.commit()
                
                verification_url = urljoin(
                    request.host_url,
                    url_for('auth.verify_email', token=token)
                )
                send_verification_email(current_user, verification_url)
                flash('Email updated. Please verify your new email address.')
        
        # Update username
        new_username = request.form.get('username', '').lower()
        if new_username and new_username != current_user.username:
            if User.query.filter(User.username.ilike(new_username)).first():
                flash('Username already exists')
            else:
                current_user.username = new_username
                db.session.commit()
                flash('Username updated successfully')
        
        return redirect(url_for('auth.profile'))
    
    return render_template('profile.html')

@auth_bp.route('/change-password', methods=['GET', 'POST'])
@login_required
@check_session_timeout
def change_password():
    if request.method == 'POST':
        current_password = request.form['current_password']
        new_password = request.form['new_password']
        
        if not current_user.check_password(current_password):
            flash('Current password is incorrect')
        else:
            current_user.set_password(new_password)
            db.session.commit()
            flash('Password updated successfully')
            return redirect(url_for('auth.profile'))
    
    return render_template('change_password.html')

@auth_bp.route('/logout')
@login_required
def logout():
    session.pop('last_activity', None)
    session.pop('session_lifetime', None)
    logout_user()
    flash('Logged out successfully')
    return redirect(url_for('auth.login'))