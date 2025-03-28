from bs4 import BeautifulSoup
import json
import os

def convert_html_to_json(html_path):
    # Read the HTML file
    with open(html_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Parse HTML
    soup = BeautifulSoup(content, 'html.parser')
    
    # Initialize the main JSON structure
    skills_json = {}
    
    # Find all event divs (floor, pommel, rings, etc.)
    event_divs = soup.find_all('div', id=['floor', 'pommel', 'rings', 'vault', 'pbars', 'highbar', 'Mushroom'])
    
    for event_div in event_divs:
        event_name = event_div.get('id')
        skills_json[event_name] = {}
        
        # Find all tables in this event (each table is an element group)
        tables = event_div.find_all('table', class_='skill-table')
        
        for table in tables:
            # Get the element group name from the first th with colspan=3
            group_header = table.find('th', attrs={'colspan': '3'})
            if not group_header:
                continue
                
            group_name = group_header.text.strip()
            
            # Create a safe key for the group name (replace spaces with underscores)
            group_key = group_name.split('--')[0].strip().replace(' ', '_')
            
            # Initialize the group in JSON
            skills_json[event_name][group_key] = {
                "name": group_name,
                "skills": []
            }
            
            # Find all skill rows
            skill_rows = table.find_all('tr', class_='skill-entry')
            
            for row in skill_rows:
                cells = row.find_all('td')
                if len(cells) >= 3:
                    skill = {
                        "name": cells[0].text.strip(),
                        "difficulty": float(cells[1].text.strip()),
                        "element_group": int(cells[2].text.strip())
                    }
                    skills_json[event_name][group_key]["skills"].append(skill)
    
    return skills_json

def main():
    # Get the absolute path to the skills.html file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(script_dir, 'myapp', 'templates', 'skills.html')
    
    # Convert HTML to JSON
    skills_json = convert_html_to_json(html_path)
    
    # Write to a JSON file
    output_path = os.path.join(script_dir, 'skills.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(skills_json, f, indent=2, ensure_ascii=False)
    
    print(f"JSON file has been created at: {output_path}")
    
    # Print some statistics
    total_skills = sum(
        len(group["skills"]) 
        for event in skills_json.values() 
        for group in event.values()
    )
    print(f"\nTotal number of skills converted: {total_skills}")
    print("\nSkills per event:")
    for event, groups in skills_json.items():
        event_total = sum(len(group["skills"]) for group in groups.values())
        print(f"{event}: {event_total} skills")

if __name__ == "__main__":
    main() 