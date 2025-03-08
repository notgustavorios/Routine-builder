from myapp.constants import SUPERSKILLS_ALLOWED, SHORT_ROUTINE

def process_skills(skills):
    """Process skills and return skill information."""
    skill_bank = set()
    difficulty_total = 0.0
    num_super_skills = 0
    num_fig_skills = 0
    element_group_credit = {1: None, 2: None, 3: None, 4: None}
    
    for skill in skills:
        difficulty = skill['value']
        element_group = skill['element_group']
        
        # Track highest value skill in each element group
        if element_group_credit[element_group] is None or difficulty > element_group_credit[element_group]:
            element_group_credit[element_group] = difficulty
        
        # Only count skill value once
        if skill["name"] not in skill_bank:
            difficulty_total += difficulty
            if difficulty == 0.0:
                num_super_skills += 1
            elif difficulty > 0:
                num_fig_skills += 1
            
        skill_bank.add(skill["name"])
    
    return skill_bank, difficulty_total, element_group_credit, num_super_skills, num_fig_skills

def calculate_short_routine_deduction(skill_bank, num_super_skills, level):
    """Calculate deduction for short routines."""
    # Adjust super skills count based on level allowances
    counted_super_skills = min(num_super_skills, SUPERSKILLS_ALLOWED[level])
    
    # Calculate total counting skills (regular skills + allowed super skills)
    num_counting_skills = (len(skill_bank) - num_super_skills) + counted_super_skills
    
    print(f"Number of counting skills for this level {level} routine is: {num_counting_skills} skills")
    print(f"Short Routine Deduction for only having {num_counting_skills} skills is -{SHORT_ROUTINE[num_counting_skills]}")
    
    return SHORT_ROUTINE[num_counting_skills]

def calculate_element_group_total(element_group_credit, level):
    """Calculate element group bonus based on level and difficulty values."""
    element_group_total = 0.0
    
    for element_group, value in element_group_credit.items():
        if value is None:
            continue
            
        if level in range(0, 7):  # Levels 1-6
            element_group_total += 0.5
        elif level in (7, 8):  # Levels 7-8
            element_group_total += 0.3 if value == 0.0 else 0.5
        elif level == 9:  # Level 9
            if element_group == 1:  # Element group 1 exception
                if value > 0.0:
                    element_group_total += 0.5
            else:
                if value == 0.0 or value == 0.1:
                    element_group_total += 0.3
                elif value > 0.1:
                    element_group_total += 0.5
        elif level == 10:  # Level 10
            if element_group == 1:  # Element group 1 exception
                if value > 0.0:
                    element_group_total += 0.5
            else:
                if value == 0.0 or value == 0.1 or value == 0.2:
                    element_group_total += 0.3
                elif value > 0.2:
                    element_group_total += 0.5
    
    return element_group_total

def generate_summary(element_group_credit, exercise_presentation_total, difficulty_total):
    """Generate a text summary of the scoring."""
    return (
        "Element Group Totals:\n" +
        "\n".join(f"    EG{eg}: {value:.1f}" if value is not None else f"    EG{eg}: No value" 
                 for eg, value in element_group_credit.items()) +
        f"\nExercise Presentation: {exercise_presentation_total:.1f}\n" +
        f"Difficulty Total: {difficulty_total:.1f}"
    )