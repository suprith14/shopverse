import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Linting for plain JavaScript + JSX. Without TypeScript, the linter is the main automatic
// safety net left: it still catches unused variables, undefined names, and mistakes with
// React hooks before the code runs.
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } }, // understand <JSX> in .jsx files
    },
    rules: {
      // Unused variables are usually mistakes; ignore ones starting with _ (deliberately unused).
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
  {
    // vite.config.js runs in Node, not the browser
    files: ['vite.config.js'],
    languageOptions: { globals: globals.node },
  },
])
