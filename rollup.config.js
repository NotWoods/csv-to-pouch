import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'src/parseCSVFile.js',
	sourceMap: true,
	targets: [
		{ dest: 'index.js', format: 'cjs' },
		{ dest: 'index.es.js', format: 'es' },
	],
	external: [
		...Object.keys(require('./package.json').dependencies),
		'stream', 'buffer', 'fs', 'events', 'util', 'string_decoder',
	],
	plugins: [
		nodeResolve({ module: true }),
		commonjs({ exclude: ['node_modules/promise-stream-utils/**'] }),
	],
	exports: 'named',
};
