module.exports = {
    root: true,
    parserOptions: {ecmaVersion: 2021, sourceType: 'module'},
    env: {es2021: true, browser: true},
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['prettier'],
    overrides: [
        {
            files: ['*.svelte'],
            plugins: ['svelte3'],
            processor: 'svelte3/svelte3',
        },
        {
            files: ['*.ts'],
            plugins: ['prettier'],
            rules: {
                'prettier/prettier': 1,
            },
        },
    ],
    ignorePatterns: ['node_modules/**'],
    settings: {
        'svelte3/typescript': require('typescript'),
        'svelte3/ignore-styles': (type) => type.lang !== 'css'
    },
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
    },
}
