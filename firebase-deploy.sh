#!/bin/bash

echo "🔥 Firebase Hosting Deployment Preparation"
echo "========================================"

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Your files are ready in the 'dist' folder:"
    ls -la dist/
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Go to https://console.firebase.google.com"
    echo "2. Create a new project called 'quantum-flashcards'"
    echo "3. Enable Hosting"
    echo "4. Upload all contents from the 'dist' folder"
    echo ""
    echo "📋 Files to upload:"
    echo "   - index.html"
    echo "   - assets/ (folder)"
    echo "   - vite.svg"
    echo "   - tauri.svg"
    echo ""
    echo "🌐 Your site will be live at: https://quantum-flashcards.web.app"
echo ""
echo "🎯 Want a custom domain? (Remove .web.app)"
echo "   See CUSTOM_DOMAIN_SETUP.md for instructions"
echo "   Options:"
echo "   - Purchase domain (e.g., quantumflashcards.com)"
echo "   - Use Firebase subdomain (quantum-flashcards.firebaseapp.com)"
echo ""
echo "📖 See FIREBASE_DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi 