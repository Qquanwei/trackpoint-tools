import { minify } from 'uglify-es'
import uglify from 'rollup-plugin-uglify'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
    entry: './index.js',
    format: 'cjs',
    dest: 'lib/bundle.js',
    sourceMap: true,
    plugins: [
        uglify({}, minify),
        resolve({
            jsnext: true,
            main: true,
        }),
        commonjs()
    ]
}
