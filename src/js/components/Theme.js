// Theme management
export class ThemeManager {
    constructor() {
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.init();
    }

    init() {
        this.updateTheme();
        this.setupListeners();
    }

    setupListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.updateTheme();
    }

    updateTheme() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        const themeIcon = document.querySelector('#themeToggle .material-icons');
        if (themeIcon) {
            themeIcon.textContent = this.isDarkMode ? 'light_mode' : 'dark_mode';
        }
    }
}
