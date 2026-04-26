import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  globalIgnores(["**/build/**", "next.config.mjs"]),
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "import/first": "error",
      "import/no-mutable-exports": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
    },
  },
]);

export default eslintConfig;
