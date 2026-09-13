import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // **`node`, not `jsdom`, and the 32 files that need a DOM say so themselves.**
    //
    // This was `jsdom` for every file in the suite. Only 32 of 80 touch a DOM at all, and standing
    // one up for the other 48 was the single largest line in the run: measured at 47.9s wall clock
    // with 256s of aggregate environment setup, against 20.1s for the same files under `node`.
    //
    // A file that needs a DOM declares it with a `// @vitest-environment jsdom` docblock on line 1.
    // That direction is deliberate: the default is the cheaper thing, and a file that wants more
    // asks for it, where the cost is visible to whoever adds the next one.
    environment: "node",
    include: ["tests/unit/**/*.test.js"],
  },
});
