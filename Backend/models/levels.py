barbarian = {
    {
    "level": 1,
    "ability_score_bonuses": 0,
    "prof_bonus": 2,
    "features": ["Rage","Unarmored Defense"],
    "class_specific": {
      "rage_count": 2,
      "rage_damage_bonus": 2,
      "brutal_critical_dice": 0
    },
    "index": "barbarian-1",
    "class": {
      "name": "Barbarian",
    },
  },
  {
    "level": 2,
    "ability_score_bonuses": 0,
    "prof_bonus": 2,
    "features": ["Reckless Attack", "Danger Sense"],
    "class_specific": {
      "rage_count": 2,
      "rage_damage_bonus": 2,
      "brutal_critical_dice": 0
    },
    "index": "barbarian-2",
    "class": {
      "name": "Barbarian",
    },
  },
  {
    "level": 3,
    "ability_score_bonuses": 0,
    "prof_bonus": 2,
    "features": ["Primal Path"],
    "class_specific": {
      "rage_count": 3,
      "rage_damage_bonus": 2,
      "brutal_critical_dice": 0
    },
    "index": "barbarian-3",
    "class": {
      "name": "Barbarian"
    }
  }
}
druid = {
    {
    "level": 1,
    "ability_score_bonuses": 0,
    "prof_bonus": 2,
    "features": ["Spellcasting: Druid","Druidic"],
    "spellcasting": {
      "cantrips_known": 2,
      "spell_slots_level_1": 2,
      "spell_slots_level_2": 0,
      "spell_slots_level_3": 0,
      "spell_slots_level_4": 0,
      "spell_slots_level_5": 0,
      "spell_slots_level_6": 0,
      "spell_slots_level_7": 0,
      "spell_slots_level_8": 0,
      "spell_slots_level_9": 0
    },
    "class_specific": {
      "wild_shape_max_cr": 0,
      "wild_shape_swim": False,
      "wild_shape_fly": False
    },
    "class": "Druid"
  }
}
 
#
# | Class | Level | Ability Score Bonuses | Proficiency Bonus | Features | Class Specific | Spell Casting |
#

from sqlalchemy import Column, Integer, String
from utils import JSONType
from . import Base

class Level(Base):

    __tablename__ = "levels"
    id = Column(Integer, primary_key=True, autoincrement=True)
    char_class = Column(String, nullable=False)
    level = Column(Integer, nullable=False)
    abilityScoreBonuses = Column(JSONType)
    proficiencyBonus = Column(Integer)
    spellCasting = Column(JSONType) 
    features = Column(JSONType) 
    class_specific = Column(JSONType)
    
    def to_dict(self):
        return {
            'id':self.id,
            'char_class': self.char_class,
            'level': self.level
            }
