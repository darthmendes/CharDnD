from Backend.models import Background
from .BaseModelService import BaseModelService


class BackgroundService(BaseModelService):
    model = Background

    @classmethod
    def _serialize(cls, background):
        data = super()._serialize(background)
        fixed_skills = set()
        fixed_tools = set()
        fixed_languages = set()
        tool_choices = {}
        equipment_choices = {}
        starting_equipment = []
        language_choices = 0

        for association in background.proficiencies:
            proficiency = association.proficiency
            if proficiency is None:
                continue

            if association.isChoice:
                if proficiency.type == "language":
                    language_choices = max(
                        language_choices,
                        association.choiceNumber or 0,
                    )
                elif proficiency.type == "tool" and association.choiceGroup:
                    choice = tool_choices.setdefault(
                        association.choiceGroup,
                        {
                            "group": association.choiceGroup,
                            "count": association.choiceNumber or 1,
                            "options": set(),
                        },
                    )
                    choice["options"].add(proficiency.name)
            elif proficiency.type == "skill":
                fixed_skills.add(proficiency.name)
            elif proficiency.type == "tool":
                fixed_tools.add(proficiency.name)
            elif proficiency.type == "language":
                fixed_languages.add(proficiency.name)

        for association in background.equipment:
            item = association.item
            if item is None:
                continue
            item_data = {
                "id": item.id,
                "name": item.name,
                "quantity": association.quantity,
            }
            if not association.isChoice:
                starting_equipment.append(item_data)
                continue

            choice = equipment_choices.setdefault(
                association.choiceGroup,
                {
                    "group": association.choiceGroup,
                    "count": association.choiceNum or 1,
                    "options": [],
                },
            )
            choice["options"].append(item_data)

        details = background.details
        tool_choice_groups = set(tool_choices)
        data.update({
            "skill_proficiencies": sorted(fixed_skills),
            "tool_proficiencies": sorted(fixed_tools),
            "tool_proficiency_choices": [
                {
                    "group": choice["group"],
                    "count": choice["count"],
                    "options": sorted(choice["options"]),
                }
                for choice in sorted(
                    tool_choices.values(),
                    key=lambda choice: choice["group"],
                )
            ],
            "languages": sorted(fixed_languages),
            "language_choices": language_choices,
            "starting_equipment": sorted(
                starting_equipment,
                key=lambda item: item["name"],
            ),
            "equipment_choices": [
                {
                    "group": choice["group"],
                    "count": choice["count"],
                    "options": sorted(
                        choice["options"],
                        key=lambda item: item["name"],
                    ),
                }
                for choice in sorted(
                    equipment_choices.values(),
                    key=lambda choice: choice["group"],
                )
            ],
            "equipment_tool_choice_groups": sorted(
                set(equipment_choices) & tool_choice_groups
            ),
            "feature_name": details.featureName if details else None,
            "feature_description": details.featureDescription if details else None,
            "starting_gold": details.startingGold if details else None,
        })
        return data

    @classmethod
    def get_byID(cls, bg_id):
        return cls.get_by_id(bg_id)

    @classmethod
    def get_by_name(cls, name):
        return cls.get_by_field("name", name)
