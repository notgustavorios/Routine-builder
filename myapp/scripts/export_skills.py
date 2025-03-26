from myapp.models.skill import Skill
from myapp.models.element_group import ElementGroup
from myapp import create_app, db
import json
from collections import defaultdict

def export_skills_to_json():
    # Query all skills and element groups from the database
    skills = Skill.query.all()
    element_groups = ElementGroup.query.all()
    
    # Create a mapping of (event, element_group_number) to element_group_name
    element_group_names = {
        (eg.event, eg.element_group): eg.name
        for eg in element_groups
    }
    
    # Create a nested defaultdict to organize the data
    skill_tree = defaultdict(lambda: defaultdict(list))
    
    # Organize skills by event and element group
    for skill in skills:
        element_group_name = element_group_names.get(
            (skill.event, skill.element_group),
            f"Group {skill.element_group}"
        )
        skill_data = {
            "name": skill.name,
            "value": skill.value
        }
        skill_tree[skill.event][element_group_name].append(skill_data)
    
    # Convert defaultdict to regular dict for JSON serialization
    skill_tree_dict = {
        event: dict(element_groups)
        for event, element_groups in skill_tree.items()
    }
    
    # Write to JSON file
    with open('skills_database.json', 'w') as f:
        json.dump(skill_tree_dict, f, indent=2)

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        export_skills_to_json() 