# Backend/services/LanguageService.py

from typing import List
from ..models.languages import Language
from ..models import session

class LanguageService:
    @classmethod
    def get_all_languages(cls) -> List[Language]:
        """Get all available languages."""
        return session.query(Language).all()