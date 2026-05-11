/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF9F0",
        ink: "#181513",
        blush: "#F7C8D0",
        lavender: "#DCCAF6",
        gold: "#C9A64E",
        mint: "#CFE8D8",
        sage: "#6B8F71"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 21, 19, 0.12)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.7s ease both",
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
