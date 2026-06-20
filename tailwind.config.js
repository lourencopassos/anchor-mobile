/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary brand color - Deep forest green ("Quiet Confidence" aesthetic)
        primary: {
          DEFAULT: "#2D5A4A",
          50: "#F0F5F3",
          100: "#D1E0DA",
          200: "#A3C2B5",
          300: "#75A391",
          400: "#4D8670",
          500: "#2D5A4A",
          600: "#264D3F",
          700: "#1F4034",
          800: "#183329",
          900: "#11261E",
        },
        // Neutral grays - Warmer undertones
        neutral: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
        },
        // Semantic colors - Refined versions
        success: {
          DEFAULT: "#2D5A4A",
          50: "#F0F5F3",
          100: "#D1E0DA",
          500: "#2D5A4A",
          600: "#264D3F",
          700: "#1F4034",
        },
        warning: {
          DEFAULT: "#D4A574",
          50: "#FDF8F3",
          100: "#F9EDE0",
          500: "#D4A574",
          600: "#B87333",
          700: "#9A5F2A",
        },
        error: {
          DEFAULT: "#B54548",
          50: "#FEF2F2",
          100: "#FCDEDE",
          500: "#B54548",
          600: "#9A3A3D",
          700: "#7F2F32",
        },
        info: {
          DEFAULT: "#4A7C8C",
          50: "#F0F6F8",
          100: "#D9E8EC",
          500: "#4A7C8C",
          600: "#3D6673",
          700: "#30505A",
        },
        // Commitment state colors - Sophisticated palette
        state: {
          draft: "#A8A29E",
          active: "#2D5A4A",
          completed: "#4A7C8C",
          broken: "#B54548",
          cancelled: "#78716C",
        },
        // Gradient color pairs for cards - Premium feel
        gradient: {
          'success-from': '#2D5A4A',
          'success-to': '#1F4034',
          'warning-from': '#D4A574',
          'warning-to': '#B87333',
          'danger-from': '#B54548',
          'danger-to': '#9A3A3D',
          'primary-from': '#2D5A4A',
          'primary-to': '#183329',
          'neutral-from': '#57534E',
          'neutral-to': '#44403C',
          // Premium gradient pairs
          'forest-from': '#2D5A4A',
          'forest-to': '#11261E',
          'copper-from': '#B87333',
          'copper-to': '#8B5A2B',
          'sage-from': '#87A878',
          'sage-to': '#6B8B5E',
        },
        // Accent colors - Warm, premium feel
        accent: {
          warm: '#D4A574',      // Warm gold - achievements
          copper: '#B87333',    // Copper - stakes, money
          sage: '#87A878',      // Sage - secondary
          cream: '#F5F0EB',     // Cream - backgrounds
          gold: '#D4A574',
          silver: '#A8A29E',
          bronze: '#B87333',
          indigo: '#4A5568',
        },
        // Surface colors for cards - Warmer, premium surfaces
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#FAFAF9',
          tertiary: '#F5F5F4',
          elevated: '#FFFFFF',
          cream: '#F5F0EB',
          dark: '#1C1917',
          'dark-secondary': '#292524',
          'dark-tertiary': '#44403C',
        },
        // Health status colors - Refined palette
        health: {
          excellent: '#2D5A4A',
          good: '#4D8670',
          fair: '#D4A574',
          poor: '#B54548',
        },
      },
      fontFamily: {
        // Display font - Elegant serif for headlines
        display: ["Fraunces", "Georgia", "serif"],
        // Body font - Modern geometric sans
        sans: ["PlusJakartaSans", "System", "sans-serif"],
        // Mono for numbers
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        'display': ['36px', { lineHeight: '44px', fontWeight: '600', letterSpacing: '-0.02em' }],
        'headline': ['28px', { lineHeight: '36px', fontWeight: '600', letterSpacing: '-0.01em' }],
        'title': ['22px', { lineHeight: '30px', fontWeight: '600' }],
        'body-lg': ['17px', { lineHeight: '26px', fontWeight: '400' }],
        'body': ['15px', { lineHeight: '24px', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '20px', fontWeight: '500' }],
        'micro': ['11px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.05em' }],
        // Additional sizes for variety
        'overline': ['10px', { lineHeight: '14px', fontWeight: '700', letterSpacing: '0.1em' }],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)',
        'card-hover': '0 4px 12px rgba(28,25,23,0.08), 0 2px 4px rgba(28,25,23,0.04)',
        'elevated': '0 12px 24px rgba(28,25,23,0.1), 0 4px 8px rgba(28,25,23,0.04)',
        'floating': '0 24px 48px rgba(28,25,23,0.12), 0 12px 16px rgba(28,25,23,0.06)',
        // Colored shadows for premium depth
        'primary': '0 8px 24px rgba(45,90,74,0.25)',
        'warm': '0 8px 24px rgba(212,165,116,0.25)',
        'inner-subtle': 'inset 0 1px 2px rgba(28,25,23,0.06)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      // Custom animation timing
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      // Background patterns
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
