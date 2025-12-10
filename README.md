# CharDnD

A full-stack D&D 5e Character Creator and Manager with Flask backend and React frontend.

## Features

### Character Management
- **CRUD Operations**: Create, Read, Update, Delete character sheets
- **Validation**: Input validation for ability scores (1-30), levels (1-20), and required fields
- **Multiclassing Support**: Track multiple classes per character
- **Inventory System**: Add items and equipment packs to characters

### Data Models
- **Species**: Races with ability bonuses, traits, proficiencies, and languages
- **Classes**: D&D classes with features, equipment, and hit dice
- **Items**: Weapons, armor, and equipment with properties and rarity
- **Features**: Character abilities and traits with level-based progression
- **Proficiencies**: Skills, tools, armor, and weapon proficiencies

### Planned Features
- Spell tracking and spell slot management
- Dice roller with results display
- Character leveling and XP tracking
- Background system integration

## Tech Stack

### Backend
- **Flask**: RESTful API framework
- **SQLAlchemy**: ORM for database management
- **SQLite**: Database storage
- **Python 3.8+**: Core language

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **React Router**: Navigation

## Project Structure

```
CharDnD/
├── Backend/
│   ├── models/          # SQLAlchemy database models
│   ├── services/        # Business logic layer
│   ├── Databases/       # SQLite database files
│   ├── config.py        # Configuration management
│   └── constants.py     # Constants and enums
├── chardnd-app/         # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── features/    # Feature modules
│   │   ├── services/    # API client
│   │   └── types/       # TypeScript types
├── populate/            # Database population scripts
├── App.py              # Flask application entry point
└── requirements.txt    # Python dependencies
```

## Setup Instructions

### Backend Setup

1. **Clone the repository**
   ```bash
   cd CharDnD
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run the Flask server**
   ```bash
   python App.py
   ```
   Server runs on `http://localhost:8001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd chardnd-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Database Population

Populate the database with D&D 5e data:
```bash
python populate/populate_speciesDB.py
python populate/populate_classesDB.py
python populate/populate_itemDB.py
# ... run other populate scripts as needed
```

## API Endpoints

### Characters
- `POST /API/characters/creator` - Create character
- `GET /API/characters` - List all characters
- `GET /API/characters/<id>` - Get character details
- `DELETE /API/characters/<id>` - Delete character
- `POST /API/characters/<id>/items` - Add item to inventory

### Species
- `POST /API/species/creator` - Create species
- `GET /API/species` - List all species
- `GET /API/species/<id>` - Get species details
- `DELETE /API/species/<id>` - Delete species

### Classes
- `POST /API/classes/creator` - Create class
- `GET /API/classes` - List all classes
- `GET /API/classes/<id>` - Get class details
- `DELETE /API/classes/<id>` - Delete class

### Items
- `POST /API/items/creator` - Create item
- `GET /API/items` - List all items
- `GET /API/items/<id>` - Get item details
- `DELETE /API/items/<id>` - Delete item

## Development Notes

### Architecture
- **Service Layer Pattern**: Business logic separated from routes
- **Consistent Error Handling**: All services return `{success: bool, data/error: ...}`
- **Type Safety**: Python type hints and TypeScript interfaces
- **Cross-Platform**: Uses `os.path.join` for file paths

### Best Practices Applied
- Input validation and sanitization
- Proper HTTP status codes
- Environment-based configuration
- Comprehensive docstrings
- Error handling and rollback
- CORS configuration per environment

## Contributing

This is a personal learning project following OOP principles and modern web development practices.

## License

Personal project - All rights reserved

