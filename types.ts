export interface GlobalOptions<Eager extends boolean, AsType extends string> {
  /**
   * Custom query for the import url
   */
  as?: AsType
  /**
   * Import as static or dynamic
   */
  eager?: Eager
  /**
   * Import only the specific named export. Set to `default` to import the default export.
   */
  export?: string
}

export type GeneralGlobOptions = GlobalOptions<boolean, string>

export interface ParsedImportGlob {
  match: RegExpMatchArray
  index: number
  globs: string[]
  options: GlobalOptions<boolean, string>
  type: string
}

export interface PluginOptions {
  /**
   * Take over the default import.meta.glob in Vite
   *
   * @default false
   */
  takeover?: boolean
}

export interface KnownAsType {
  raw: string
  url: string
  worker: Worker
}

type isTrue<T> = T extends true ? true : false

export interface GlobFunction {
  <Eager extends boolean, As extends string, T = As extends keyof KnownAsType ? KnownAsType[As] : unknown>(
    glob: string | string[],
    options?: GlobalOptions<Eager, As>
  ): isTrue<Eager> extends true
    ? Record<string, T>
    : Record<string, () => Promise<T>>
  <M>(glob: string | string[], options: GlobalOptions<true, string>): Record<string, () => Promise<M>>
  <M>(glob: string | string[], options?: GlobalOptions<false, string>): Record<string, M>
}

export interface GlobEagerFunction {
  <As extends string, T = As extends keyof KnownAsType ? KnownAsType[As] : unknown>(
    glob: string | string[],
    options?: Omit<GlobalOptions<boolean, As>, 'eager'>
  ): Record<string, T>
  <M>(
    glob: string | string[],
    options?: Omit<GlobalOptions<boolean, string>, 'eager'>
  ): Record<string, M>
}
