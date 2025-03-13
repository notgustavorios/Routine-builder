from flask import current_app, render_template_string
from flask_mail import Message, Mail

mail = Mail()

def send_verification_email(user, verification_url):
    subject = "Verify your email address"
    html_content = """
    <h1>Welcome to Gymnastics Clips!</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="{{ verification_url }}">{{ verification_url }}</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not create an account, please ignore this email.</p>
    """
    
    msg = Message(
        subject=subject,
        recipients=[user.email],
        html=render_template_string(html_content, verification_url=verification_url)
    )
    mail.send(msg)

def send_password_reset_email(user, reset_url):
    subject = "Password Reset Request"
    html_content = """
    <h1>Password Reset Request</h1>
    <p>We received a request to reset your password. Click the link below to reset it:</p>
    <p><a href="{{ reset_url }}">{{ reset_url }}</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
    """
    
    msg = Message(
        subject=subject,
        recipients=[user.email],
        html=render_template_string(html_content, reset_url=reset_url)
    )
    mail.send(msg) 