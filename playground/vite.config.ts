import { defineConfig } from 'vite'
import importGlobPlugin from '../src/index'

export default defineConfig({
  plugins: [
    importGlobPlugin({
      takeover: true,
    }),
  ],
  build: {
    target: 'esnext',
  },
  clearScreen: false,
})
