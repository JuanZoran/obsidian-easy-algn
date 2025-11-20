/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
	testEnvironment: '<rootDir>/jest-environment.js',
	transform: {
		'^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
	},
	testMatch: ['**/__tests__/**/*.test.ts'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

module.exports = config;
