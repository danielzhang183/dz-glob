import { resolve } from 'path'
import { promises as fs } from 'fs'
import { describe, expect, it } from 'vitest'
import { parse } from 'acorn'
import { transform } from '../src/transform'

describe('should', async () => {
  const id = resolve(__dirname, './fixtures/index.ts')
  const code = await fs.readFile(id, 'utf-8')
  it('transform', async () => {
    expect((await transform(code, id, parse))?.s.toString())
      .toMatchInlineSnapshot(`
        "import * as __glob_next__2_0 from './modules/a.ts?raw'
        import * as __glob_next__2_1 from './modules/b.ts?raw'
        import * as __glob_next__3_0 from './modules/a.ts'
        import * as __glob_next__3_1 from './modules/b.ts'
        import * as __glob_next__3_2 from './modules/index.ts'
        import { name as __glob_next__4_0 } from './modules/a.ts'
        import { name as __glob_next__4_1 } from './modules/b.ts'
        import { name as __glob_next__4_2 } from './modules/index.ts'
        export interface ModuleType {
          name: string
        }

        export const list1 = {
        './modules/a.ts': () => import('./modules/a.ts'),
        './modules/b.ts': () => import('./modules/b.ts'),
        './modules/index.ts': () => import('./modules/index.ts')
        }

        export const list2 = {
        './modules/a.ts': () => import('./modules/a.ts'),
        './modules/b.ts': () => import('./modules/b.ts')
        }

        export const list3 = {
        './modules/a.ts': __glob_next__2_0,
        './modules/b.ts': __glob_next__2_1}

        export const list4 = {
        './modules/a.ts': __glob_next__3_0,
        './modules/b.ts': __glob_next__3_1,
        './modules/index.ts': __glob_next__3_2}

        export const list5 = {
        './modules/a.ts': __glob_next__4_0,
        './modules/b.ts': __glob_next__4_1,
        './modules/index.ts': __glob_next__4_2}

        export const list6 = {
        './modules/a.ts': () => import('./modules/a.ts').then((m) => m.name),
        './modules/b.ts': () => import('./modules/b.ts').then((m) => m.name),
        './modules/index.ts': () => import('./modules/index.ts').then((m) => m.name)
        }
        "
      `)
  })
})
