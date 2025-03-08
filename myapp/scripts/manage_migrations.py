import sys
from flask_migrate import Migrate, upgrade, migrate, init
from myapp import create_app, db  # Updated import to use factory pattern

# Create the Flask app
app = create_app()

# Initialize Flask-Migrate
migrate_tool = Migrate(app, db)

def run_migration(action, message=None):
    """
    Run a specific migration action: init, migrate, or upgrade.
    """
    with app.app_context():
        if action == "init":
            try:
                print("Initializing migrations...")
                init()
                print("Migrations initialized successfully.")
            except Exception as e:
                print(f"Error during initialization: {e}")
        elif action == "migrate":
            if not message:
                print("Error: Please provide a message for the migration.")
                return
            print(f"Generating migration with message: {message}")
            migrate(message=message)
            print("Migration generated successfully.")
        elif action == "upgrade":
            print("Applying migrations...")
            upgrade()
            print("Migrations applied successfully.")
        else:
            print("Invalid action. Use 'init', 'migrate', or 'upgrade'.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python manage_migrations.py <action> [message]")
        print("Actions:")
        print("  init               - Initialize migrations.")
        print("  migrate <message>  - Generate a new migration with the given message.")
        print("  upgrade            - Apply all pending migrations.")
        sys.exit(1)

    action = sys.argv[1].lower()
    message = sys.argv[2] if len(sys.argv) > 2 else None
    run_migration(action, message)