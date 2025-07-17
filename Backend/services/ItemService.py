from ..models.item import Item
from ..models import session 

class ItemService:
        
    # Starting CRUD funtions
    def new(kwargs):
        if not ItemService.is_valid(kwargs):
            return -1
        
        if ItemService.get_name(kwargs['name']):
            return -2
        
        new_spec = Item()
        for key, value in kwargs.items():
            setattr(new_spec, key, value)
        session.add(new_spec)
        session.commit()
        return 1
    
    def update(name, **kwargs):
        aux = session.query(Item).filter_by(name=name).first()
        if aux:
            for key, value in kwargs.items():
                setattr(aux, key, value)
            session.commit()
            return {"message": "Item updated successfully", "id": aux.id}
        return {"message": "Item not found", "id": None}
    
    def get(id):
        char = session.query(Item).filter_by(id=id).first()
        return char
    
    def get_name(name):
        char = session.query(Item).filter_by(name=name).first()
        return char
    
    
    def delete(id):
        char = session.query(Item).filter_by(id=id).first()
        if char:
            session.delete(char)
            session.commit()
            return {"message": "Item deleted successfully"}
        return {"error": "Item not found"}

    def get_all():
        return session.query(Item).all()
    
    # upon receiving a dataDict verifies if is is valid
    def is_valid(dataDict):
        if 'name' not in dataDict:
            return False

        # check if all fields are filled correctly
        if not dataDict['name']:
            return False
        
        return True

