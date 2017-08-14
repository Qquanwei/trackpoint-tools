import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'

export default {
    entry: './index.js',
    format: 'cjs',
    dest: 'lib/bundle.js',
    sourceMap: true,
    plugins: [
	buble(),
        resolve({
            jsnext: true,
            main: true,
        }),
        commonjs()
    ]
}
