from Backend.models import session, Background

class BackgroundService:
    @staticmethod
    def get_all():
        """Get all backgrounds"""
        try:
            backgrounds = session.query(Background).all()
            return {
                "success": True,
                "data": [bg.to_dict() for bg in backgrounds]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def get_by_id(bg_id):
        """Get a background by ID"""
        try:
            background = session.query(Background).filter_by(id=bg_id).first()
            if not background:
                return {
                    "success": False,
                    "error": "Background not found"
                }
            return {
                "success": True,
                "data": background.to_dict()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def get_by_name(name):
        """Get a background by name"""
        try:
            background = session.query(Background).filter_by(name=name).first()
            if not background:
                return {
                    "success": False,
                    "error": "Background not found"
                }
            return {
                "success": True,
                "data": background.to_dict()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
