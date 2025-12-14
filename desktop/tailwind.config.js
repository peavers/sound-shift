/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        accent: {
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
        },
        surface: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          750: "#363330",
          800: "#292524",
          850: "#1F1D1C",
          900: "#171615",
        },
        danger: {
          400: "#F87171",
          500: "#EF4444",
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'focus': '0 0 0 3px rgba(251, 191, 36, 0.2)',
      },
    },
  },
  plugins: [],
};
