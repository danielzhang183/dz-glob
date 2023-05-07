interface ImportMeta {
  glob<T>(glob: string | string[], options?: import('./types').GlobalOptions<false>): Record<string, () => Promise<T>>
  glob<T>(glob: string | string[], options: import('./types').GlobalOptions<true>): Record<string, () => T>
  glob<T, Eager extends boolean>(
    glob: string | string[],
    options?: import('./types').GlobalOptions<Eager>
  ): Eager extends true
    ? Record<string, T>
    : Record<string, () => Promise<T>>

  globEager<T>(
    glob: string | string[],
    options?: Omit<import('./types').GlobalOptions<boolean>, 'eager'>
  ): Record<string, T>
}
