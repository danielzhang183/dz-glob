import { defineConfig } from 'vite'
import importGlobPlugin from '../src/index'

export default defineConfig({
  plugins: [
    importGlobPlugin(),
  ],
  build: {
    target: 'esnext',
  },
  clearScreen: false,
})
