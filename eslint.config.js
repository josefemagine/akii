// ESLint flat config
export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'supabase/functions/**',
      '.git/**',
      '**/*.d.ts',
      'src/types/**',
      'src/stories/**'
    ]
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      // Turn off rules that might cause issues during development
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-console': 'off'
    }
  }
]; 