from flask import request, jsonify
from flask_login import login_required
from myapp.routes import scoring_bp
from myapp.services.scoring import (
    process_skills,
    calculate_short_routine_deduction,
    calculate_element_group_total,
    generate_summary
)
from myapp.constants import EXERCISE_PRESENTATION
from myapp.session_manager import check_session_timeout

@scoring_bp.route('/calculate', methods=['POST'])
@login_required
@check_session_timeout
def calculate_score():
    # Get and validate input data
    data = request.get_json()
    level = data.get('level')
    event = data.get('event')
    skills = data.get('skills')
    
    if not level or not event or not skills:
        return jsonify({'error': 'Missing required data'}), 400
    
    # Process skills and calculate scores
    skill_bank, difficulty_total, element_group_credit, num_super_skills, num_fig_skills = process_skills(skills)
    
    # Calculate deductions and bonuses
    short_routine_deduction = calculate_short_routine_deduction(skill_bank, num_super_skills, level)
    element_group_total = calculate_element_group_total(element_group_credit, level)
    
    # Calculate final score
    exercise_presentation_total = EXERCISE_PRESENTATION[level]
    total_score = exercise_presentation_total + difficulty_total + element_group_total - short_routine_deduction
    
    # Generate summary
    summary = generate_summary(element_group_credit, exercise_presentation_total, difficulty_total)
    
    return jsonify({
        'totalscore': total_score,
        'summary': summary,
        'elementgrouptotal': element_group_total,
        'exercisepresentation': exercise_presentation_total,
        'difficultytotal': difficulty_total
    })