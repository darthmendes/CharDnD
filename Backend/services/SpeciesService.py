from ..models.species import Species
from ..models import session  

class SpeciesService:
    # Starting CRUD funtions
    def new(kwargs):
        if not Species.is_valid(kwargs):
            return -1
        
        if Species.get(kwargs['name']):
            return -2
        
        new_spec = Species()
        for key, value in kwargs.items():
            setattr(new_spec, key, value)
        session.add(new_spec)
        session.commit()
        return 1
    
    def update(name, **kwargs):
        species = session.query(Species).filter_by(name=name).first()
        if species:
            for key, value in kwargs.items():
                setattr(species, key, value)
            session.commit()
            return {"message": "Species updated successfully", "id": species.id}
        return {"message": "Species not found", "id": None}
    
    def get(id):
        char = session.query(Species).filter_by(id=id).first()
        return char
    
    
    def delete(id):
        char = session.query(Species).filter_by(id=id).first()
        if char:
            session.delete(char)
            session.commit()
            return {"message": "Species deleted successfully"}
        return {"error": "Species not found"}

    def get_all():
        return session.query(Species).all()
        
    # upon receiving a dataDict verifies if is is valid
    def is_valid(dataDict):
        if 'name' not in dataDict or 'speed' not in dataDict:
            return False

        # check if all fields are filled correctly
        if not dataDict['name'] or not dataDict['speed']:
            return False
        
        return True
