import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const rollupOptions = {
  input: {
    app: resolve(__dirname, 'src/js/app.js'),
  },
  output: {
    entryFileNames: '[name].js',
    chunkFileNames: '[name].js',
    assetFileNames: '[name].[ext]',
  },
}

export default defineConfig({
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    rollupOptions,
  },
})
