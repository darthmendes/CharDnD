from ..models.character import Character, CharacterClass
from ..models.species import Species
from ..models.dndclass import DnDclass
from ..models import session

class CharacterService:
    
    # CRUD operations
    def new(kwargs):
        if not CharacterService.is_valid(kwargs):
            return -1
        
        if CharacterService.get_name(kwargs['name']):
            return -2
        
        new_char = Character()
        new_char.name = kwargs['name']
        new_char.species = session.query(Species).filter_by(name = kwargs['species']).first()
        new_char.level = kwargs['level']
        new_char.abilityScores = kwargs['abilityScores']
        
        session.add(new_char)
        session.commit()

        characterClass = CharacterClass(
            characterID = new_char.id,
            classID = session.query(DnDclass).filter_by(name=kwargs['char_class']).first().id,
            level = new_char.level
        )
        session.add(characterClass)
        session.commit()
        return 1

    def get(id):
        char = session.query(Character).filter_by(id=id).first()
        return char

    def get_name(name):
        char = session.query(Character).filter_by(name=name).first()
        return char

    def update(id, **kwargs):
        char = session.query(Character).filter_by(id=id).first()
        if char:
            for key, value in kwargs.items():
                setattr(char, key, value)
            session.commit()
            
            return {"message": "Character updated successfully"}
        return {"error": "Character not found"}

    def delete(id):
        char = session.query(Character).filter_by(id=id).first()
        if char:
            session.delete(char)
            session.commit()
            return {"message": "Character deleted successfully"}
        return {"error": "Character not found"}

    def get_all():
        return session.query(Character).all()
    
    # upon receiving a dataDict verifies if is is valid
    def is_valid(dataDict):
        if 'name' not in dataDict or 'species' not in dataDict or 'char_class' not in dataDict or 'level' not in dataDict:
            return False
        if 'abilityScores' not in dataDict:
            return False

        # check if all fields are filled correctly
        if not dataDict['name'] or not dataDict['species'] or not dataDict['char_class'] or not dataDict['level'] or not dataDict['abilityScores']:
            return False
        
        return True
