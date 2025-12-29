/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,ts}"],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary - Blue
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                // Semantic Colors
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            fontSize: {
                'heading-xl': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
                'heading-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
                'heading-md': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
                'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
                'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
                'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
            },
            borderRadius: {
                'DEFAULT': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
                'DEFAULT': '0 4px 6px rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px rgba(0, 0, 0, 0.07)',
                'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
            },
        },
    },
    plugins: [],
}
