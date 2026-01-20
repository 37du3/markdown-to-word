/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        word: {
          blue: '#2b579a',
          green: '#217346',
          gray: '#f3f4f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Noto Serif SC', 'SimSun', 'serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.gray.700'),
            '--tw-prose-headings': theme('colors.gray.900'),
            '--tw-prose-lead': theme('colors.gray.600'),
            '--tw-prose-links': theme('colors.primary.600'),
            '--tw-prose-bold': theme('colors.gray.900'),
            '--tw-prose-counters': theme('colors.gray.500'),
            '--tw-prose-bullets': theme('colors.gray.400'),
            '--tw-prose-hr': theme('colors.gray.200'),
            '--tw-prose-quotes': theme('colors.gray.900'),
            '--tw-prose-quote-borders': theme('colors.primary.200'),
            '--tw-prose-captions': theme('colors.gray.500'),
            '--tw-prose-code': theme('colors.gray.900'),
            '--tw-prose-pre-code': theme('colors.gray.100'),
            '--tw-prose-pre-bg': theme('colors.gray.800'),
            '--tw-prose-th-borders': theme('colors.gray.300'),
            '--tw-prose-td-borders': theme('colors.gray.200'),
            maxWidth: 'none',
          },
        },
        word: {
          css: {
            '--tw-prose-body': '#000000',
            '--tw-prose-headings': '#000000',
            '--tw-prose-links': '#0563c1',
            '--tw-prose-bold': '#000000',
            fontFamily: theme('fontFamily.serif'),
            fontSize: '12pt',
            lineHeight: '1.5',
            p: {
              marginBottom: '8pt',
            },
            h1: {
              fontSize: '16pt',
              fontWeight: '700',
              marginBottom: '12pt',
            },
            h2: {
              fontSize: '14pt',
              fontWeight: '600',
              marginBottom: '10pt',
            },
            h3: {
              fontSize: '13pt',
              fontWeight: '600',
              marginBottom: '8pt',
            },
            table: {
              borderCollapse: 'collapse',
              width: '100%',
            },
            'th, td': {
              border: '1px solid #000000',
              padding: '4pt 8pt',
            },
            th: {
              backgroundColor: '#f0f0f0',
              fontWeight: '600',
            },
            code: {
              fontFamily: theme('fontFamily.mono'),
              backgroundColor: '#f5f5f5',
              padding: '2px 4px',
              borderRadius: '2px',
              fontSize: '10pt',
            },
            pre: {
              backgroundColor: '#f5f5f5',
              padding: '12pt',
              borderRadius: '0',
              overflow: 'auto',
            },
          },
        },
      }),
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
