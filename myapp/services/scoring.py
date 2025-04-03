from myapp.constants import SUPERSKILLS_ALLOWED, SHORT_ROUTINE, get_max_difficulty_for_level

def error_message():
    """Raise an error for unhandled scoring cases."""
    raise ValueError(f"Unhandled scoring case")

def process_skills(skills, level):
    """Process skills and return skill information."""
    skill_bank = set()
    difficulty_total = 0.0
    num_super_skills = 0
    num_fig_skills = 0
    out_of_range_skills = 0
    num_super_skills_remaining = SUPERSKILLS_ALLOWED[level]
    max_difficulty = get_max_difficulty_for_level(level)
    element_group_credit = {1: None, 2: None, 3: None, 4: None}
    
    for skill in skills:
        difficulty = skill['value']
        element_group = skill['element_group']
        
        if difficulty > max_difficulty: # do not count out of range skills
            out_of_range_skills += 1
        else:
            if element_group_credit[element_group] is None or difficulty >= element_group_credit[element_group]:
                if difficulty == 0.0 and num_super_skills_remaining > 0:
                    num_super_skills_remaining -= 1
                    element_group_credit[element_group] = 0.0
                elif difficulty == 0.0 and num_super_skills_remaining == 0: # If no super skills are allowed, and this is a super skill, skip it
                    continue
                else:
                    element_group_credit[element_group] = difficulty
            elif difficulty < element_group_credit[element_group]:
                continue
            else:
                error_message()

            if skill["name"] not in skill_bank:
                difficulty_total += difficulty
                if difficulty == 0.0:
                    num_super_skills += 1
                elif difficulty > 0:
                    num_fig_skills += 1
                else:
                    error_message()
            skill_bank.add(skill["name"])
    
    return skill_bank, difficulty_total, element_group_credit, num_super_skills, num_fig_skills, out_of_range_skills

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
    # Level 1-3 Super Skills SS have no difficulty value but count for element group value = +.5
    # Level 4-9 Super Skills SS have no difficulty value but count for partial EG Value if SS are allowed at that level: Partial EG credit = +.3
    # Level 4-8, 'A' value fulfills element group
    # level 9, 'B' value fulfills element group
    # level 10, 'C' value fulfills element group
    element_group_total = 0.0
    
    for element_group, value in element_group_credit.items():
        match level:
            case 1 | 2 | 3: 
                if value is None:
                    element_group_total += 0.0
                elif value >= 0.0:
                    element_group_total += 0.5
                else:
                    error_message()
            case 4 | 5 | 6 | 7 | 8: 
                if value is None:
                    element_group_total += 0.0
                elif value == 0.0:
                    element_group_total += 0.3
                elif value >= 0.1:
                    element_group_total += 0.5
                else:
                    error_message()
            case 9:
                if value == 0.0:
                    element_group_total += 0.3
                elif value == 0.1:
                    if element_group == 1:
                        element_group_total += 0.5
                    else:
                        element_group_total += 0.3
                elif value >= 0.2:
                    element_group_total += 0.5
                else:
                    error_message()
            case 10:  
                if value == 0.0 or value == 0.1 or value == 0.2:
                    element_group_total += 0.3
                elif value >= 0.3:
                    element_group_total += 0.5
                else:
                    error_message()
            case _:
                error_message()
                
    return element_group_total

def calculate_out_of_range_skills_deduction(out_of_range_skills):
    """Calculate deduction for out of range skills."""
    return -0.5 * out_of_range_skills   

def generate_summary(element_group_credit, exercise_presentation_total, difficulty_total):
    """Generate a text summary of the scoring."""
    return (
        "Element Group Totals:\n" +
        "\n".join(f"    EG{eg}: {value:.1f}" if value is not None else f"    EG{eg}: No value" 
                 for eg, value in element_group_credit.items()) +
        f"\nExercise Presentation: {exercise_presentation_total:.1f}\n" +
        f"Difficulty Total: {difficulty_total:.1f}"
    )