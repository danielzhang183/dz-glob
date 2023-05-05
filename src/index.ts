import type { Plugin } from 'vite'
import { transform } from './transform'

export default function (_options?: Options = {}): Plugin {
  return {
    name: 'vite-plugin-glob',
    async transform(code, id) {
      return await transform(code, id, this.parse)
    },
  }
}
