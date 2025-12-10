#!/bin/bash

# CharDnD Setup Script
# This script helps set up the development environment

echo "================================"
echo "CharDnD Setup Script"
echo "================================"
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Found Python $python_version"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
echo ""
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo ""
    echo "ℹ️  .env file already exists, skipping..."
fi

# Create databases directory if it doesn't exist
echo ""
echo "Creating databases directory..."
mkdir -p Backend/Databases

# Frontend setup
echo ""
echo "================================"
echo "Frontend Setup"
echo "================================"
echo ""

if [ -d "chardnd-app" ]; then
    echo "Setting up frontend..."
    cd chardnd-app
    
    # Check if node is installed
    if command -v node &> /dev/null; then
        echo "Node.js version: $(node --version)"
        echo "npm version: $(npm --version)"
        echo ""
        echo "Installing frontend dependencies..."
        npm install
        echo "✅ Frontend dependencies installed"
    else
        echo "⚠️  Node.js not found. Please install Node.js to set up the frontend."
        echo "   Visit: https://nodejs.org/"
    fi
    
    cd ..
fi

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Update your .env file with your configuration"
echo "2. Run the database population scripts if needed:"
echo "   python populate/populate_speciesDB.py"
echo "   python populate/populate_classesDB.py"
echo "   python populate/populate_itemDB.py"
echo ""
echo "3. Start the backend server:"
echo "   python App.py"
echo ""
echo "4. In a new terminal, start the frontend:"
echo "   cd chardnd-app"
echo "   npm run dev"
echo ""
echo "Happy coding! 🎲"
