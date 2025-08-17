import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "primary-green": "#02BC77",
        "very-green": "#0D6B6D",
        "green-yellow": "#B0AE2B",
        "pale-green": "#D2DFD8",
        "dark-gray": "#595256",
        "default-gray": "#D9D9D9"
      }
    }
  },
  plugins: [heroui]
};
