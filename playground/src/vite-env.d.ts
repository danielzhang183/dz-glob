/// <reference types="vite/client" />

interface ImportMeta {
  globNext<T>(name: string | string[]): (() => Promise<T>)[]
}
