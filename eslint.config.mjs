import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig({
  extends: [nextVitals, nextTs],

  ignorePatterns: [
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts"
  ],

  rules: {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          "../src/*",
          "../../src/*",
          "../../../src/*",
          "**/src/*"
        ]
      }
    ]
  }
});
