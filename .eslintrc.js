module.exports = {

	extends: ["plugin:jest/recommended"],
	env: {
		browser: true,
		es6: true,
	},
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly"
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: "module"
	},
	plugins: ["@typescript-eslint", "prettier", "jest"],
	rules: {
		"no-undef": "error",
		quotes: ["error", "single"],
		"no-console": 0,
		"prettier/prettier": "error"
	}
};
