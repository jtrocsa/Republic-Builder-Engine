import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Browser globals, since this runs client-side
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        navigator: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        structuredClone: "readonly",
        Blob: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        CSS: "readonly",
        performance: "readonly",
        alert: "readonly",
      },
    },
    rules: {
      // Catch real bugs without being noisy
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off", // you'll want console logs during dev
      "no-var": "error", // use let/const
      "prefer-const": "warn",
      eqeqeq: ["error", "smart"], // catches == vs === bugs
      "no-undef": "error", // catches typos in variable/function names
      "no-duplicate-imports": "error",
      "no-shadow": "warn", // catches accidental variable shadowing (easy to hit across game systems)
    },
  },
  {
    // scripts/ runs under plain Node (npm run validate:content), not the browser
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
  {
    // api/ runs as Vercel serverless functions under Node, not the browser
    files: ["api/**/*.js"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
  {
    // Root-level tool configs also run under plain Node, not the browser
    files: ["vite.config.js", "playwright.config.js"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
  {
    // Don't lint build output, vendor code, or asset folders
    ignores: ["**/dist/**", "node_modules/**", "vendor/**", "**/*.min.js"],
  },
  eslintConfigPrettier,
];
