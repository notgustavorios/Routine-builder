from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from myapp.models import db
from myapp.models.routine import Routine, routine_skills
from myapp.models.skill import Skill
from myapp.routes import routines_bp

@routines_bp.route('/build')
@login_required
def build_routine():
    return render_template('builder.html')

@routines_bp.route('/save', methods=['POST'])
@login_required
def save_routine():
    data = request.get_json()
    name = data.get('name')
    level = data.get('level')
    event = data.get('event')
    skills = data.get('skills')

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

@routines_bp.route('/create', methods=['POST'])
@login_required
def create_routine():
    level = request.form.get('level', type=int)
    if not level:
        flash('Level is required')
        return redirect(url_for('auth.index'))
    
    routine = Routine(level=level, user_id=current_user.id)
    db.session.add(routine)
    db.session.commit()
    return redirect(url_for('routines.edit', routine_id=routine.id))


@routines_bp.route('/add-skill/<int:routine_id>', methods=['POST'])
@login_required
def add_skill_to_routine(routine_id):
    routine = Routine.query.get_or_404(routine_id)
    if routine.user_id != current_user.id:
        flash('Unauthorized')
        return redirect(url_for('auth.index'))
    
    skill_id = request.form.get('skill_id', type=int)
    position = request.form.get('position', type=int)
    
    skill = Skill.query.get_or_404(skill_id)
    try:
        routine.add_skill(skill, position)
        flash('Skill added successfully')
    except ValueError as e:
        flash(str(e))
    
    return redirect(url_for('routines.edit', routine_id=routine_id))

@routines_bp.route('/skills-table')
def load_skills_table():
    return render_template('skills.html')

@routines_bp.route('/view', methods=['GET'])
@login_required
def api_view_routines():
    routines = Routine.query.filter_by(user_id=current_user.id).order_by(Routine.created_at.desc()).all()
    routines_data = [
        {
            "id": routine.id,
            "name": routine.name,
            "level": routine.level,
            "event": routine.skills.first().event if routine.skills.first() else None,
            "created_at": routine.created_at.isoformat(),
        }
        for routine in routines
    ]
    return jsonify({"routines": routines_data})

@routines_bp.route('/view/<int:routine_id>')
@login_required
def view_routine(routine_id):
    routine = Routine.query.get_or_404(routine_id)

    if routine.user_id != current_user.id:
        flash("Unauthorized access to this routine.")
        return redirect(url_for('auth.index'))
    
    # Get level and event from query parameters
    level = request.args.get('level')
    event = request.args.get('event')
    
    skills = db.session.query(Skill, routine_skills.c.position).join(
        routine_skills, Skill.id == routine_skills.c.skill_id
    ).filter(routine_skills.c.routine_id == routine.id).order_by(routine_skills.c.position).all()

    return render_template('routine.html', skills=skills, level=level, event=event)

@routines_bp.route('/edit/<int:routine_id>')
@login_required
def edit_routine(routine_id):
    routine = Routine.query.get_or_404(routine_id)

    if routine.user_id != current_user.id:
        flash("Unauthorized access to this routine.")
        return redirect(url_for('auth.index'))
    
    # Get level and event from query parameters
    level = request.args.get('level')
    event = request.args.get('event')
    
    skills = db.session.query(Skill, routine_skills.c.position).join(
        routine_skills, Skill.id == routine_skills.c.skill_id
    ).filter(routine_skills.c.routine_id == routine.id).order_by(routine_skills.c.position).all()

    return render_template('edit_routine.html', skills=skills, level=level, event=event)

@routines_bp.route('/delete/<int:routine_id>', methods=['POST'])
@login_required
def delete_routine(routine_id):
    routine = Routine.query.get_or_404(routine_id)
    
    if routine.user_id != current_user.id:
        flash('Unauthorized', 'danger')
        return redirect(url_for('auth.index'))

    try:
        # Delete entries from routine_skills explicitly
        db.session.execute(
            routine_skills.delete().where(routine_skills.c.routine_id == routine.id)
        )
        db.session.delete(routine)
        db.session.commit()
        flash('Routine deleted successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting routine: {str(e)}', 'danger')

    return redirect(url_for('auth.index'))