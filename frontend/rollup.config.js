// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import tsPaths from 'rollup-plugin-typescript-paths';

export default {
  input: 'src/pages/Index.tsx',  // Adjust this if your entry point is different
  output: { 
    file: 'dist/bundle.js', 
    format: 'esm' 
  },
  plugins: [
    tsPaths({ /* options if needed */ }),
    resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
    typescript()
  ]
};
