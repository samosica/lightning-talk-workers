module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "google",
        "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
    },
    settings: {
        "import/resolver": {
            node: {
                extensions: [
                    ".js",
                    ".json",
                    ".ts",
                ],
            },
        },
    },
    ignorePatterns: [
        "/lib/**/*", // Ignore built files.
    ],
    plugins: [
        "@typescript-eslint",
        "import",
    ],
    rules: {
        "quotes": ["error", "double"],
        "object-curly-spacing": ["error", "always"],
        "max-len": ["off"],
        "indent": ["error", 4],
        "require-jsdoc": ["error", {
            "require": {
                "FunctionDeclaration": true,
                "MethodDefinition": true,
                "ClassDeclaration": false,
                "ArrowFunctionExpression": true,
                "FunctionExpression": true,
            },
        }],
        "valid-jsdoc": ["off"],
        "camelcase": ["error", { "allow": ["drive_v3", "private_url"] }],
        "@typescript-eslint/no-non-null-assertion": ["error"],
    },
};
