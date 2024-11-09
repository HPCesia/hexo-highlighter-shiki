import { build } from 'esbuild';
import { promises as fs } from 'fs';

await build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    external:[
        'hexo-util',
        'hexo'
    ],
    outdir: 'dist',
    platform: 'node',
    sourcemap: false,
    tsconfig: 'tsconfig.json',
});
await fs.copyFile('src/index.js', 'dist/index.js');