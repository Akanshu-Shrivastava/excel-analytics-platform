export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          sans: ["Poppins", "sans-serif"], // default body font
          mono: ["Roboto Mono", "monospace"], // for special headings or code-style text
        },
      },
    },
    plugins: [],
  };
  