# This file is deprecated - use Backend/config.py instead
# Kept for backward compatibility
import os

DATABASES_PATH = os.getenv('DATABASE_PATH', 'Backend/Databases')
