from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, json
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gymnastics.db'
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Association table for Routine-Skill many-to-many relationship
routine_skills = db.Table('routine_skills',
    db.Column('routine_id', db.Integer, db.ForeignKey('routine.id')),
    db.Column('skill_id', db.Integer, db.ForeignKey('skill.id')),
    db.Column('position', db.Integer),  # To maintain skill order in routine
    db.UniqueConstraint('routine_id', 'skill_id', 'position', name='unique_routine_skill_position')
)


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    routines = db.relationship('Routine', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    element_group = db.Column(db.Integer, nullable=False)
    value = db.Column(db.Float, nullable=False)
    event = db.Column(db.String(20), nullable=False) 
    
    def __repr__(self):
        return f'<Skill {self.name} ({self.event}) EG{self.element_group} Value:{self.value}>'

class Routine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Many-to-many relationship with skills, including order
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


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered')
            return redirect(url_for('register'))
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user and user.check_password(request.form['password']):
            login_user(user)
            flash('Logged in successfully')
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully')
    return redirect(url_for('login'))

@app.route('/build_routine')
@login_required
def build_routine():
    return render_template('builder.html')

@app.route('/save-routine', methods=['POST'])
@login_required
def save_routine():
    data = request.get_json()  # Expecting JSON data from the frontend
    name = data.get('name')
    level = data.get('level')
    event = data.get('event')
    skills = data.get('skills')  # List of skills with details and positions

    if not level or not event or not skills or not name:
        missing_fields = []
        if not level:
            missing_fields.append('level')
        if not event:
            missing_fields.append('event')
        if not skills:
            missing_fields.append('skills')
        if not name:
            missing_fields.append('name')
        return jsonify({'error': 'Missing required data', 'missing_fields': missing_fields}), 400

    # Create a new routine
    routine = Routine(level=level, user_id=current_user.id, name=name)
    db.session.add(routine)
    db.session.commit()

    # Add skills to the routine
    for skill_data in skills:
        name = skill_data.get('name')
        element_group = skill_data.get('element_group')
        value = skill_data.get('value')
        position = skill_data.get('position')

        if not (name and element_group is not None and value is not None and position is not None):
            return jsonify({'error': 'Incomplete skill data'}), 400

        # Check if the skill already exists in the database
        skill = Skill.query.filter_by(name=name, element_group=element_group, value=value, event=event).first()
        if not skill:
            # Create a new skill if it doesn't exist
            skill = Skill(name=name, element_group=element_group, value=value, event=event)
            db.session.add(skill)
            db.session.commit()

        # Add the skill to the routine
        routine.add_skill(skill, position)

    return jsonify({'message': 'Routine saved successfully'}), 200



@app.route('/view-routines')
@login_required
def view_routines():
    routines = Routine.query.filter_by(user_id=current_user.id).order_by(Routine.created_at.desc()).all()
    return render_template('view_routines.html', routines=routines)

# Example route to create a new routine
@app.route('/create-routine', methods=['POST'])
@login_required
def create_routine():
    level = request.form.get('level', type=int)
    if not level:
        flash('Level is required')
        return redirect(url_for('index'))
    
    routine = Routine(level=level, user_id=current_user.id)
    db.session.add(routine)
    db.session.commit()
    return redirect(url_for('edit_routine', routine_id=routine.id))

# Example route to add a skill to a routine
@app.route('/add-skill-to-routine/<int:routine_id>', methods=['POST'])
@login_required
def add_skill_to_routine(routine_id):
    routine = Routine.query.get_or_404(routine_id)
    if routine.user_id != current_user.id:
        flash('Unauthorized')
        return redirect(url_for('index'))
    
    skill_id = request.form.get('skill_id', type=int)
    position = request.form.get('position', type=int)
    
    skill = Skill.query.get_or_404(skill_id)
    try:
        routine.add_skill(skill, position)
        flash('Skill added successfully')
    except ValueError as e:
        flash(str(e))
    
    return redirect(url_for('edit_routine', routine_id=routine_id))

@app.route('/load-skills-table')
def load_skills_table():
    return render_template('skills.html')

@app.route('/api/view-routines', methods=['GET'])
@login_required
def api_view_routines():
    routines = Routine.query.filter_by(user_id=current_user.id).order_by(Routine.created_at.desc()).all()
    routines_data = [
        {
            "id": routine.id,
            "level": routine.level,
            "event": routine.skills.first().event,
            "created_at": routine.created_at.isoformat(),
        }
        for routine in routines
    ]
    return jsonify({"routines": routines_data})

@app.route('/view-routine/<int:routine_id>')
@login_required
def view_routine(routine_id):
    routine = Routine.query.get_or_404(routine_id)
    if routine.user_id != current_user.id:
        flash("Unauthorized access to this routine.")
        return redirect(url_for('index'))
    
    skills = db.session.query(Skill, routine_skills.c.position).join(
        routine_skills, Skill.id == routine_skills.c.skill_id
    ).filter(routine_skills.c.routine_id == routine.id).order_by(routine_skills.c.position).all()

    return render_template('routine.html', skills=skills)


EXERCISE_PRESENTATION = {
    1: 8.0,
    2: 8.0,
    3: 8.0,
    4: 8.0,
    5: 8.0,
    6: 8.0,
    7: 8.0,
    8: 8.0,
    9: 8.0,
    10: 7.5
}

SUPERSKILLS_ALLOWED = {
    1: 8,
    2: 8,
    3: 8,
    4: 6,
    5: 5,
    6: 4,
    7: 3,
    8: 2,
    9: 1,
    10: 0,
}

@app.route('/calculate-score', methods=['POST'])
@login_required
def calculate_score():
    data = request.get_json()
    level = data.get('level')
    event = data.get('event')
    skills = data.get('skills')

    if not level or not event or not skills:
        return jsonify({'error': 'Missing required data'}), 400

    exercise_presentation_total = EXERCISE_PRESENTATION[level]
    total_score = 0


    
    element_group_credit = {
        1: None,
        2: None,
        3: None,
        4: None,
    }

    difficulty_total = 0.0
    skill_bank = set()
    for skill in skills:
    
        difficulty = skill['value']
        element_group = skill['element_group']

        if element_group_credit[element_group] is None or difficulty > element_group_credit[element_group]:
            # Element group total will be None if there is no skills for that element group
            # If an element group has 0.0 as its value, means there is a super skill in that element group
            element_group_credit[element_group] = difficulty
        
        if skill["name"] not in skill_bank:
            # Skills only count for value one time due to special repitition
            difficulty_total += difficulty

        skill_bank.add(skill["name"])
    
    element_group_total = 0.0

    for element_group, value in element_group_credit.items():
        # this will iterate 4 times, once per element group
        if level in range(0,4):
            # levels 1,2,3
            if value is not None:
                element_group_total += 0.5

        elif level in range(4,8):
            # level 4,5,6,7
            if value is not None:
                if value == 0.0:
                    element_group_total += 0.3
                else:
                    element_group_total += 0.5
        elif level == 8:
            # level 8
            if value is not None:
                if value == 0.0:
                    element_group_total += 0.3
                else:
                    element_group_total += 0.5
        elif level == 9:
            if value is not None:
                if element_group == 1: # Element group 1 exception
                    if value > 0.0:
                        element_group_total += 0.5
                else:
                    if value == 0.0 or value == 0.1:
                        element_group_total += 0.3
                    elif value > 0.1:
                        element_group_total += 0.5
                    else:
                        print("Error in calculating element group bonus")
        elif level == 10:
            if value is not None:
                if element_group == 1: # Element group 1 exception
                    if value > 0.0:
                        element_group_total += 0.5
                else:
                    if value == 0.0 or value == 0.1 or value == 0.2:
                        element_group_total += 0.3
                    elif value > 0.2:
                        element_group_total += 0.5
                    else:
                        print("Error in calculating element group bonus")
        else:
            print("Error: Level is invalid")

    total_score = exercise_presentation_total + difficulty_total + element_group_total

    summary = (
        "Element Group Totals:\n" +
        "\n".join(f"    EG{eg}: {value:.1f}" if value is not None else f"    EG{eg}: No value" for eg, value in element_group_credit.items()) +
        f"\nExercise Presentation: {exercise_presentation_total:.1f}\n" +
        f"Difficulty Total: {difficulty_total:.1f}"
    )   


    return jsonify({'totalscore': total_score, 'summary': summary, 'elementgrouptotal': element_group_total, 'exercisepresentation': exercise_presentation_total, 'difficultytotal': difficulty_total})


@app.route('/delete-routine/<int:routine_id>', methods=['POST'])
@login_required
def delete_routine(routine_id):
    print("Trying to delete routine: " + str(routine_id))
    routine = Routine.query.get_or_404(routine_id)
    
    if routine.user_id != current_user.id:
        print('Unauthorized', 'danger')
        return redirect(url_for('index'))

    try:
        # Delete entries from routine_skills explicitly
        db.session.execute(
            routine_skills.delete().where(routine_skills.c.routine_id == routine.id)
        )
        db.session.delete(routine)
        db.session.commit()
        print('Routine deleted successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        print('Error deleting routine: ' + str(e), 'danger')

    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)