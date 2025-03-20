from myapp.models import db

class ElementGroup(db.Model):
    __tablename__ = 'element_group'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    event = db.Column(db.String(50), nullable=False)
    element_group = db.Column(db.Integer, nullable=False)
    
    def __repr__(self):
        return f'<ElementGroup {self.name} Event={self.event} EG{self.element_group}>' 