# Quantum Flashcards

A modern, cross-platform flashcard application with a quantum-themed UI. Built with vanilla JavaScript and CSS, this application works seamlessly across desktop and mobile devices, with PWA support for offline usage.

## Features

- Progressive Web App (PWA) support for offline usage
- Cross-platform compatibility (Windows, macOS, Linux)
- Mobile-responsive design (iOS, Android)
- System-aware dark/light mode
- Quantum-themed animated background
- Local storage persistence
- Accessibility features
- Reduced motion support
- High DPI screen support

## Project Structure

```
NOTE-Card-2/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── src/
│   ├── css/           # Stylesheets
│   │   └── main.css
│   └── js/            # JavaScript files
│       ├── app.js
│       ├── components/
│       └── utils/
├── icons/             # PWA icons
└── README.md
```

## Features

- Create and manage flash cards
- Organize cards into piles (unstudied, wrong, almost, right, done)
- Dark/Light mode support
- Responsive design
- Animated background
- Local storage persistence
- Card flip animations
- Modern UI with hover effects

## Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quantum-flashcards.git
cd quantum-flashcards
```

2. Generate PWA icons (requires ImageMagick):
```bash
# On Ubuntu/Debian
sudo apt-get install imagemagick

# On macOS
brew install imagemagick

# Generate icons
convert icon.png -resize 72x72 icons/icon-72x72.png
convert icon.png -resize 96x96 icons/icon-96x96.png
convert icon.png -resize 128x128 icons/icon-128x128.png
convert icon.png -resize 144x144 icons/icon-144x144.png
convert icon.png -resize 152x152 icons/icon-152x152.png
convert icon.png -resize 192x192 icons/icon-192x192.png
convert icon.png -resize 384x384 icons/icon-384x384.png
convert icon.png -resize 512x512 icons/icon-512x512.png
```

3. Serve the files:
```bash
# Using Python (available on most systems)
python3 -m http.server 8000

# Or using Node.js
npx serve

# Or using PHP
php -S localhost:8000
```

4. Open your browser and navigate to `http://localhost:8000`

### Production Deployment

The application can be deployed to any static hosting service:

1. **GitHub Pages**:
   - Push to a GitHub repository
   - Enable GitHub Pages in repository settings
   - Site will be available at `https://username.github.io/repo-name`

2. **Netlify**:
   - Connect your GitHub repository
   - Configure build settings (not required for static sites)
   - Deploy

3. **Vercel**:
   - Import your GitHub repository
   - Configure project settings
   - Deploy

4. **Firebase Hosting**:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Opera 76+
- iOS Safari 14+
- Android Chrome 90+

## Development

### Prerequisites

- Any modern web browser
- Basic HTTP server (Python, Node.js, or PHP)
- ImageMagick (for icon generation)

### Best Practices

1. **Cross-Platform Testing**:
   - Test on different operating systems
   - Test on various mobile devices
   - Verify PWA functionality
   - Check offline support

2. **Performance**:
   - Optimize images
   - Minify CSS/JS for production
   - Use appropriate image formats (WebP with PNG fallback)
   - Implement lazy loading where applicable

3. **Accessibility**:
   - Maintain WCAG 2.1 compliance
   - Test with screen readers
   - Support keyboard navigation
   - Provide sufficient color contrast

### Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

MIT License
