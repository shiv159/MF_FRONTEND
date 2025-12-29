import { Injectable, signal, effect } from '@angular/core';

const THEME_KEY = 'theme-preference';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly darkMode = signal(false);

    readonly isDark = this.darkMode.asReadonly();

    constructor() {
        // Initialize from localStorage or system preference
        const stored = localStorage.getItem(THEME_KEY);
        if (stored) {
            this.darkMode.set(stored === 'dark');
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.darkMode.set(prefersDark);
        }

        // Apply theme on changes
        effect(() => {
            const isDark = this.darkMode();
            document.documentElement.classList.toggle('dark', isDark);
            localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
        });
    }

    toggle(): void {
        this.darkMode.update(v => !v);
    }

    setDark(isDark: boolean): void {
        this.darkMode.set(isDark);
    }
}
