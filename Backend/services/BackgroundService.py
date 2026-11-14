from Backend.models import Background
from .BaseModelService import BaseModelService


class BackgroundService(BaseModelService):
    model = Background

    @classmethod
    def get_byID(cls, bg_id):
        return cls.get_by_id(bg_id)

    @classmethod
    def get_by_name(cls, name):
        return cls.get_by_field("name", name)
