/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"]
      },
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          light: "#87CEFA",
          dark: "#009ACD",
        },
        accent: "#FFD700",
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--text-tertiary) / <alpha-value>)",
        },
        // Dark Mode Colors
        dark: {
          bg: "#020617",
          card: "#0F172A",
          border: "#1E293B",
        },
        // Aliases for backward compatibility
        textPrimary: "rgb(var(--text-primary) / <alpha-value>)",
        textSecondary: "rgb(var(--text-secondary) / <alpha-value>)",
        primaryLight: "#87CEFA",
        border: "#E2E8F0",
        card: "#FFFFFF",
        bg: {
          light: "#F0F8FF",
          subtle: "#F7FAFC",
        },
        success: "rgb(var(--color-success) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.05)",
        hover: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        'soft-xl': '0 20px 27px 0 rgba(0, 0, 0, 0.05)',
        'soft-2xl': '0 25px 35px 0 rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0) translateX(0)"
          },
          "25%": {
            transform: "translateY(-20px) translateX(10px)"
          },
          "50%": {
            transform: "translateY(-10px) translateX(-15px)"
          },
          "75%": {
            transform: "translateY(15px) translateX(5px)"
          }
        }
      },
      animation: {
        float: "float 4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};