from myapp.models import db

class Skill(db.Model):
    __tablename__ = 'skill'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    element_group = db.Column(db.Integer, nullable=False)
    value = db.Column(db.Float, nullable=False)
    event = db.Column(db.String(50), nullable=False)
    
    def __repr__(self):
        return f'<Skill {self.name} EG{self.element_group} Value={self.value}>'