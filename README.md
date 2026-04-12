# CharDnD 🐉
A full-stack **Dungeons & Dragons 5th Edition** character creator and manager. Built with a Flask backend and a React + TypeScript frontend.

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-RESTful-green?logo=flask)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-lightgrey)

## ✨ Features
### 🛠️ Current
- **Character Management:** Full CRUD operations with robust input validation (Ability scores: `1–30`, Levels: `1–20`)
- **Multiclassing Support:** Seamlessly track multiple classes per character
- **Inventory System:** Add, manage, and organize equipment & item packs
- **Comprehensive Data Models:** Pre-loaded support for Species, Classes, Items, Features, and Proficiencies
- **Modern Architecture:** Service-layer pattern, consistent error handling, and full type safety

### 🚀 Planned
- 🎲 Integrated dice roller with result history
- ✨ Spell tracking & spell slot management
- 📈 XP tracking & automated character leveling
- 📜 Background system integration
- 📊 Character sheet PDF export

## 🛠️ Tech Stack
| Backend | Frontend |
|---------|----------|
| Python 3.8+ | React 18 |
| Flask (REST API) | TypeScript |
| SQLAlchemy (ORM) | Vite |
| SQLite | React Router |

## 📁 Project Structure
```
CharDnD/
├── Backend/
│   ├── models/          # SQLAlchemy database models
│   ├── services/        # Business logic layer
│   ├── Databases/       # SQLite database files
│   ├── config.py        # Configuration management
│   └── constants.py     # Constants & enums
├── chardnd-app/         # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── features/    # Feature modules
│   │   ├── services/    # API client
│   │   └── types/       # TypeScript interfaces
├── populate/            # Database seeding scripts
├── App.py               # Flask application entry point
└── requirements.txt     # Python dependencies
```

## 🚀 Getting Started
### 📋 Prerequisites
- Python `3.8+`
- Node.js `18+` & `npm`
- Git

### 🔙 Backend Setup
```bash
# 1. Clone & navigate
git clone <your-repo-url>
cd CharDnD

# 2. Create & activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env  # Edit .env with your settings

# 5. Start the Flask server
python App.py
```
🔗 Backend runs on: `http://localhost:8001`

### 🎨 Frontend Setup
```bash
# 1. Navigate to frontend directory
cd chardnd-app

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
🔗 Frontend runs on: `http://localhost:5173`

### 🗄️ Database Population
Seed the database with D&D 5e reference data:
```bash
python populate/populate_speciesDB.py
python populate/populate_classesDB.py
python populate/populate_itemDB.py
# Run additional population scripts as needed
```

## 🌐 API Endpoints
All endpoints return JSON responses following a consistent structure:  
`{ "success": boolean, "data": ..., "error": ... }`

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Characters** | `POST` | `/API/characters/creator` | Create a new character |
| | `GET` | `/API/characters` | List all characters |
| | `GET` | `/API/characters/<id>` | Get character details |
| | `DELETE` | `/API/characters/<id>` | Delete a character |
| | `POST` | `/API/characters/<id>/items` | Add item to inventory |
| **Species** | `POST` | `/API/species/creator` | Create species entry |
| | `GET` | `/API/species` | List all species |
| | `GET` | `/API/species/<id>` | Get species details |
| | `DELETE` | `/API/species/<id>` | Delete species entry |
| **Classes** | `POST` | `/API/classes/creator` | Create class entry |
| | `GET` | `/API/classes` | List all classes |
| | `GET` | `/API/classes/<id>` | Get class details |
| | `DELETE` | `/API/classes/<id>` | Delete class entry |
| **Items** | `POST` | `/API/items/creator` | Create item entry |
| | `GET` | `/API/items` | List all items |
| | `GET` | `/API/items/<id>` | Get item details |
| | `DELETE` | `/API/items/<id>` | Delete item entry |

## 🏗️ Architecture & Development Notes
- **Service Layer Pattern:** Business logic is strictly separated from route handlers for better testability and maintainability.
- **Consistent Error Handling:** All services return standardized responses with explicit success/error states.
- **Type Safety:** Enforced via Python type hints and TypeScript interfaces.
- **Cross-Platform Compatibility:** File paths use `os.path.join` to ensure Windows/macOS/Linux compatibility.
- **Best Practices Applied:**
  - Input validation & sanitization
  - Proper HTTP status codes
  - Environment-based configuration
  - Comprehensive docstrings
  - Transaction rollback & error handling
  - Environment-specific CORS configuration

## 🤝 Contributing
This is primarily a personal learning project designed to explore modern full-stack development and OOP principles. Contributions, feedback, and pull requests are welcome! Please open an issue before submitting major changes.

## 📜 License
© 2024-2026 CharDnD. All rights reserved.  
*This project is for personal/educational use and is not affiliated with or endorsed by Wizards of the Coast or D&D Beyond.*