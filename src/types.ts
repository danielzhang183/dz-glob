export interface GlobalOptions<Eager extends boolean> {
  as?: string
  eager?: Eager
}

export interface ParsedImportGlob {
  match: RegExpMatchArray
  index: number
  globs: string[]
  options: GlobalOptions<boolean>
}
