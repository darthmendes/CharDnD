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
    ),
    Language(
        name='Druidic',
        desc="You know Druidic, the secret language of druids. You can speak the language and use it to leave hidden messages. You and others who know this language automatically spot such a message. "
             "Others spot the message's presence with a successful DC 15 Wisdom (Perception) check but can't decipher it without magic."
    )
]

def add_languages():
    session.add_all(languages)
    session.commit()