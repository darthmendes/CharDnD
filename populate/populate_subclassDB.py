"""
populate_subclassesDB.py
Populates Subclasses, Features, and ClassFeatures for all DnD classes.
Safe to run multiple times. Uses existing session & models.
"""
from Backend.models import session
from Backend.models.dndclass import DnDclass, Subclass, ClassFeatures
from Backend.models.features import Features

def get_or_create_feature(name: str, desc: str, properties: dict = None):
    """Fetches existing feature or creates it. Prevents duplicates."""
    feat = session.query(Features).filter_by(name=name).first()
    if not feat:
        feat = Features(name=name, desc=desc, properties=properties or {})
        session.add(feat)
        session.flush()
    return feat

def create_subclass_and_link_features(class_name: str, sub_name: str, flavor: str, features_data: list):
    """
    Creates a Subclass and links its features via ClassFeatures.
    features_data: List of tuples (feature_name, description, level, properties_dict)
    """
    parent = session.query(DnDclass).filter_by(name=class_name).first()
    if not parent:
        print(f"[WARNING] Class '{class_name}' not found in DB. Run populate_classesDB.py first.")
        return False

    # Check if subclass already exists
    subclass = session.query(Subclass).filter_by(classID=parent.id, name=sub_name).first()
    if not subclass:
        subclass = Subclass(classID=parent.id, name=sub_name, subclass_flavor=flavor)
        session.add(subclass)
        session.flush()
        print(f"  [CREATED] Subclass: {sub_name} ({flavor})")

    # Link features
    for fname, fdesc, level in features_data:
        feature = get_or_create_feature(fname, fdesc)
        
        # Prevent duplicate ClassFeatures links
        exists = session.query(ClassFeatures).filter_by(
            classID=parent.id, subclassID=subclass.id, featureID=feature.id, level=level
        ).first()
        if not exists:
            session.add(ClassFeatures(
                classID=parent.id, subclassID=subclass.id, featureID=feature.id, level=level
            ))
    return True

def populate_subclasses():
    print("[INFO] Starting Subclass Population...")
    try:
        # === CLERIC (Divine Domains) ===
        create_subclass_and_link_features("Cleric", "Life Domain", "Divine Domain", [
            ("Domain Spells", "Gain always-prepared domain spells at specific levels.", 1),
            ("Bonus Proficiency", "Gain proficiency with heavy armor.", 1),
            ("Disciple of Life", "Healing spells restore 2 + spell level extra HP.", 1),
            ("Channel Divinity: Preserve Life", "Restore 5×cleric level HP divided among creatures in 30ft.", 2),
            ("Blessed Healer", "Healing others restores 2 + spell level HP to you.", 6),
            ("Divine Strike", "Weapon attacks deal +1d8 radiant damage (2d8 at 14th).", 8),
            ("Supreme Healing", "Healing dice always roll maximum value.", 17)
        ])
        create_subclass_and_link_features("Cleric", "Light Domain", "Divine Domain", [
            ("Domain Spells", "Gain light-themed domain spells.", 1),
            ("Bonus Cantrip", "Learn the light cantrip if you don't know it.", 1),
            ("Warding Flare", "Impose disadvantage on attacks against you within 30ft (WIS mod times/long rest).", 1),
            ("Channel Divinity: Radiance of the Dawn", "Dispel darkness and deal 2d10 + level radiant damage in 30ft.", 2),
            ("Improved Flare", "Use Warding Flare to protect allies within 30ft.", 6),
            ("Potent Spellcasting", "Add WIS modifier to cleric cantrip damage.", 8),
            ("Corona of Light", "Emit 60ft bright light aura; enemies have disadvantage vs fire/radiant saves.", 17)
        ])

        # === FIGHTER (Martial Archetypes) ===
        create_subclass_and_link_features("Fighter", "Champion", "Martial Archetype", [
            ("Improved Critical", "Score crits on 19-20.", 3),
            ("Remarkable Athlete", "Add half prof bonus to STR/DEX/CON checks without prof; jump distance increases.", 7),
            ("Additional Fighting Style", "Learn a second fighting style.", 10),
            ("Superior Critical", "Score crits on 18-20.", 15),
            ("Survivor", "Regain 5 + CON mod HP at start of turn if below half max HP.", 18)
        ])
        create_subclass_and_link_features("Fighter", "Battle Master", "Martial Archetype", [
            ("Combat Superiority", "Learn maneuvers & gain 4d8 superiority dice.", 3),
            ("Student of War", "Gain proficiency with one artisan's tool.", 3),
            ("Know Your Enemy", "Study a creature for 1 min to learn comparative stats.", 7),
            ("Improved Combat Superiority", "Superiority dice become d10s (d12s at 18th).", 10),
            ("Relentless", "Regain 1 superiority die when rolling initiative if none remain.", 15)
        ])

        # === WIZARD (Arcane Traditions) ===
        create_subclass_and_link_features("Wizard", "School of Evocation", "Arcane Tradition", [
            ("Evocation Savant", "Halve gold/time to copy evocation spells.", 2),
            ("Sculpt Spells", "Protect 1+spell level creatures from your evocation spells.", 2),
            ("Potent Cantrip", "Cantrips deal half damage on successful saves.", 6),
            ("Empowered Evocation", "Add INT mod to one damage roll of evocation spells.", 10),
            ("Overchannel", "Maximize damage of 1st-5th level evocation spells (risk necrotic backlash).", 14)
        ])
        create_subclass_and_link_features("Wizard", "School of Abjuration", "Arcane Tradition", [
            ("Abjuration Savant", "Halve gold/time to copy abjuration spells.", 2),
            ("Arcane Ward", "Create magical ward with HP = 2×level + INT mod; absorbs damage.", 2),
            ("Projected Ward", "Use reaction to transfer damage to your Arcane Ward.", 6),
            ("Improved Abjuration", "Add prof bonus to abjuration ability checks (Counterspell/Dispel).", 10),
            ("Spell Resistance", "Advantage on saves vs spells; resistance to spell damage.", 14)
        ])

        # === ROGUE (Roguish Archetypes) ===
        create_subclass_and_link_features("Rogue", "Thief", "Roguish Archetype", [
            ("Fast Hands", "Use Cunning Action for Sleight of Hand, tools, or Use an Object.", 3),
            ("Second-Story Work", "Climbing costs no extra movement; jump distance increases.", 3),
            ("Supreme Sneak", "Advantage on Stealth if moving ≤ half speed.", 9),
            ("Use Magic Device", "Ignore class/race/level requirements on magic items.", 13),
            ("Thief's Reflexes", "Take two turns in round 1 of combat.", 17)
        ])
        create_subclass_and_link_features("Rogue", "Assassin", "Roguish Archetype", [
            ("Bonus Proficiencies", "Gain disguise kit & poisoner's kit proficiency.", 3),
            ("Assassinate", "Advantage vs creatures who haven't acted; auto-crit on surprised targets.", 3),
            ("Infiltration Expertise", "Create flawless false identities (7 days, 25gp).", 9),
            ("Impostor", "Perfectly mimic speech/writing/mannerisms after 3hrs study.", 13),
            ("Death Strike", "Surprised targets must save vs CON or double attack damage.", 17)
        ])

        # === SORCERER (Sorcerous Origins) ===
        create_subclass_and_link_features("Sorcerer", "Draconic Bloodline", "Sorcerous Origin", [
            ("Dragon Ancestor", "Choose dragon type; speak/read Draconic; double prof vs dragons.", 1),
            ("Draconic Resilience", "+1 HP per sorcerer level; AC = 13 + DEX without armor.", 1),
            ("Elemental Affinity", "Add CHA mod to damage of dragon type; spend 1 SP for resistance.", 6),
            ("Dragon Wings", "Grow wings for flying speed = current speed.", 14),
            ("Draconic Presence", "Spend 5 SP for 60ft aura of awe/fear (WIS save).", 18)
        ])
        create_subclass_and_link_features("Sorcerer", "Wild Magic", "Sorcerous Origin", [
            ("Wild Magic Surge", "Roll d20 after casting 1st+ spell; roll 1 = surge table.", 1),
            ("Tides of Chaos", "Gain advantage on one roll; DM can trigger surge to regain use.", 1),
            ("Bend Luck", "Spend 2 SP to roll 1d4 & add/subtract from creature's roll as reaction.", 6),
            ("Controlled Chaos", "Roll twice on Wild Magic table & choose.", 14),
            ("Spell Bombardment", "Reroll max damage dice once per turn.", 18)
        ])

        # === WARLOCK (Otherworldly Patrons) ===
        create_subclass_and_link_features("Warlock", "The Fiend", "Otherworldly Patron", [
            ("Expanded Spell List", "Access expanded fire/darkness spells.", 1),
            ("Dark One's Blessing", "Gain temp HP = CHA mod + level when reducing foe to 0 HP.", 1),
            ("Dark One's Own Luck", "Add d10 to check/save after rolling (1/short rest).", 6),
            ("Fiendish Resilience", "Choose damage type to resist after short/long rest.", 10),
            ("Hurl Through Hell", "Banish target to lower planes for 1 round (10d10 psychic dmg).", 14)
        ])
        create_subclass_and_link_features("Warlock", "The Great Old One", "Otherworldly Patron", [
            ("Expanded Spell List", "Access expanded mind-control/divination spells.", 1),
            ("Awakened Mind", "Telepathically speak to creatures within 30ft.", 1),
            ("Entropic Ward", "Impose disadvantage on attack vs you; if miss, advantage on next attack (1/short rest).", 6),
            ("Thought Shield", "Immune to telepathy; resistance to psychic; reflect psychic damage.", 10),
            ("Create Thrall", "Charm incapacitated humanoid permanently.", 14)
        ])

        # === PALADIN (Sacred Oaths) ===
        create_subclass_and_link_features("Paladin", "Oath of Devotion", "Sacred Oath", [
            ("Oath Spells", "Gain always-prepared devotion spells.", 3),
            ("Channel Divinity: Sacred Weapon", "Add CHA mod to attack rolls for 1 min; weapon emits light.", 3),
            ("Channel Divinity: Turn the Unholy", "Turn fiends/undead within 30ft.", 3),
            ("Aura of Devotion", "You & allies in 10ft can't be charmed.", 7),
            ("Purity of Spirit", "Always under protection from evil and good.", 15),
            ("Holy Nimbus", "Emit 30ft bright light; enemies start turn in it take 10 radiant dmg.", 20)
        ])

        # === BARBARIAN (Primal Paths) ===
        create_subclass_and_link_features("Barbarian", "Path of the Berserker", "Primal Path", [
            ("Frenzy", "Make bonus action melee attack while raging; gain exhaustion when rage ends.", 3),
            ("Mindless Rage", "Can't be charmed/frightened while raging.", 6),
            ("Intimidating Presence", "Frighten creature in 30ft as action (WIS save).", 10),
            ("Retaliation", "Use reaction to melee attack creature that damages you within 5ft.", 14)
        ])
        create_subclass_and_link_features("Barbarian", "Path of the Totem Warrior", "Primal Path", [
            ("Spirit Seeker", "Ritual cast beast sense/commune with nature; choose totem.", 3),
            ("Aspect of the Beast", "Gain totem benefit (Bear/Eagle/Wolf) while raging.", 6),
            ("Spirit Walker", "Cast commune with nature once/long rest without components.", 10),
            ("Totemic Attunement", "Gain enhanced totem benefit while raging.", 14)
        ])

        # === RANGER (Ranger Archetypes) ===
        create_subclass_and_link_features("Ranger", "Hunter", "Ranger Archetype", [
            ("Hunter's Prey", "Choose Colossus Slayer, Giant Killer, or Horde Breaker.", 3),
            ("Defensive Tactics", "Choose Escape the Horde, Multiattack Defense, or Steel Will.", 7),
            ("Multiattack", "Choose Volley or Whirlwind Attack.", 11),
            ("Superior Hunter's Defense", "Choose Evasion, Stand Against the Tide, or Uncanny Dodge.", 15)
        ])
        create_subclass_and_link_features("Ranger", "Beast Master", "Ranger Archetype", [
            ("Ranger's Companion", "Gain CR≤1/4 beast companion; add prof to its stats.", 3),
            ("Exceptional Training", "Command beast to Dash/Disengage/Dodge/Help as bonus action.", 7),
            ("Bestial Fury", "Companion makes two attacks when commanded to Attack.", 11),
            ("Share Spells", "Self-targeting spells also affect companion within 30ft.", 15)
        ])

        # === BARD (Bard Colleges) ===
        create_subclass_and_link_features("Bard", "College of Lore", "Bard College", [
            ("Bonus Proficiencies", "Gain proficiency with 3 skills.", 3),
            ("Cutting Words", "Use reaction & Bardic Inspiration to subtract from enemy's roll.", 3),
            ("Additional Magical Secrets", "Learn 2 spells from any class.", 6),
            ("Peerless Skill", "Add Bardic Inspiration to your own ability check after rolling.", 14)
        ])
        create_subclass_and_link_features("Bard", "College of Valor", "Bard College", [
            ("Bonus Proficiencies", "Gain medium armor, shields, martial weapons.", 3),
            ("Combat Inspiration", "Ally can add Inspiration die to damage or AC.", 3),
            ("Extra Attack", "Attack twice when taking Attack action.", 6),
            ("Battle Magic", "Cast bard spell & make one weapon attack as bonus action.", 14)
        ])

        # === DRUID (Druid Circles) ===
        create_subclass_and_link_features("Druid", "Circle of the Moon", "Druid Circle", [
            ("Combat Wild Shape", "Wild Shape as bonus action; spend slot to heal 1d8/level.", 2),
            ("Circle Forms", "Transform into CR 1 beast (CR = level/3 at 6th).", 2),
            ("Primal Strike", "Beast form attacks count as magical.", 6),
            ("Elemental Wild Shape", "Spend 2 uses to become elemental.", 10),
            ("Thousand Forms", "Cast alter self at will.", 14)
        ])
        create_subclass_and_link_features("Druid", "Circle of the Land", "Druid Circle", [
            ("Bonus Cantrip", "Learn one extra druid cantrip.", 2),
            ("Natural Recovery", "Recover spell slots = half level (rounded up) during short rest.", 2),
            ("Circle Spells", "Gain bonus prepared spells based on chosen terrain.", 3),
            ("Land's Stride", "Ignore difficult terrain & plant hazards.", 6),
            ("Nature's Ward", "Immune to poison/disease; can't be charmed/frightened by fey/elementals.", 10),
            ("Nature's Sanctuary", "Creatures have disadvantage on attacks vs you if you haven't acted.", 14)
        ])

        # === ARTIFICER (Artificer Specialists) ===
        create_subclass_and_link_features("Artificer", "Alchemist", "Artificer Specialist", [
            ("Alchemist Spells", "Always have alchemy-themed spells prepared.", 3),
            ("Experimental Elixir", "Create random healing/utility elixir after long rest.", 3),
            ("Alchemical Savant", "Add INT mod to acid/fire/necrotic/poison spell damage.", 5),
            ("Restorative Reagents", "Elixirs grant temp HP.", 9),
            ("Chemical Mastery", "Advantage vs poison; resistance to poison damage.", 15)
        ])
        create_subclass_and_link_features("Artificer", "Artillerist", "Artificer Specialist", [
            ("Artillerist Spells", "Always have blasting/control spells prepared.", 3),
            ("Eldritch Cannon", "Create magical cannon with Force Ballista/Flamethrower/Protector modes.", 3),
            ("Eldritch Cannon Modifier", "Add INT mod to cannon damage.", 5),
            ("Explosive Cannon", "+1d8 force damage on hit; destroys cannon in 10ft blast.", 9),
            ("Fortified Position", "Half cover in 10ft; create Large cannon.", 15)
        ])

        session.commit()
        print("[SUCCESS] Subclasses, Features, and ClassFeatures populated successfully!")
    except Exception as e:
        session.rollback()
        print(f"[ERROR] Failed to populate subclasses: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    populate_subclasses()