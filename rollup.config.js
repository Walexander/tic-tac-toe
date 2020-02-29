import typescript from 'rollup-plugin-typescript2'
import nodeResolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import loadz0r from 'rollup-plugin-loadz0r'
import liveServer from 'rollup-plugin-live-server'
import copy from 'rollup-plugin-copy'

import indexHTML from 'rollup-plugin-index-html'
// Delete 'dist'
require('rimraf').sync('dist')

export default {
	input: './static/index.html',

	output: {
		dir: 'dist',
		format: 'esm',
		sourcemap: true,
	},
	plugins: [
		indexHTML(),
		typescript({
			// Make sure we are using our version of TypeScript.
			typescript: require('typescript'),
			tsconfigOverride: {
				compilerOptions: {
					sourceMap: true,
				},
			},
		}),
		nodeResolve(),
		liveServer({
			port: 8001,
			host: '0.0.0.0',
			root: './',
			file: 'index.html',
			mount: [
				['/dist', './dist'],
				['/static', './static'],
				['/src', './src'],
				['/node_modules', './node_modules'],
			],
			open: false,
			wait: 500,
		}),
	],
	experimentalCodeSplitting: true,
}
