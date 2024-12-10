import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		parser: '@typescript-eslint/parser',  // Specify the TypeScript parser
		parserOptions: {
			project: './tsconfig.json',  // Point to your TypeScript configuration file
		},
		plugins: ['@typescript-eslint', 'svelte'],  // Enable the TypeScript plugin
		rules: {
			'@typescript-eslint/explicit-module-boundary-types': 'off', // Customize rules as needed
			'@typescript-eslint/no-unused-vars': 'warn',  // Example of TypeScript-specific rule
		},
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	}
];
