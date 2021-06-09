module.exports = {
    parser: "@babel/eslint-parser",
    env: {
        browser: true,
        es2021: true,
    },
    extends: ["google", "prettier"],
    plugins: ["prettier"],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
        requireConfigFile: false,
    },
    rules: {
        "prettier/prettier": "error",
        "no-unused-vars": 0,
        "require-jsdoc": 0,
        "new-cap": 0,
    },
};
