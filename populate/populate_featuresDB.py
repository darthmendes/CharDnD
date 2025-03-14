from Backend.models.features import Features
from Backend.models import session

# Create features for Dwarf
features = [
    Features(
        name="Darkvision",
        desc="You can see in dim light within 60 feet as bright light, and in darkness as dim light. You can't discern color in darkness."
    ),
    Features(
        name="Dwarven Resilience",
        desc="Advantage on saving throws against poison and resistance to poison damage."
    ),
    Features(
        name="Stonecunning",
        desc="Double proficiency bonus on Intelligence (History) checks related to stonework."
    ),
    Features(
        name="Ability Score Improvement",
        desc="When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. "
            "As normal, you can't increase an ability score above 20 using this feature.",
        properties={
            "n_choices":1,
            "from":"ability_scores",
            "options":[
                {"choose":2,
                 "value":1},
                 {"choose":1,
                  "value":2}
            ]
        }
        
    )
]

def add_features():
    session.add_all(features)
    session.commit()