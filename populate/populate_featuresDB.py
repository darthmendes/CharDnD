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
    )
]

def add_features():
    session.add_all(features)
    session.commit()