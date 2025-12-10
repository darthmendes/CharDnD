"""
Application configuration module.
Loads settings from environment variables with sensible defaults.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Flask Configuration
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
FLASK_PORT = int(os.getenv('FLASK_PORT', '8001'))

# Database Configuration
DATABASE_PATH = os.getenv('DATABASE_PATH', 'Backend/Databases')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'AppDB.sqlite')

# Security
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# CORS Configuration
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

# API Configuration
API_PREFIX = os.getenv('API_PREFIX', '/API')

# Validation
if FLASK_ENV == 'production' and SECRET_KEY == 'dev-secret-key-change-in-production':
    raise ValueError("SECRET_KEY must be set in production environment!")
