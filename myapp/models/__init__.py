from myapp import db

# Import models here to ensure they are registered with SQLAlchemy
from myapp.models.user import User
from myapp.models.routine import Routine
from myapp.models.skill import Skill
from myapp.models.element_group import ElementGroup
from myapp.models.team import Team
from myapp.models.player import Player, PlayerActiveRoutine