/* eslint-disable */
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';

export default {
  input: 'src/index.jsx',
  output: {
    file: 'dist/bundle.js',
    format: 'umd'
  },
  plugins: [
    alias({
      entries: [
        { find: 'react', replacement: "preact/compat" },
        { find: 'react-dom', replacement: "preact/compat" }
      ]
    }),
    resolve({
      browser: true,
    }),
    json(),
    commonjs({ sourceMap: false }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['js', 'jsx'],
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-react',
        {
          'runtime': 'automatic',
          'importSource': 'preact-jsx-runtime'
        }]
      ]
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      preventAssignment: true,
    }),
  ]
}
