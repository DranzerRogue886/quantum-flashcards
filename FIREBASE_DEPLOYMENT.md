# Firebase Hosting Deployment Guide

## 🚀 Deploy Quantum Flashcards to Firebase Hosting

### Step 1: Create Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter project name: `quantum-flashcards`
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Hosting
1. In your Firebase project console, click "Hosting" in the left sidebar
2. Click "Get started"
3. Choose "Don't set up a custom domain" for now
4. Click "Next"

### Step 3: Build Your Project
```bash
npm run build
```

### Step 4: Deploy Using Firebase Console
1. In Firebase Hosting, click "Add app" or "Add another app"
2. Choose "Web app" (</>)
3. Register app with nickname: `quantum-flashcards-web`
4. Click "Register app"
5. In the hosting section, click "Upload files"
6. Upload all contents from your `dist` folder:
   - `index.html`
   - `assets/` folder
   - `vite.svg`
   - `tauri.svg`

### Step 5: Get Your Live URL
After upload, Firebase will provide you with a URL like:
`https://quantum-flashcards.web.app`

### Alternative: Manual Upload
If you prefer to upload manually:
1. Go to Firebase Console → Hosting
2. Click "Add app" → Web app
3. Register your app
4. Click "Upload files"
5. Drag and drop your entire `dist` folder contents

### Custom Domain (Optional)
1. In Firebase Hosting, click "Add custom domain"
2. Enter your domain name
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (can take up to 24 hours)

### Automatic Deployments (Future)
Once you have Firebase CLI working with Node.js 20+:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🎉 Your site will be live at:
`https://quantum-flashcards.web.app`

## 📝 Notes:
- Firebase Hosting is free for up to 10GB storage and 360MB/day transfer
- Your site will have SSL by default
- You can set up custom domains later
- Firebase provides excellent performance and global CDN 