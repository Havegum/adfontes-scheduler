import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
// import { terser } from 'rollup-plugin-terser';

import autoPreprocess from 'svelte-preprocess';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/bundle.js'
	},
	onwarn: function (warning, warn) {
  		if (warning.code === 'CIRCULAR_DEPENDENCY') return;
  		warn(warning);
	},
	plugins: [
		svelte({
			dev: !production,
			css: css => css.write('public/bundle.css'),
			preprocess: autoPreprocess()
		}),

		// Resolve external dependencies.
		// In some cases you'll need additional configuration see:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),

		!production && livereload('public'),

		// // 13.02.2020: terser broken. https://github.com/TrySound/rollup-plugin-terser/issues/40
		// production && terser()
	],
	watch: {
		clearScreen: false
	}
};
