from flask import Blueprint

# Create blueprints
auth_bp = Blueprint('auth', __name__)
routines_bp = Blueprint('routines', __name__, url_prefix='/routines')
scoring_bp = Blueprint('scoring', __name__, url_prefix='/scoring')

# Import routes to register them with blueprints
from myapp.routes import auth
from myapp.routes import routines
from myapp.routes import scoring