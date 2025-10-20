#!/bin/bash
# React + Vite Setup Script for AI Event Bot

PROJECT_NAME="ai-event-bot-react"
CURRENT_DIR="/Users/yaswanth/Developer/innobotFresh"

echo "🚀 AI Event Bot - React + Vite Migration"
echo "========================================"

# Check if node and npm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Create new React + Vite project
echo ""
echo "📦 Creating React + Vite project..."
cd "$CURRENT_DIR"

# Create Vite project
npm create vite@latest $PROJECT_NAME -- --template react

if [ $? -eq 0 ]; then
    echo "✅ React + Vite project created successfully!"
    
    cd $PROJECT_NAME
    
    echo ""
    echo "📚 Installing dependencies..."
    npm install
    
    # Install additional useful dependencies
    echo ""
    echo "🔧 Installing additional packages..."
    npm install \
        axios \
        date-fns \
        lucide-react \
        @headlessui/react \
        clsx \
        tailwindcss \
        autoprefixer \
        postcss
    
    # Install dev dependencies
    npm install -D \
        @types/react \
        @types/react-dom \
        eslint-plugin-react-hooks \
        prettier
    
    echo ""
    echo "🎨 Setting up Tailwind CSS..."
    npx tailwindcss init -p
    
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. cd $PROJECT_NAME"
    echo "   2. npm run dev"
    echo "   3. Open http://localhost:5173"
    echo ""
    echo "📁 Project created at: $CURRENT_DIR/$PROJECT_NAME"
    
else
    echo "❌ Failed to create React project"
    exit 1
fi