from datetime import datetime
from myapp.models import db

# Association table for many-to-many relationship between routines and skills
routine_skills = db.Table('routine_skills',
    db.Column('routine_id', db.Integer, db.ForeignKey('routine.id'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skill.id'), primary_key=True),
    db.Column('position', db.Integer, nullable=False),
    db.UniqueConstraint('routine_id', 'skill_id', 'position', name='unique_routine_skill_position')
) 

class Routine(db.Model):
    __tablename__ = 'routine'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)
    level = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=True)  # e.g. "Floor", "Vault", etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    skills = db.relationship(
        'Skill', 
        secondary=routine_skills,
        lazy='dynamic',
        order_by=routine_skills.c.position,
        cascade="all, delete",
    )

    @property
    def skill_count(self):
        return self.skills.count()
    
    def add_skill(self, skill, position):
        if self.skill_count >= 15:
            raise ValueError("Routine cannot have more than 15 skills")
        
        # Add the skill at the specified position
        stmt = routine_skills.insert().values(
            routine_id=self.id,
            skill_id=skill.id,
            position=position
        )
        db.session.execute(stmt)
        db.session.commit()
    
    def remove_skill(self, skill, position):
        stmt = routine_skills.delete().where(
            (routine_skills.c.routine_id == self.id) & 
            (routine_skills.c.skill_id == skill.id) & 
            (routine_skills.c.position == position)
        )
        result = db.session.execute(stmt)
        if result.rowcount != 1:
            raise ValueError("Failed to delete the expected row. Check the position and skill.")
        db.session.commit()
    
    def __repr__(self):
        return f'<Routine {self.id} Level {self.level}>'