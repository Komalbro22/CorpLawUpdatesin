import nextPlugin from "@next/eslint-plugin-next";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      ".agents/**",
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "scratch/**",
      "scripts/**",
      "*.d.ts",
      "jest.config.js",
      "postcss.config.mjs",
      "tailwind.config.ts",
    ],
  },
  nextPlugin.configs["recommended"],
  {
    rules: {
      "@next/next/no-img-element": "warn",
    },
  },
];

export default config;
