import click
from flask.cli import with_appcontext
from myapp.models import db
from myapp.models.user import User

@click.command('verify-all-users')
@with_appcontext
def verify_all_users():
    """Verify all existing users' email addresses."""
    # Get all users that are either not verified or have NULL in email_verified
    users = User.query.filter(
        (User.email_verified.is_(None)) | (User.email_verified == False)
    ).all()
    
    count = 0
    for user in users:
        user.email_verified = True
        count += 1
    
    db.session.commit()
    click.echo(f'Verified {count} users.') 