import {readFileSync} from 'node:fs';
import terser from '@rollup/plugin-terser';

const banner = `/*!\n${readFileSync(new URL('./LICENSE', import.meta.url), 'utf8').trim()}\n*/`;

export default {
  input: 'browser.js',
  output: [
    {
      file: 'dist/jsqubits.js',
      format: 'iife',
      name: 'jsqubits',
      exports: 'default',
      banner
    },
    {
      file: 'dist/jsqubits.min.js',
      format: 'iife',
      name: 'jsqubits',
      exports: 'default',
      banner,
      plugins: [terser({format: {comments: /^!/}})]
    }
  ]
};
