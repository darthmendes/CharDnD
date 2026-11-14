import logging

from sqlalchemy.exc import SQLAlchemyError

from Backend.models.character import Character, CharacterClass, CharacterSpell
from Backend.models.extra import CharacterSpellSlot
from Backend.models.spells import Spell
from .BaseModelService import BaseModelService


logger = logging.getLogger(__name__)


class SpellService(BaseModelService):
    model = Spell

    MULTICLASS_SLOT_TABLE = {
        1: {1: 2},
        2: {1: 3},
        3: {1: 4, 2: 2},
        4: {1: 4, 2: 3},
        5: {1: 4, 2: 3, 3: 2},
        6: {1: 4, 2: 3, 3: 3},
        7: {1: 4, 2: 3, 3: 3, 4: 1},
        8: {1: 4, 2: 3, 3: 3, 4: 2},
        9: {1: 4, 2: 3, 3: 3, 4: 3, 5: 1},
        10: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2},
        11: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1},
        12: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1},
        13: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1},
        14: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1},
        15: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1},
        16: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1},
        17: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1},
        18: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1},
        19: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1},
        20: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1},
    }

    @classmethod
    def get_all_spells(cls):
        return cls.db_session.query(Spell).order_by(Spell.name).all()

    @staticmethod
    def _class_data(classes):
        result = []
        for character_class in classes:
            if isinstance(character_class, dict):
                result.append(character_class)
                continue
            dnd_class = character_class.dndclass
            result.append({
                "className": dnd_class.name,
                "level": character_class.classLevel,
                "subclass": character_class.subclass.name if character_class.subclass else "",
                "spellcastingAbility": dnd_class.spellcasting_ability,
                "progression": (
                    dnd_class.caster_progression.name
                    if dnd_class.caster_progression
                    else None
                ),
            })
        return result

    @staticmethod
    def calculate_spellcaster_level(classes):
        full_casters = {"bard", "cleric", "druid", "sorcerer", "wizard"}
        half_casters = {"paladin", "ranger"}
        third_subclasses = {"eldritch knight", "arcane trickster"}
        total = 0

        for character_class in classes:
            name = str(character_class.get("className", "")).strip().lower()
            level = character_class.get("level", character_class.get("classLevel", 0))
            if type(level) is not int or level < 0:
                continue

            progression = str(character_class.get("progression") or "").strip().lower()
            if name == "artificer":
                total += (level + 1) // 2
            elif progression in {"full", "full caster", "full-caster"} or name in full_casters:
                total += level
            elif progression in {"half", "half caster", "half-caster"} or name in half_casters:
                total += level // 2
            elif progression in {"third", "third caster", "third-caster"}:
                total += level // 3
            elif name in {"fighter", "rogue"}:
                subclass = str(character_class.get("subclass") or "").strip().lower()
                if subclass in third_subclasses:
                    total += level // 3
        return min(total, 20)

    @classmethod
    def get_spell_slots(cls, spellcaster_level):
        return cls.MULTICLASS_SLOT_TABLE.get(spellcaster_level, {})

    @staticmethod
    def _ability_name(value):
        normalized = str(value or "").strip().lower()
        return {
            "str": "strength", "strength": "strength",
            "dex": "dexterity", "dexterity": "dexterity",
            "con": "constitution", "constitution": "constitution",
            "int": "intelligence", "intelligence": "intelligence",
            "wis": "wisdom", "wisdom": "wisdom",
            "cha": "charisma", "charisma": "charisma",
        }.get(normalized)

    @classmethod
    def _ability_score(cls, character, ability):
        field = cls._ability_name(ability)
        if field is None:
            return 10
        if isinstance(character, dict):
            scores = character.get("abilityScores", {})
            abbreviation = field[:3]
            return scores.get(abbreviation, scores.get(field, character.get(field, 10)))
        return getattr(character, field, 10) or 10

    @staticmethod
    def _proficiency_bonus(level):
        return 2 + max(0, min(4, (max(1, level) - 1) // 4))

    @classmethod
    def _character_level(cls, character, fallback=1):
        if isinstance(character, dict):
            for key in ("level", "totalLevel", "characterLevel"):
                value = character.get(key)
                if isinstance(value, int) and value >= 1:
                    return value
            classes = character.get("classes") or []
            total = 0
            for item in classes:
                if isinstance(item, dict):
                    level = item.get("level", item.get("classLevel"))
                    if isinstance(level, int) and level >= 0:
                        total += level
            if total > 0:
                return total
            return fallback

        for key in ("level", "totalLevel", "characterLevel"):
            value = getattr(character, key, None)
            if isinstance(value, int) and value >= 1:
                return value

        classes = getattr(character, "class_associations", None) or []
        total = 0
        for item in classes:
            level = getattr(item, "classLevel", None)
            if isinstance(level, int) and level >= 0:
                total += level
        if total > 0:
            return total
        return fallback

    @classmethod
    def calculate_spell_dc(cls, character, spellcasting_ability, level=None):
        ability_modifier = (cls._ability_score(character, spellcasting_ability) - 10) // 2
        if level is None:
            level = cls._character_level(character)
        return 8 + cls._proficiency_bonus(level) + ability_modifier

    @classmethod
    def calculate_spell_attack_bonus(cls, character, spellcasting_ability, level=None):
        ability_modifier = (cls._ability_score(character, spellcasting_ability) - 10) // 2
        if level is None:
            level = cls._character_level(character)
        return cls._proficiency_bonus(level) + ability_modifier

    @classmethod
    def get_spellcasting_ability(cls, classes):
        ability_map = {
            "wizard": "int", "cleric": "wis", "druid": "wis",
            "sorcerer": "cha", "bard": "cha", "paladin": "cha",
            "ranger": "wis", "warlock": "cha", "artificer": "int",
        }
        for character_class in classes:
            ability = character_class.get("spellcastingAbility")
            if ability:
                normalized = cls._ability_name(ability)
                if normalized:
                    return normalized[:3]
            name = str(character_class.get("className", "")).strip().lower()
            if name in ability_map:
                return ability_map[name]
        return "int"

    @classmethod
    def get_character_spell_slots(cls, charID):
        try:
            character = cls.db_session.query(Character).filter_by(id=charID).first()
            if character is None:
                return {"success": False, "error": "Character not found."}

            classes = cls.db_session.query(CharacterClass).filter_by(
                characterID=charID
            ).all()
            classes_data = cls._class_data(classes)
            caster_level = cls.calculate_spellcaster_level(classes_data)
            slot_counts = cls.get_spell_slots(caster_level)
            expended_rows = cls.db_session.query(CharacterSpellSlot).filter_by(
                characterID=charID
            ).all()
            expended = {row.slotLevel: row.expendedSlots for row in expended_rows}
            slots = [
                {
                    "level": level,
                    "total": count,
                    "expended": min(expended.get(level, 0), count),
                    "remaining": max(0, count - expended.get(level, 0)),
                }
                for level, count in sorted(slot_counts.items())
            ]
            ability = cls.get_spellcasting_ability(classes_data)
            total_level = sum(item["level"] for item in classes_data)
            return {
                "success": True,
                "data": {
                    "slots": slots,
                    "spellcaster_level": caster_level,
                    "spellcasting_ability": ability,
                    "spell_save_dc": cls.calculate_spell_dc(character, ability, total_level),
                    "spell_attack_bonus": cls.calculate_spell_attack_bonus(
                        character, ability, total_level
                    ),
                },
            }
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error calculating character spell slots")
            return {"success": False, "error": str(error)}

    @classmethod
    def update_expended_slots(cls, charID, level, amount):
        if type(level) is not int or not 1 <= level <= 9:
            return {"success": False, "error": "Slot level must be an integer from 1 to 9."}
        if type(amount) is not int or amount == 0:
            return {"success": False, "error": "Amount must be a non-zero integer."}

        try:
            character = cls.db_session.query(Character).filter_by(id=charID).first()
            if character is None:
                return {"success": False, "error": "Character not found."}

            slot_result = cls.get_character_spell_slots(charID)
            if not slot_result["success"]:
                return slot_result
            totals = {slot["level"]: slot["total"] for slot in slot_result["data"]["slots"]}
            if level not in totals:
                return {"success": False, "error": "Character has no slots at that level."}

            usage = cls.db_session.query(CharacterSpellSlot).filter_by(
                characterID=charID,
                slotLevel=level,
            ).first()
            current = usage.expendedSlots if usage else 0
            updated = current + amount
            if updated < 0 or updated > totals[level]:
                return {"success": False, "error": "Expended slots must stay within the available slot count."}

            if usage is None:
                usage = CharacterSpellSlot(
                    characterID=charID,
                    slotLevel=level,
                    expendedSlots=updated,
                )
                cls.db_session.add(usage)
            else:
                usage.expendedSlots = updated
            cls.db_session.commit()
            return cls.get_character_spell_slots(charID)
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error updating character spell slots")
            return {"success": False, "error": str(error)}

    @staticmethod
    def _serialize_character_spell(character_spell):
        return {
            "id": character_spell.spellID,
            "spell": character_spell.spell.to_dict(),
            "prepared": bool(character_spell.isPrepared),
        }

    @classmethod
    def get_character_spells(cls, charID):
        try:
            character = cls.db_session.query(Character).filter_by(id=charID).first()
            if character is None:
                return {"success": False, "error": "Character not found."}
            spells = cls.db_session.query(CharacterSpell).filter_by(
                characterID=charID
            ).all()
            return {
                "success": True,
                "data": [cls._serialize_character_spell(row) for row in spells],
            }
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error listing character spells")
            return {"success": False, "error": str(error)}

    @classmethod
    def add_spell_to_character(cls, charID, spell_data):
        if not isinstance(spell_data, dict) or not isinstance(spell_data.get("spellID"), int):
            return {"success": False, "error": "spellID must be an integer."}

        try:
            character = cls.db_session.query(Character).filter_by(id=charID).first()
            if character is None:
                return {"success": False, "error": "Character not found."}
            spell = cls.db_session.query(Spell).filter_by(id=spell_data["spellID"]).first()
            if spell is None:
                return {"success": False, "error": "Spell not found."}
            existing = cls.db_session.query(CharacterSpell).filter_by(
                characterID=charID,
                spellID=spell.id,
            ).first()
            if existing is not None:
                return {"success": False, "error": "Spell is already on this character."}

            prepared = spell_data.get("isPrepared", spell_data.get("is_prepared", False))
            if not isinstance(prepared, bool):
                return {"success": False, "error": "isPrepared must be a boolean."}
            association = CharacterSpell(
                characterID=charID,
                spellID=spell.id,
                isPrepared=prepared,
            )
            cls.db_session.add(association)
            cls.db_session.commit()
            return {"success": True, "data": cls._serialize_character_spell(association)}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error adding a character spell")
            return {"success": False, "error": str(error)}

    @classmethod
    def add_spells_bulk_to_character(cls, charID, spell_ids, is_prepared=False):
        if not isinstance(spell_ids, (list, tuple)) or any(
            not isinstance(spell_id, int) for spell_id in spell_ids
        ):
            return {"success": False, "error": "spell_ids must be a list of integer IDs."}
        if not isinstance(is_prepared, bool):
            return {"success": False, "error": "is_prepared must be a boolean."}

        try:
            character = cls.db_session.query(Character).filter_by(id=charID).first()
            if character is None:
                return {"success": False, "error": "Character not found."}
            requested_ids = set(spell_ids)
            if not requested_ids:
                return {"success": True, "data": [], "count": 0}
            spells = cls.db_session.query(Spell).filter(Spell.id.in_(requested_ids)).all()
            if {spell.id for spell in spells} != requested_ids:
                return {"success": False, "error": "One or more spells were not found."}

            existing_ids = {
                row.spellID
                for row in cls.db_session.query(CharacterSpell).filter(
                    CharacterSpell.characterID == charID,
                    CharacterSpell.spellID.in_(requested_ids),
                ).all()
            }
            associations = [
                CharacterSpell(
                    characterID=charID,
                    spellID=spell_id,
                    isPrepared=is_prepared,
                )
                for spell_id in sorted(requested_ids - existing_ids)
            ]
            cls.db_session.add_all(associations)
            cls.db_session.commit()
            return {
                "success": True,
                "data": [cls._serialize_character_spell(row) for row in associations],
                "count": len(associations),
            }
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error bulk adding character spells")
            return {"success": False, "error": str(error)}

    @classmethod
    def remove_spell_from_character(cls, charID, spellID):
        try:
            association = cls.db_session.query(CharacterSpell).filter_by(
                characterID=charID,
                spellID=spellID,
            ).first()
            if association is None:
                return {"success": False, "error": "Spell not found on character."}
            cls.db_session.delete(association)
            cls.db_session.commit()
            return {"success": True, "message": "Spell removed from character."}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error removing a character spell")
            return {"success": False, "error": str(error)}

    @classmethod
    def toggle_spell_prepared(cls, charID, spellID):
        try:
            association = cls.db_session.query(CharacterSpell).filter_by(
                characterID=charID,
                spellID=spellID,
            ).first()
            if association is None:
                return {"success": False, "error": "Spell not found on character."}
            association.isPrepared = not association.isPrepared
            cls.db_session.commit()
            return {
                "success": True,
                "data": cls._serialize_character_spell(association),
            }
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error toggling character spell preparation")
            return {"success": False, "error": str(error)}

    @classmethod
    def set_spells_prepared(cls, charID, spell_ids, is_prepared):
        if not isinstance(spell_ids, list) or any(
            not isinstance(spell_id, int) for spell_id in spell_ids
        ):
            return {"success": False, "error": "spell_ids must be a list of integer IDs."}
        if not isinstance(is_prepared, bool):
            return {"success": False, "error": "is_prepared must be a boolean."}

        try:
            associations = cls.db_session.query(CharacterSpell).filter(
                CharacterSpell.characterID == charID,
                CharacterSpell.spellID.in_(set(spell_ids)),
            ).all() if spell_ids else []
            if len(associations) != len(set(spell_ids)):
                return {"success": False, "error": "One or more spells were not found on character."}
            for association in associations:
                association.isPrepared = is_prepared
            cls.db_session.commit()
            return {"success": True, "data": [cls._serialize_character_spell(row) for row in associations]}
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error updating character spell preparation")
            return {"success": False, "error": str(error)}

    @classmethod
    def calculate_prepare_limit(cls, charID):
        try:
            character = cls.db_session.query(Character).filter_by(id=charID).first()
            if character is None:
                return {"success": False, "error": "Character not found."}
            classes = cls._class_data(
                cls.db_session.query(CharacterClass).filter_by(characterID=charID).all()
            )
            limits = []
            abilities = []
            unlimited = False
            for character_class in classes:
                name = str(character_class["className"]).lower()
                level = character_class["level"]
                rule = {
                    "cleric": ("wis", 1), "druid": ("wis", 1),
                    "paladin": ("cha", 0.5), "ranger": ("wis", 0.5),
                    "wizard": ("int", 1), "artificer": ("int", 0.5),
                }.get(name)
                if rule:
                    ability, multiplier = rule
                    class_level = int(level * multiplier)
                    limits.append(max(1, (cls._ability_score(character, ability) - 10) // 2 + class_level))
                    abilities.append(ability)
                elif name in {"bard", "sorcerer"}:
                    unlimited = True

            prepared_count = cls.db_session.query(CharacterSpell).join(Spell).filter(
                CharacterSpell.characterID == charID,
                CharacterSpell.isPrepared.is_(True),
                Spell.level > 0,
            ).count()
            limit = sum(limits) if limits else None
            if limits:
                unlimited = False
            return {
                "success": True,
                "limit": limit,
                "prepared": prepared_count,
                "prepare_ability": ", ".join(sorted(set(abilities))) or None,
                "primary_spellcasting_class": classes[0]["className"] if classes else None,
                "unlimited": unlimited,
            }
        except SQLAlchemyError as error:
            cls.db_session.rollback()
            logger.exception("Database error calculating spell preparation limit")
            return {"success": False, "error": str(error)}
