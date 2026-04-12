"""
D&D 5e Database Population Master Script
=========================================
This script orchestrates the complete seeding of your D&D 5e database.

EXECUTION ORDER (Critical for dependencies):
1. Languages (no dependencies)
2. Features (no dependencies)
3. Species & Subspecies (needs Features for traits)
4. Species Traits Linking (needs Species + Features)
5. Classes (no dependencies)
6. Spells (no dependencies)
7. Spell-Class Relationships (needs Spells + Classes)
8. Items (no dependencies)
9. Backgrounds (needs Languages, Proficiencies)
10. Proficiencies (optional, if not in Features)

Run with: python populate_master.py
"""

import sys
from datetime import datetime
from Backend.models import session, engine
from Backend.models.item import Item
from Backend.models.dndclass import DnDclass
from Backend.models.species import Species
from Backend.models.languages import Language
from Backend.models.background import Background
from Backend.models.features import Features
from Backend.models.spells import Spell
from Backend.models.monster import Monster
from sqlalchemy import text

# ============================================================================
# === CONFIGURATION ===
# ============================================================================

# Toggle which sections to run
CONFIG = {
    "languages": True,
    "features": True,
    "species": True,
    "species_traits": True,
    "classes": True,
    "spells": True,
    "spell_class_mapping": True,
    "items": True,
    "backgrounds": True,
    "proficiencies": False,  # Optional - often included in Features
    "monsters": True,  # Optional - often included in Features
}

# ============================================================================
# === HELPER FUNCTIONS ===
# ============================================================================

def print_section_header(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")

def print_success(message: str):
    """Print a success message."""
    print(f"✅ {message}")

def print_error(message: str):
    """Print an error message."""
    print(f"❌ {message}")

def print_warning(message: str):
    """Print a warning message."""
    print(f"⚠️  {message}")

def verify_database_connection():
    """Test database connection before starting."""
    try:
        session.execute(text("SELECT 1"))
        print_success("Database connection verified!")
        return True
    except Exception as e:
        print_error(f"Database connection failed: {e}")
        return False

def get_table_counts():
    """Get counts of all major tables for verification."""
    tables = {
        "Languages": Language,
        "Features": Features,
        "Species": Species,
        "Classes": DnDclass,
        "Spells": Spell,
        "Items": Item,
        "Backgrounds": Background,
        #"Proficiencies": Proficiencie,
        "Monsters": Monster,
    }
    
    print("\n📊 Database Contents:")
    print("-" * 40)
    for name, model in tables.items():
        try:
            count = session.query(model).count()
            print(f"  {name:15} : {count:,}")
        except Exception as e:
            print(f"  {name:15} : ERROR - {e}")
    print("-" * 40)

# ============================================================================
# === SEED FUNCTIONS ===
# ============================================================================

def seed_languages():
    """Step 1: Populate Languages."""
    if not CONFIG["languages"]:
        print_warning("Skipping: Languages (disabled in config)")
        return
    
    print_section_header("STEP 1: Populating Languages")
    try:
        from populate.populate_languagesDB import add_languages
        add_languages()
        print_success("Languages populated successfully!")
    except Exception as e:
        print_error(f"Failed to populate languages: {e}")
        session.rollback()
        raise

def seed_features():
    """Step 2: Populate Features (including all 9 species traits)."""
    if not CONFIG["features"]:
        print_warning("Skipping: Features (disabled in config)")
        return
    
    print_section_header("STEP 2: Populating Features")
    try:
        from populate.populate_featuresDB import add_features
        add_features()
        print_success("Features populated successfully!")
    except Exception as e:
        print_error(f"Failed to populate features: {e}")
        session.rollback()
        raise

def seed_species():
    """Step 3: Populate Species & Subspecies (all 9 PHB races)."""
    if not CONFIG["species"]:
        print_warning("Skipping: Species (disabled in config)")
        return
    
    print_section_header("STEP 3: Populating Species & Subspecies")
    try:
        from populate.populate_speciesDB import add_species_and_subspecies
        add_species_and_subspecies()
        print_success("Species populated successfully!")
    except Exception as e:
        print_error(f"Failed to populate species: {e}")
        session.rollback()
        raise

def seed_species_traits():
    """Step 4: Link Species Traits to Features."""
    if not CONFIG["species_traits"]:
        print_warning("Skipping: Species Traits (disabled in config)")
        return
    
    print_section_header("STEP 4: Linking Species Traits")
    try:
        from populate.populate_speciesDB import add_species_traits
        add_species_traits()
        print_success("Species traits linked successfully!")
    except Exception as e:
        print_error(f"Failed to link species traits: {e}")
        session.rollback()
        raise

def seed_classes():
    """Step 5: Populate Classes (all 12 D&D 5e classes)."""
    if not CONFIG["classes"]:
        print_warning("Skipping: Classes (disabled in config)")
        return
    
    print_section_header("STEP 5: Populating Classes")
    try:
        from populate.populate_classesDB import populate_all_classes
        populate_all_classes()
        print_success("Classes populated successfully!")
    except Exception as e:
        print_error(f"Failed to populate classes: {e}")
        session.rollback()
        raise

def seed_spells():
    """Step 6: Populate Spells (all levels 0-9 + missing spells)."""
    if not CONFIG["spells"]:
        print_warning("Skipping: Spells (disabled in config)")
        return
    
    print_section_header("STEP 6: Populating Spells")
    try:
        # Main spell seed (PHB + XGtE + TCoE)
        from populate.populate_spellsDB import add_all
        add_all()
        
        print_success("Spells populated successfully!")
    except Exception as e:
        print_error(f"Failed to populate spells: {e}")
        session.rollback()
        raise

def seed_spell_class_mapping():
    """Step 7: Link Spells to Classes."""
    if not CONFIG["spell_class_mapping"]:
        print_warning("Skipping: Spell-Class Mapping (disabled in config)")
        return
    
    print_section_header("STEP 7: Mapping Spells to Classes")
    try:
        from populate.matchSpellsToClass import make_all_matches
        make_all_matches()
        print_success("Spell-Class mapping completed successfully!")
    except Exception as e:
        print_error(f"Failed to map spells to classes: {e}")
        session.rollback()
        raise

def seed_items():
    """Step 8: Populate Items."""
    if not CONFIG["items"]:
        print_warning("Skipping: Items (disabled in config)")
        return
    
    print_section_header("STEP 8: Populating Items")
    try:
        from populate.populate_itemDB import add_items
        add_items()
        print_success("Items populated successfully!")
    except Exception as e:
        print_error(f"Failed to populate items: {e}")
        session.rollback()
        raise

def seed_backgrounds():
    """Step 9: Populate Backgrounds."""
    if not CONFIG["backgrounds"]:
        print_warning("Skipping: Backgrounds (disabled in config)")
        return
    
    print_section_header("STEP 9: Populating Backgrounds")
    try:
        from populate.populate_backgroundsDB import populate_backgrounds
        populate_backgrounds()
        print_success("Backgrounds populated successfully!")
    except Exception as e:
        print_error(f"Failed to populate backgrounds: {e}")
        session.rollback()
        raise

def seed_proficiencies():
    """Step 10 (Optional): Populate Proficiencies."""
    if not CONFIG["proficiencies"]:
        print_warning("Skipping: Proficiencies (disabled in config)")
        return
    
    print_section_header("STEP 10: Populating Proficiencies")
    try:
        from populate.populate_proficienciesDB import add_proficiencies
        add_proficiencies()
        print_success("Proficiencies populated successfully!")
    except Exception as e:
        print_error(f"Failed to populate proficiencies: {e}")
        session.rollback()
        raise

def seed_monsters():
    """Step 11 (Optional): Populate Monsters."""
    if not CONFIG["monsters"]:
        print_warning("Skipping: Monsters (disabled in config)")
        return
    
    print_section_header("STEP 11: Populating Monsters")
    try:
        from populate.populate_monsters import add_monsters
        add_monsters()
        print_success("Monsters populated successfully!")
    except Exception as e:
        print_error(f"Failed to populate Monsters: {e}")
        session.rollback()
        raise

# ============================================================================
# === MAIN EXECUTION ===
# ============================================================================

def main():
    """Master function to run all seeding operations."""
    
    start_time = datetime.now()
    print("\n" + "🎲" * 40)
    print("  D&D 5e DATABASE POPULATION MASTER SCRIPT")
    print("🎲" * 40 + "\n")
    print(f"Started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Verify database connection
    if not verify_database_connection():
        print_error("Cannot proceed without database connection!")
        sys.exit(1)
    
    # Track success/failure
    failed_steps = []
    successful_steps = []
    
    try:
        # Execute all seeding steps in order
        steps = [
            ("Languages", seed_languages),
            ("Features", seed_features),
            ("Species", seed_species),
            ("Species Traits", seed_species_traits),
            ("Classes", seed_classes),
            ("Spells", seed_spells),
            ("Spell-Class Mapping", seed_spell_class_mapping),
            ("Items", seed_items),
            ("Backgrounds", seed_backgrounds),
            ("Proficiencies", seed_proficiencies),
            ("Monsters", seed_monsters),
        ]
        
        for step_name, step_func in steps:
            try:
                step_func()
                successful_steps.append(step_name)
            except Exception as e:
                failed_steps.append(step_name)
                print_error(f"Step '{step_name}' failed: {e}")
                
                # Ask if user wants to continue
                response = input(f"\n❌ {step_name} failed. Continue anyway? (y/n): ")
                if response.lower() != 'y':
                    print_warning("Aborting database population...")
                    break
        
        # Commit all successful changes
        if successful_steps:
            session.commit()
            print_success("\n💾 All changes committed to database!")
        
        # Final summary
        print_section_header("POPULATION SUMMARY")
        print(f"✅ Successful: {len(successful_steps)} steps")
        for step in successful_steps:
            print(f"   • {step}")
        
        if failed_steps:
            print(f"\n❌ Failed: {len(failed_steps)} steps")
            for step in failed_steps:
                print(f"   • {step}")
        
        # Show database contents
        get_table_counts()
        
        # End time
        end_time = datetime.now()
        duration = end_time - start_time
        print(f"\n⏱️  Total execution time: {duration}")
        print(f"Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
    except KeyboardInterrupt:
        print_warning("\n\n⚠️  Process interrupted by user!")
        session.rollback()
        sys.exit(1)
        
    except Exception as e:
        print_error(f"\n\n❌ CRITICAL ERROR: {e}")
        session.rollback()
        sys.exit(1)
        
    finally:
        session.close()
        print("🔒 Database session closed.\n")

if __name__ == "__main__":
    main()