import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      "**/node_modules/**",
      ".agents/**",
      ".open-next/**",
      "cloudflare/**",
      ".next/**",
      "coverage/**",
      "scratch/**",
      "scripts/**",
      "*.d.ts",
      "jest.config.js",
      "postcss.config.mjs",
      "tailwind.config.ts",
    ],
  },
  ...nextConfig,
  {
    rules: {
      "@next/next/no-img-element": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/error-boundaries": "warn",
      "react/jsx-no-comment-textnodes": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default config;
