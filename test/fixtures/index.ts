export interface ModuleType {
  name: string
}

export const list1 = import.meta.globNext<ModuleType>('./modules/*.ts')

export const list2 = import.meta.globNext([
  './modules/*.ts',
  '!**/index.ts',
])

export const list3 = import.meta.globNext([
  './modules/*.ts',
  '!**/index.ts',
], { eager: true, as: 'raw' })

export const list4 = import.meta.globNext(
  './modules/*.ts',
  { eager: true },
)

export const list5 = import.meta.globNext<string>(
  './modules/*.ts',
  { eager: true, export: 'name' },
)

export const list6 = import.meta.globNext<string>(
  './modules/*.ts',
  { export: 'name' },
)
