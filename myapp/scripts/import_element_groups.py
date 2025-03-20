from myapp.models.element_group import ElementGroup
from myapp.models import db
from myapp import create_app

def import_element_groups():
    """Import element groups into the database."""
    # Create app context
    app = create_app()
    
    with app.app_context():
        # Define the element groups data
        element_groups_data = [
            # FX (Floor Exercise)
            {"name": "Non-acrobatic elements", "event": "FX", "element_group": 1},
            {"name": "Acrobatic elements forward", "event": "FX", "element_group": 2},
            {"name": "Acrobatic elements backward", "event": "FX", "element_group": 3},
            {"name": "Single Salto forward and/or backward with 1 or more turns", "event": "FX", "element_group": 4},
            
            # PH (Pommel Horse)
            {"name": "Single leg swings and scissors", "event": "PH", "element_group": 1},
            {"name": "Circle and flairs, with and/or without spindles and handstands, Kherswings, Russian, wendeswings, flops and combined elements", "event": "PH", "element_group": 2},
            {"name": "Travel type elements, including Tong Fei, Wu Guonion, Roth and combined elements", "event": "PH", "element_group": 3},
            {"name": "Dismounts", "event": "PH", "element_group": 4},
            
            # Mushroom
            {"name": "Flairs", "event": "Mushroom", "element_group": 1},
            {"name": "Circles", "event": "Mushroom", "element_group": 2},
            {"name": "180° Turns", "event": "Mushroom", "element_group": 3},
            {"name": "Dismount", "event": "Mushroom", "element_group": 4},
            
            # SR (Still Rings)
            {"name": "Kip and swing elements & swings through or to handstand (2 sec.)", "event": "SR", "element_group": 1},
            {"name": "Strength elements and hold elements (2 sec.)", "event": "SR", "element_group": 2},
            {"name": "Swing to Strength hold elements (2 sec.)", "event": "SR", "element_group": 3},
            {"name": "Dismounts", "event": "SR", "element_group": 4},
            
            # VT (Vault)
            {"name": "Single salto vaults with complex twists", "event": "VT", "element_group": 1},
            {"name": "Handspring salto vaults with or without simple twists, and all double salto fwd.", "event": "VT", "element_group": 2},
            {"name": "Handspring sideways and Tsukahara vaults with or without simple twists, and all double salto bwd.", "event": "VT", "element_group": 3},
            {"name": "Round off entry and single salto vaults with complex twists", "event": "VT", "element_group": 4},
            
            # PB (Parallel Bars)
            {"name": "Elements starting in upper arm position", "event": "PB", "element_group": 1},
            {"name": "Elements in support or through support on 2 bars", "event": "PB", "element_group": 2},
            {"name": "Long swings in hand on 1 or 2 bars and underswings", "event": "PB", "element_group": 3},
            {"name": "Dismounts", "event": "PB", "element_group": 4},
            
            # HB (Horizontal Bar)
            {"name": "Long hang swings with and without turns", "event": "HB", "element_group": 1},
            {"name": "Flight elements", "event": "HB", "element_group": 2},
            {"name": "In bar and Adler elements", "event": "HB", "element_group": 3},
            {"name": "Dismounts", "event": "HB", "element_group": 4},
        ]
        
        # Delete existing element groups to avoid duplicates
        ElementGroup.query.delete()
        
        # Add all element groups
        for group_data in element_groups_data:
            element_group = ElementGroup(**group_data)
            db.session.add(element_group)
        
        # Commit the changes
        try:
            db.session.commit()
            print(f"Successfully imported {len(element_groups_data)} element groups")
        except Exception as e:
            db.session.rollback()
            print(f"Error importing element groups: {str(e)}")

if __name__ == '__main__':
    import_element_groups() 