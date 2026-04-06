#
# App To create a DnD Character
# Backend API layer — routes mapped to service layer.
#
# author: darthmendes
#

from flask import Flask, request, jsonify
from flask_cors import CORS
from http import HTTPStatus

# Services
from Backend.services.CharacterService import CharacterService as Character
from Backend.services.SpeciesService import SpeciesService as Species
from Backend.services.ClassService import ClassService as DnDClass
from Backend.services.ItemService import ItemService as Item
from Backend.services.LanguageService import LanguageService as Language
from Backend.services.SpellService import SpellService as Spell

from Backend.constants import PACK_DEFINITIONS
from Backend.config import FLASK_DEBUG, FLASK_PORT, CORS_ORIGINS, SECRET_KEY

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# CORS: Use environment-configured origins
if '*' in CORS_ORIGINS:
    CORS(app, origins='*')  # Development only
else:
    CORS(app, origins=CORS_ORIGINS)


################################################################
# Character Routes
################################################################

@app.route('/API/characters/creator', methods=['POST'])
def create_character():
    """Create a new character with the provided data."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), HTTPStatus.BAD_REQUEST

    # Frontend already sends lowercase ability scores, no transformation needed
    result = Character.new(data)
    if not result["success"]:
        if "already exists" in result["error"]:
            return jsonify({"error": result["error"]}), HTTPStatus.CONFLICT
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST

    return jsonify(result["data"]), HTTPStatus.CREATED


@app.route('/API/characters/<int:id>', methods=['DELETE'])
def delete_character(id):
    """Delete a character by ID."""
    result = Character.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": result["message"]}), HTTPStatus.OK


@app.route('/API/characters/<int:id>', methods=['GET'])
def get_character(id):
    """Retrieve a character by ID."""
    char = Character.get_byID(id)
    if not char:
        return jsonify({"error": "Character not found"}), HTTPStatus.NOT_FOUND
    return jsonify(char.to_dict()), HTTPStatus.OK


@app.route('/API/characters', methods=['GET'])
def list_characters():
    """Retrieve a list of all characters."""
    chars = Character.get_all()
    result = [{"id": c.id, "name": c.name} for c in chars]
    return jsonify(result), HTTPStatus.OK


@app.route('/API/characters/<int:charID>/items', methods=['POST'])
def add_item_to_character(charID):
    """Add an item or pack to a character's inventory."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), HTTPStatus.BAD_REQUEST
    
    if 'pack_name' in data:
        result = Item.add_pack_to_character(charID, data['pack_name'])
    elif 'itemID' in data:
        result = Item.add_item_to_character(charID, data['itemID'], data.get('quantity', 1))
    else:
        return jsonify({"error": "Missing itemID or pack_name"}), HTTPStatus.BAD_REQUEST

    if result["success"]:
        # Fetch and return the updated character
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        else:
            return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@app.route('/API/characters/<int:charID>/inventory/<int:inventoryID>', methods=['DELETE'])
def delete_inventory_item(charID, inventoryID):
    """Delete an item from character's inventory."""
    result = Item.delete_inventory_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@app.route('/API/characters/<int:charID>/inventory/<int:inventoryID>/charges', methods=['PATCH'])
def update_item_charges(charID, inventoryID):
    """Update current charges of an inventory item."""
    data = request.json
    if not data or 'currentCharges' not in data:
        return jsonify({"error": "Missing currentCharges field"}), HTTPStatus.BAD_REQUEST
    
    result = Item.update_item_charges(inventoryID, charID, data['currentCharges'])
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@app.route('/API/characters/<int:charID>/inventory/<int:inventoryID>/remove-one', methods=['PATCH'])
def remove_one_item(charID, inventoryID):
    """Remove 1 item from inventory (or delete entire entry if quantity is 1)."""
    result = Item.remove_one_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@app.route('/API/characters/<int:charID>/inventory/<int:inventoryID>/equip', methods=['PATCH'])
def equip_item(charID, inventoryID):
    """Equip an armor/shield item. Automatically unequips conflicting items."""
    result = Item.equip_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


@app.route('/API/characters/<int:charID>/inventory/<int:inventoryID>/unequip', methods=['PATCH'])
def unequip_item(charID, inventoryID):
    """Unequip an armor/shield item."""
    result = Item.unequip_item(inventoryID, charID)
    if result["success"]:
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), HTTPStatus.OK
        return jsonify(result), HTTPStatus.OK
    else:
        return jsonify(result), HTTPStatus.BAD_REQUEST


# app.py

@app.route('/API/characters/<int:charID>/inventory/<int:inventoryID>/attune', methods=['PATCH'])
def attune_item(charID, inventoryID):
    """Attune to a magic item."""
    from Backend.models import session
    from Backend.models.character import CharacterInventory
    
    try:
        # Get character
        char = Character.get_byID(charID)
        if not char:
            return jsonify({"error": "Character not found", "success": False}), 404
        
        # ✅ FIX: Use 'inventory' not 'inventory_items'
        inventory_item = session.query(CharacterInventory).filter_by(
            id=inventoryID,
            characterID=charID
        ).first()
        
        if not inventory_item:
            return jsonify({"error": "Inventory item not found", "success": False}), 404
        
        # Check if item requires attunement
        item = inventory_item.item
        requires_attunement = (
            item.property_data and item.property_data.get('requires_attunement', False) or
            (item.rarity and item.rarity in ['Rare', 'Very Rare', 'Legendary', 'Artifact'])
        )
        
        if not requires_attunement:
            return jsonify({
                "error": "This item does not require attunement",
                "success": False
            }), 400
        
        # Check if already attuned
        if inventory_item.is_attuned:
            return jsonify({
                "error": "Item is already attuned",
                "success": False
            }), 400
        
        # ✅ FIX: Use 'inventory' not 'inventory_items'
        attuned_count = session.query(CharacterInventory).filter_by(
            characterID=charID,
            is_attuned=True
        ).count()
        
        # Check attunement limit (default 4)
        attunement_limit = 4
        if hasattr(char, 'attunementSlotBonus'):
            attunement_limit += char.attunementSlotBonus
        
        if attuned_count >= attunement_limit:
            return jsonify({
                "error": f"Attunement slot limit reached ({attuned_count}/{attunement_limit})",
                "success": False,
                "attuned_count": attuned_count,
                "attunement_limit": attunement_limit
            }), 400
        
        # Attune the item
        inventory_item.is_attuned = True
        session.commit()
        
        # Return updated character
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), 200
        return jsonify({"success": True}), 200
        
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e), "success": False}), 500


@app.route('/API/characters/<int:charID>/inventory/<int:inventoryID>/unattune', methods=['PATCH'])
def unattune_item(charID, inventoryID):
    """Unattune from a magic item."""
    from Backend.models import session
    from Backend.models.character import CharacterInventory
    
    try:
        # Get character
        char = Character.get_byID(charID)
        if not char:
            return jsonify({"error": "Character not found", "success": False}), 404
        
        # Get inventory item
        inventory_item = session.query(CharacterInventory).filter_by(
            id=inventoryID,
            characterID=charID
        ).first()
        
        if not inventory_item:
            return jsonify({"error": "Inventory item not found", "success": False}), 404
        
        # Check if already unattuned
        if not inventory_item.is_attuned:
            return jsonify({
                "error": "Item is not attuned",
                "success": False
            }), 400
        
        # Unattune the item
        inventory_item.is_attuned = False
        session.commit()
        
        # Return updated character
        char = Character.get_byID(charID)
        if char:
            return jsonify(char.to_dict()), 200
        return jsonify({"success": True}), 200
        
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e), "success": False}), 500
    
################################################################
# Species Routes
################################################################

@app.route('/API/species/creator', methods=['POST'])
def create_species():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Invalid species data"}), HTTPStatus.BAD_REQUEST

    result = Species.new(data)
    if not result["success"]:
        if "already exists" in result["error"]:
            return jsonify({"error": result["error"]}), HTTPStatus.CONFLICT
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST
    return jsonify({"message": "Species created"}), HTTPStatus.CREATED


@app.route('/API/species/<int:id>', methods=['DELETE'])
def delete_species(id):
    result = Species.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Species deleted"}), HTTPStatus.OK


@app.route('/API/species/<int:id>', methods=['GET'])
def get_species(id):
    species = Species.get_byID(id)
    if not species:
        return jsonify({"error": "Species not found"}), HTTPStatus.NOT_FOUND
    return jsonify(species.to_dict()), HTTPStatus.OK


@app.route('/API/species', methods=['GET'])
def list_species():
    all_species = Species.get_all()  # This MUST load subspecies
    result = [s.to_dict() for s in all_species]
    return jsonify(result), HTTPStatus.OK


@app.route('/API/species/<species_name>/traits', methods=['GET'])
def get_species_traits(species_name):
    """Get all traits for a species (with optional subspecies filter)."""
    try:
        from Backend.models import session
        from Backend.models.species import Species as SpeciesModel, Subspecies, SpeciesTraits
        from Backend.models.features import Features
        
        # Find the species
        species = session.query(SpeciesModel).filter(
            SpeciesModel.name.ilike(species_name)
        ).first()
        
        if not species:
            return jsonify({"error": "Species not found"}), HTTPStatus.NOT_FOUND
        
        # Get subspecies from query params if provided
        subspecies_name = request.args.get('subspecies')
        
        traits = []
        
        # Get base species traits
        base_traits = session.query(SpeciesTraits).filter(
            SpeciesTraits.speciesID == species.id,
            SpeciesTraits.subspeciesID == None
        ).all()
        
        for st in base_traits:
            feature = session.query(Features).filter(Features.id == st.featureID).first()
            if feature:
                traits.append({
                    "feature_name": feature.name,
                    "name": feature.name,
                    "description": feature.desc,
                    "source": species.name
                })
        
        # Get subspecies traits if specified
        if subspecies_name:
            sub = session.query(Subspecies).filter(
                Subspecies.name.ilike(subspecies_name),
                Subspecies.speciesID == species.id
            ).first()
            
            if sub:
                sub_traits = session.query(SpeciesTraits).filter(
                    SpeciesTraits.subspeciesID == sub.id
                ).all()
                
                for st in sub_traits:
                    feature = session.query(Features).filter(Features.id == st.featureID).first()
                    if feature:
                        traits.append({
                            "feature_name": feature.name,
                            "name": feature.name,
                            "description": feature.desc,
                            "source": sub.name
                        })
        
        return jsonify(traits), HTTPStatus.OK
    
    except Exception as e:
        print(f"Error fetching species traits: {str(e)}")
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

################################################################
# Class Routes
################################################################

@app.route('/API/classes/creator', methods=['POST'])
def create_class():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Invalid class data"}), HTTPStatus.BAD_REQUEST

    result = DnDClass.new(data)
    if not result["success"]:
        if "already exists" in result["error"]:
            return jsonify({"error": result["error"]}), HTTPStatus.CONFLICT
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST
    return jsonify({"message": "Class created"}), HTTPStatus.CREATED


@app.route('/API/classes/<int:id>', methods=['DELETE'])
def delete_class(id):
    result = DnDClass.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Class deleted"}), HTTPStatus.OK


@app.route('/API/classes/<int:id>', methods=['GET'])
def get_class(id):
    dnd_class = DnDClass.get_byID(id)
    if not dnd_class:
        return jsonify({"error": "Class not found"}), HTTPStatus.NOT_FOUND
    return jsonify(dnd_class.to_dict()), HTTPStatus.OK


@app.route('/API/classes', methods=['GET'])
def list_classes():
    all_classes = DnDClass.get_all()
    return jsonify([c.to_dict() for c in all_classes]), 200


################################################################
# Background Routes
################################################################

@app.route('/API/backgrounds', methods=['GET'])
def list_backgrounds():
    from Backend.services.BackgroundService import BackgroundService
    result = BackgroundService.get_all()
    if result["success"]:
        return jsonify(result["data"]), 200
    return jsonify({"error": result["error"]}), 500


@app.route('/API/backgrounds/<int:bgID>', methods=['GET'])
def get_background(bgID):
    from Backend.services.BackgroundService import BackgroundService
    result = BackgroundService.get_byID(bgID)
    if result["success"]:
        return jsonify(result["data"]), 200
    return jsonify({"error": result["error"]}), 404


################################################################
# Item Routes
################################################################

@app.route('/API/items/creator', methods=['POST'])
def create_item():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Invalid item data"}), HTTPStatus.BAD_REQUEST

    result = Item.new(data)
    if not result["success"]:
        if "already exists" in result["error"]:
            return jsonify({"error": result["error"]}), HTTPStatus.CONFLICT
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST
    return jsonify({"message": "Item created"}), HTTPStatus.CREATED


@app.route('/API/items/<int:id>', methods=['GET'])
def get_item(id):
    item = Item.get_byID(id)
    if not item:
        return jsonify({"error": "Item not found"}), HTTPStatus.NOT_FOUND
    return jsonify(item.to_dict()), HTTPStatus.OK

@app.route('/API/items', methods=['GET'])
def list_items():
    all_items = Item.get_all()
    result = [c.to_dict() for c in all_items]
    return jsonify(result), HTTPStatus.OK

@app.route('/API/items/<int:id>', methods=['DELETE'])
def delete_item(id):
    result = Item.delete(id)
    if not result["success"]:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND
    return jsonify({"message": "Item deleted"}), HTTPStatus.OK

################################################################
# Language Routes
################################################################


@app.route('/API/languages', methods=['GET'])
def get_languages():
    try:
        languages = Language.get_all_languages()
        result = [lang.to_dict() for lang in languages]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
################################################################
# Spell Routes
################################################################

@app.route('/API/spells', methods=['GET'])
def list_spells():
    """Get all available spells."""
    try:
        spells = Spell.get_all_spells()
        result = [s.to_dict() for s in spells]
        return jsonify(result), HTTPStatus.OK
    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/API/characters/<int:charID>/spell-slots', methods=['GET'])
def get_spell_slots(charID):
    """Get character's available spell slots."""
    result = Spell.get_character_spell_slots(charID)
    if result["success"]:
        return jsonify(result["data"]), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND


@app.route('/API/characters/<int:charID>/spell-slots/expended', methods=['PATCH'])
def update_expended_slots(charID):
    """Update expended spell slots."""
    data = request.json
    if not data or 'level' not in data or 'amount' not in data:
        return jsonify({"error": "Missing level or amount"}), HTTPStatus.BAD_REQUEST
    
    result = Spell.update_expended_slots(charID, data['level'], data['amount'])
    if result["success"]:
        return jsonify({"success": True, "expended": result["data"]}), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST


@app.route('/API/characters/<int:charID>/spells', methods=['GET'])
def get_character_spells(charID):
    """Get all spells known by character."""
    result = Spell.get_character_spells(charID)
    if result["success"]:
        return jsonify(result["data"]), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND


@app.route('/API/characters/<int:charID>/spells', methods=['POST'])
def add_character_spell(charID):
    """Add a spell to character's known spells."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), HTTPStatus.BAD_REQUEST
    
    result = Spell.add_spell_to_character(charID, data)
    if result["success"]:
        return jsonify({"success": True, "spell": result["data"]}), HTTPStatus.CREATED
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.BAD_REQUEST


@app.route('/API/characters/<int:charID>/spells/<int:spellID>', methods=['DELETE'])
def remove_character_spell(charID, spellID):
    """Remove a spell from character's known spells."""
    result = Spell.remove_spell_from_character(charID, spellID)
    if result["success"]:
        return jsonify({"success": True}), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND


@app.route('/API/characters/<int:charID>/spells/<int:spellID>/prepare', methods=['PATCH'])
def toggle_spell_prepared(charID, spellID):
    """Toggle whether a spell is prepared."""
    result = Spell.toggle_spell_prepared(charID, spellID)
    if result["success"]:
        return jsonify({"success": True, "is_prepared": result["data"]["is_prepared"]}), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND


@app.route('/API/characters/<int:charID>/prepare-limit', methods=['GET'])
def get_prepare_limit(charID):
    """Get spell prepare limit for character based on D&D 5e rules."""
    result = Spell.calculate_prepare_limit(charID)
    if result["success"]:
        return jsonify({
            "prepare_limit": result["prepare_limit"],
            "prepared_count": result["prepared_count"],
            "prepare_ability": result["prepare_ability"],
            "primary_spellcasting_class": result["primary_spellcasting_class"],
            "unlimited": result["unlimited"]
        }), HTTPStatus.OK
    else:
        return jsonify({"error": result["error"]}), HTTPStatus.NOT_FOUND

@app.route('/API/classes/<class_name>/spells', methods=['GET'])
def get_class_spells(class_name):
    """Get all spells available to a class."""
    try:
        from Backend.models import session
        from Backend.models.dndclass import DnDclass, ClassSpell
        from Backend.models.spells import Spell as SpellModel
        
        # Find the class
        dnd_class = session.query(DnDclass).filter(
            DnDclass.name.ilike(class_name)
        ).first()
        
        if not dnd_class:
            return jsonify({"error": "Class not found"}), HTTPStatus.NOT_FOUND
        
        # Get spells from junction table for base class only
        class_spells = session.query(ClassSpell).filter(
            ClassSpell.classID == dnd_class.id,
            ClassSpell.subclass == None
        ).all()
        
        # Get the actual spell objects
        spellIDs = [cs.spellID for cs in class_spells]
        spells = session.query(SpellModel).filter(
            SpellModel.id.in_(spellIDs)
        ).all()
        
        return jsonify([spell.to_dict() for spell in spells]), HTTPStatus.OK
    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR
################################################################
# App Entry
################################################################

if __name__ == "__main__":
    app.run(port=FLASK_PORT, debug=FLASK_DEBUG)