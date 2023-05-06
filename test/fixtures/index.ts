export interface ModuleType {
  name: string
}

export const basic = import.meta.globNext<ModuleType>('./modules/*.ts')

export const basicEager = import.meta.globNext(
  './modules/*.ts',
  { eager: true },
)

export const ignore = import.meta.globNext([
  './modules/*.ts',
  '!**/index.ts',
])

export const namedEager = import.meta.globNext<string>(
  './modules/*.ts',
  { eager: true, export: 'name' },
)

export const namedDefault = import.meta.globNext<string>(
  './modules/*.ts',
  { export: 'default' },
)

export const eagerAs = import.meta.globNext<ModuleType>([
  './modules/*.ts',
  '!**/index.ts',
], { eager: true, as: 'raw' })
