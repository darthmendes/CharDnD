from Backend.models import Proficiency, session


class LanguageService:
    @classmethod
    def get_all(cls):
        return (
            session.query(Proficiency)
            .filter_by(type="language")
            .order_by(Proficiency.name)
            .all()
        )
