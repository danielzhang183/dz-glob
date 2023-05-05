/// <reference types="vite/client" />

interface ImportMeta {
  globNext<T>(name: string | string[], options?: GlobalOptions<false>): Record<string, () => Promise<T>>
  globNext<T>(name: string | string[], options: GlobalOptions<true>): Record<string, T>
  globNext<T, Eager extends boolean>(
    name: string | string[],
    options: GlobalOptions<Eager>
  ): Eager extends true
    ? Record<string, T>
    : Record<string, () => Promise<T>>
}

interface GlobalOptions<Eager extends boolean> {
  as?: string
  eager?: boolean
}
