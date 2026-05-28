import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },
  // ── Service Worker ────────────────────────────────────────────────────────
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        setTimeout: 'readonly',
        clients: 'readonly',
      },
    },
  },
  eslintPluginPrettierRecommended,
]

export default eslintConfig
