from bs4 import BeautifulSoup
from app import app, db, Skill
import re

def parse_difficulty(diff_str):
    """Convert difficulty string to float"""
    try:
        return float(diff_str)
    except ValueError:
        return 0.0

def get_event_name(event_id):
    """Convert HTML div ID to proper event name"""
    event_mapping = {
        'floor': 'FX',
        'pommel': 'PH',
        'rings': 'SR',
        'vault': 'VT',
        'parallel': 'PB',
        'highbar': 'HB'
    }
    return event_mapping.get(event_id.lower(), event_id.upper())

def parse_skills_file(file_path):
    # Read the HTML file
    with open(file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    
    # Create BeautifulSoup object
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find the main container
    skills_container = soup.find('div', id='skill-table-container')
    
    skills_added = 0
    
    with app.app_context():
        # First, clear existing skills if needed
        # db.session.query(Skill).delete()
        
        # Iterate through each event div
        for event_div in skills_container.find_all('div', recursive=False):
            event_id = event_div.get('id')
            if not event_id:
                continue
                
            event = get_event_name(event_id)
            print(f"Processing {event} skills...")
            
            # Find all skill tables within this event
            skill_tables = event_div.find_all('table', class_='skill-table')
            
            for table in skill_tables:
                # Get element group from table header or data attribute
                header_row = table.find('tr')
                if header_row:
                    header_text = header_row.get_text()
                    group_match = re.search(r'GRP\s+(\d+)', header_text)
                    if group_match:
                        element_group = int(group_match.group(1))
                    else:
                        element_group = int(table.get('data-group', 0))
                
                # Find all skill entries
                skill_rows = table.find_all('tr', class_='skill-entry')
                
                for row in skill_rows:
                    columns = row.find_all('td')
                    if len(columns) >= 2:
                        name = columns[0].get_text().strip()
                        difficulty = parse_difficulty(columns[1].get_text().strip())
                        
                        # Check if skill already exists
                        existing_skill = Skill.query.filter_by(
                            name=name,
                            element_group=element_group,
                            value=difficulty,
                            event=event
                        ).first()
                        
                        if not existing_skill:
                            # Create new skill
                            new_skill = Skill(
                                name=name,
                                element_group=element_group,
                                value=difficulty,
                                event=event
                            )
                            db.session.add(new_skill)
                            skills_added += 1
        
        # Commit all changes
        try:
            db.session.commit()
            print(f"Successfully added {skills_added} new skills to the database")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding skills to database: {str(e)}")
            raise

def main():
    # First, recreate the database tables
    with app.app_context():
        db.drop_all()
        db.create_all()
    
    # Then parse and add the skills
    html_file_path = "/Users/gustavo/Desktop/Routine-builder/templates/fig.html"  # Replace with your HTML file path
    parse_skills_file(html_file_path)

if __name__ == "__main__":
    main()