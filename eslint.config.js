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
        MutationObserver: "readonly",
        structuredClone: "readonly",
        Blob: "readonly",
        Image: "readonly",
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
    // tests/ runs under Vitest and Playwright, both of which are Node — a spec reads the repo off
    // disk (`process.cwd()` + node:fs) rather than through the browser's module graph. Missing until
    // Phase 75, which is why the filesystem scan added in Phase 74 failed no-undef.
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
  {
    // A mockup under docs/ may ship its own Node build step beside the page it builds — the
    // location-transitions mockup inlines its art for publishing. Same situation as scripts/:
    // authored source, run by `node`, never loaded by the browser.
    files: ["docs/**/*.mjs"],
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
    // Don't lint build output, vendor code, or asset folders.
    //
    // `reports/` is gitignored working output — asset caches, staging downloads, and the throwaway
    // Node scripts that produce them. It is not repository source and is not on a clean checkout,
    // so linting it only means `npm run lint` reports errors that depend on which one-off tools a
    // given machine happens to have run. It did: the character-import tooling left .mjs files there
    // that failed no-undef on `process` and `Buffer`, breaking the lint gate locally while tracked
    // source was clean.
    ignores: ["**/dist/**", "node_modules/**", "vendor/**", "**/*.min.js", "reports/**"],
  },
  eslintConfigPrettier,
];
