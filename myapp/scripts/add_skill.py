import json
import os

def load_skills_database():
    """Load the skills database from the JSON file."""
    try:
        with open('myapp/static/skills.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: skills.json not found in myapp/static/")
        return None

def save_skills_database(data):
    """Save the skills database back to the JSON file."""
    try:
        with open('myapp/static/skills.json', 'w') as f:
            json.dump(data, f, indent=2)
        print("Database updated successfully!")
        return True
    except Exception as e:
        print(f"Error saving database: {e}")
        return False

def get_valid_events():
    """Return list of valid events."""
    return ['floor', 'pommel', 'rings', 'vault', 'pbars', 'highbar']

def add_skill():
    """Interactive function to add a new skill to the database."""
    # Load the database
    db = load_skills_database()
    if not db:
        return
    
    # Get valid events
    valid_events = get_valid_events()
    
    # Get event
    print("\nAvailable events:")
    for i, event in enumerate(valid_events, 1):
        print(f"{i}. {event}")
    
    while True:
        try:
            event_idx = int(input("\nSelect event number: ")) - 1
            if 0 <= event_idx < len(valid_events):
                event = valid_events[event_idx]
                break
            print("Invalid selection. Please try again.")
        except ValueError:
            print("Please enter a valid number.")
    
    # Get available groups for the selected event
    if event not in db:
        print(f"Error: Event '{event}' not found in database")
        return
        
    groups = list(db[event].keys())
    print("\nAvailable groups for", event + ":")
    for i, group in enumerate(groups, 1):
        print(f"{i}. {group}")
    
    while True:
        try:
            group_idx = int(input("\nSelect group number: ")) - 1
            if 0 <= group_idx < len(groups):
                group = groups[group_idx]
                break
            print("Invalid selection. Please try again.")
        except ValueError:
            print("Please enter a valid number.")
    
    # Get skill name
    while True:
        name = input("\nEnter skill name: ").strip()
        if name:
            break
        print("Skill name cannot be empty.")
    
    # Get skill value
    while True:
        try:
            value = float(input("\nEnter skill value (0.0-1.0): "))
            if 0.0 <= value <= 1.0:
                break
            print("Value must be between 0.0 and 1.0")
        except ValueError:
            print("Please enter a valid number.")
    
    # Confirm addition
    print("\nNew skill details:")
    print(f"Event: {event}")
    print(f"Group: {group}")
    print(f"Name: {name}")
    print(f"Value: {value}")
    
    confirm = input("\nAdd this skill? (y/n): ").lower()
    if confirm == 'y':
        # Make sure the group exists and is a list
        if group not in db[event]:
            db[event][group] = []
        elif not isinstance(db[event][group], list):
            db[event][group] = []
            
        # Add the skill
        new_skill = {
            "name": name,
            "value": value
        }
        
        # Add to the group's skill list
        if isinstance(db[event][group], list):
            db[event][group].append(new_skill)
        else:
            db[event][group] = [new_skill]
        
        # Save the database
        if save_skills_database(db):
            print(f"\nSkill '{name}' added successfully to {event} - {group}!")
        else:
            print("\nFailed to add skill.")
    else:
        print("\nSkill addition cancelled.")

def main():
    while True:
        print("\n=== Gymnastics Skills Database Manager ===")
        print("1. Add new skill")
        print("2. Exit")
        
        choice = input("\nSelect an option: ").strip()
        
        if choice == '1':
            add_skill()
        elif choice == '2':
            print("\nGoodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main() 