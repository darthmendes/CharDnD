from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

# Initialize database
DATABASE_FILE = "Databases/charactersDB.sqlite"
engine = create_engine('sqlite:///%s'%(DATABASE_FILE), echo=False, connect_args={'check_same_thread': False})

class Character(Base):

    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    race = Column(String, nullable=False)
    char_class = Column(String, nullable=False)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=300)
    hp = Column(Integer, default=8)
    tmp_hp = Column(Integer, default=0)
    hp_max = Column(Integer, default=8)
    
    ability_scores = Column(String, nullable=False)
    skills = Column(String)
    equipment = Column(String)
    notes = Column(String)

    def __repr__(self):
        return f"Character('{self.name}', '{self.race}', '{self.char_class}', '{self.level}'"

    # CRUD operations
    def new(name, race, char_class, level=1):
        new_char = Character(name=name, race=race, char_class=char_class, level=level)
        session.add(new_char)
        session.commit()
        return {"message": "Character created successfully", "id": new_char.id}

    def get(name):
        char = session.query(Character).filter_by(name=name).first()
        if char:
            return {"id": char.id, "name": char.name, "race": char.race, "class": char.char_class, "level": char.level}
        return None

    def update(name, **kwargs):
        char = session.query(Character).filter_by(name=name).first()
        if char:
            for key, value in kwargs.items():
                setattr(char, key, value)
            session.commit()
            return {"message": "Character updated successfully"}
        return {"error": "Character not found"}

    def delete(name):
        char = session.query(Character).filter_by(name=name).first()
        if char:
            session.delete(char)
            session.commit()
            return {"message": "Character deleted successfully"}
        return {"error": "Character not found"}


Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()
