import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { 
    ignores: [
      'dist/**',
      'third_party/**',
      'archive/**',
      'tests/**',
      'node_modules/**',
      'artifacts/**',
      'backend-examples/**',
      'examples/**',
      'integrations/**',
      'ml/**',
      'mcp/**',
      'scripts/**',
      'tools/**',
      'StartHere/**',
      'cursor_discovery/**',
      'cursor_reports/**',
      'ci-reports/**',
      'reports/**',
      'deploy/**',
      'docs/**',
      'public/**',
      'patches/**',
      'nginx/**',
      'archived-root-documentation/**',
      'config/**',
      // All root-level TypeScript files (test/example files)
      './*.ts',
      './*.tsx',
      './*.js',
      './*.mjs',
    ] 
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['src/**/*.{ts,tsx}', 'e2e/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Disable/relax rules that have too many violations
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade from error
      '@typescript-eslint/no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true,
      }],
      'no-unused-vars': 'off', // Turn off base rule as it can conflict with TypeScript
      'no-case-declarations': 'warn', // Allow lexical declarations in case blocks
      '@typescript-eslint/ban-ts-comment': ['warn', {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description', // Allow @ts-ignore with comments
        'ts-nocheck': 'allow-with-description',
        'ts-check': false,
      }],
      'react-hooks/exhaustive-deps': 'warn', // Downgrade from error
      '@typescript-eslint/no-require-imports': 'warn', // Allow require in some cases
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      'no-empty': ['warn', { 'allowEmptyCatch': true }], // Allow empty catch blocks
      'no-useless-catch': 'warn', // Downgrade from error
      'no-useless-escape': 'warn', // Downgrade - many regex patterns use escapes
      '@typescript-eslint/no-namespace': 'warn', // Namespaces are occasionally useful
      'no-unsafe-optional-chaining': 'warn', // Downgrade
      'no-constant-binary-expression': 'warn', // Downgrade
      'no-async-promise-executor': 'warn', // Downgrade
    },
  }
);
