from bs4 import BeautifulSoup
from myapp.models.skill import Skill
from myapp.models import db
from myapp import create_app

def import_skills():
    """Import skills from skills.html into the database."""
    # Create app context
    app = create_app()
    
    with app.app_context():
        # Read the skills.html file
        with open('myapp/templates/skills.html', 'r') as f:
            html_content = f.read()
        
        # Parse HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find all skill tables
        skill_tables = soup.find_all('table', class_='skill-table')
        
        # Keep track of skills to avoid duplicates
        existing_skills = set()
        
        for table in skill_tables:
            # Get element group from data-group attribute
            element_group = int(table.get('data-group', 0))
            
            # Find all skill entries
            skill_entries = table.find_all('tr', class_='skill-entry')
            
            for entry in skill_entries:
                # Extract skill data
                columns = entry.find_all('td')
                if len(columns) == 3:
                    name = columns[0].text.strip()
                    
                    # Skip if skill already exists
                    if name in existing_skills:
                        continue
                        
                    # Convert difficulty value
                    try:
                        value = float(columns[1].text.strip())
                    except ValueError:
                        print(f"Warning: Invalid difficulty value for skill '{name}', skipping")
                        continue
                    
                    # Create new skill
                    skill = Skill(
                        name=name,
                        value=value,
                        element_group=element_group,
                        event='floor'  # Default to floor, can be updated based on parent div
                    )
                    
                    # Update event based on parent div
                    parent_div = table.find_parent('div', id=True)
                    if parent_div and parent_div.get('id'):
                        skill.event = parent_div.get('id')
                    
                    # Add to database
                    db.session.add(skill)
                    existing_skills.add(name)
        
        # Commit all changes
        try:
            db.session.commit()
            print(f"Successfully imported {len(existing_skills)} skills")
        except Exception as e:
            db.session.rollback()
            print(f"Error importing skills: {str(e)}")

if __name__ == '__main__':
    import_skills() 