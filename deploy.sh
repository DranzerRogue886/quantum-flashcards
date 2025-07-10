#!/bin/bash

echo "🚀 Quantum Flashcards Deployment Script"
echo "======================================"

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Your website is ready for deployment!"
    echo ""
    echo "📁 Your built files are in the 'dist' folder"
    echo ""
    echo "Deployment Options:"
    echo "1. Netlify Drop: Drag 'dist' folder to https://app.netlify.com/drop"
    echo "2. Vercel: Go to https://vercel.com and upload 'dist' folder"
    echo "3. Firebase: Go to https://firebase.google.com and enable hosting"
    echo "4. Any static hosting service that supports HTML/CSS/JS"
    echo ""
    echo "💡 The 'dist' folder contains everything needed for your website!"
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi 