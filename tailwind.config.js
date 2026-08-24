module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}",// Path to the Tremor module
  "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EFF8FF",
          100: "#DBEEFF",
          200: "#BFE1FF",
          300: "#93CDFF",
          400: "#5FB0FF",
          500: "#2997FE",
          600: "#157AE0",
          700: "#0F62B8",
          800: "#124F93",
          900: "#14427A",
        },
        ink: {
          400: "#7E8299",
          600: "#383854",
          700: "#2D2D43",
          800: "#23233A",
          900: "#1E1E2D",
        },
        success: {
          50: "#ECFDF5",
          500: "#12B76A",
          600: "#039855",
          700: "#027A48",
        },
        warning: {
          50: "#FFFAEB",
          500: "#F59E0B",
          600: "#DC8A0A",
          700: "#B45309",
        },
        danger: {
          50: "#FEF2F2",
          500: "#F9666E",
          600: "#E14550",
          700: "#C22630",
        },
      },
      fontFamily: {
        sans: ['"SF-UI-Display-Medium"', "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(16, 24, 40, 0.05)",
        card: "0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)",
        md: "0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",
        lg: "0 12px 24px -6px rgba(16, 24, 40, 0.12), 0 4px 6px -2px rgba(16, 24, 40, 0.04)",
        dropdown: "0px 0px 20px 0px rgba(76, 87, 125, 0.12)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
