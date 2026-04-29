/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          green: "#8ceb34",
          blue: "#6254e8",
        },
        dark: {
          bg: "#0a0a0a",
          card: "#141414",
          cardHover: "#1a1a1a",
          border: "#2a2a2a",
        },
        muted: "#888888",
      },
    },
  },
  plugins: [],
};
