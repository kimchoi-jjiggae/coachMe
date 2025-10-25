#!/bin/bash

# Voice Journal Setup Script
echo "🚀 Setting up Voice Journal with secure OpenAI integration..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo ""
    echo "⚠️  OpenAI API key not found in environment variables."
    echo "   To use AI title generation, set your OpenAI API key:"
    echo ""
    echo "   export OPENAI_API_KEY='your_openai_api_key_here'"
    echo ""
    echo "   Or create a .env file with:"
    echo "   OPENAI_API_KEY=your_openai_api_key_here"
    echo ""
    echo "   Get your API key from: https://platform.openai.com/api-keys"
    echo ""
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "   npm start"
echo ""
echo "To start with your API key:"
echo "   OPENAI_API_KEY=your_key_here npm start"
echo ""
echo "The app will be available at: http://localhost:3003"
echo ""
