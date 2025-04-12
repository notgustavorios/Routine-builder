from datetime import datetime
from myapp.models import db

class Player(db.Model):
    __tablename__ = 'player'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    routines = db.relationship('Routine', backref='player', lazy=True)
    active_routines = db.relationship(
        'PlayerActiveRoutine',
        backref='player',
        lazy=True,
        cascade="all, delete-orphan"
    )
    
    def set_active_routine(self, routine, event_type):
        """Set an active routine for a specific event type"""
        # Check if there's already an active routine for this event
        existing = PlayerActiveRoutine.query.filter_by(
            player_id=self.id,
            event_type=event_type
        ).first()
        
        if existing:
            # Update the existing record
            existing.routine_id = routine.id
        else:
            # Create a new active routine record
            active = PlayerActiveRoutine(
                player_id=self.id,
                routine_id=routine.id,
                event_type=event_type
            )
            db.session.add(active)
        
        db.session.commit()
    
    def get_active_routines(self):
        """Get all active routines for the player"""
        return PlayerActiveRoutine.query.filter_by(player_id=self.id).all()
    
    def __repr__(self):
        return f'<Player {self.name}>'

class PlayerActiveRoutine(db.Model):
    """Association table for tracking which routines are active for competition"""
    __tablename__ = 'player_active_routine'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    routine_id = db.Column(db.Integer, db.ForeignKey('routine.id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)  # e.g. "Floor", "Vault", etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Create a unique constraint to ensure only one active routine per event type per player
    __table_args__ = (
        db.UniqueConstraint('player_id', 'event_type', name='uq_player_event_active_routine'),
    )
    
    # Relationship to get the routine details
    routine = db.relationship('Routine')
    
    def __repr__(self):
        return f'<ActiveRoutine {self.event_type}>' 