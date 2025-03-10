from Backend.models.languages import Language
from Backend.models import session

languages = [
    Language(
        name="Common",
        desc=""
    ),
    Language(
        name="Dwarvish",
        desc=""
    ),
    Language(
        name="Elvish",
        desc=""
    ),
    Language(
        name="Giant",
        desc=""
    ),
    Language(
        name="Gnomish",
        desc=""
    ),
    Language(
        name="Goblin",
        desc=""
    ),
    Language(
        name="Halfling",
        desc=""
    ),
    Language(
        name="Orc",
        desc=""
    ),
    Language(
        name="Abyssal",
        desc=""
    ),
    Language(
        name="Celestial",
        desc=""
    ),
    Language(
        name="Draconic",
        desc=""
    ),
    Language(
        name="Deep Speech",
        desc=""
    ),
    Language(
        name="Infernal",
        desc=""
    ),
    Language(
        name="Primordial",
        desc=""
    ),
    Language(
        name="Sylvan",
        desc=""
    ),
    Language(
        name="Undercommon",
        desc=""
    )
]

def add_languages():
    session.add_all(languages)
    session.commit()