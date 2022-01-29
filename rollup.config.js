// import { rollup } from "rollup";
import { uglify } from "rollup-plugin-uglify";
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap:true
  },
  plugins: [uglify()]
};