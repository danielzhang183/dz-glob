interface ImportMeta {
  globNext<T>(glob: string | string[], options?: import('./types').GlobalOptions<false>): Record<string, ()=> Promise<T>>
  globNext<T>(glob: string | string[], options: import('./types').GlobalOptions<true>): Record<string, T>
  globNext<T, Eager extends boolean>(

  ): Eager extends true
    ? Record<string, T>
    : Record<string, () => Promise<T>>
}
