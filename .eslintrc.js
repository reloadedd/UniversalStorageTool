module.exports = {
    parser: "@babel/eslint-parser",
    env: {
        "node": true,
        "es6": true
    },
    parserOptions: {
        ecmaVersion: 2021,
        requireConfigFile: false,
        sourceType: "module",
        allowImportExportEverywhere: false,
        ecmaFeatures: {
            "jsx": true
        },
        rules: {
            "semi": 2
        },
    }
}
