import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        reveal: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        reveal: "reveal 1s ease-out forwards",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-gray": "linear-gradient(90deg, #bbbbbb 22%, #9c9b9b 100%)",
        "gradient-cyan": "linear-gradient(90deg, #529d94 13%, #28857a 100%)",
        "gradient-black": "linear-gradient(90deg, #111111 0%, #181818 50%)",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui(),
  ],
};
export default config;
