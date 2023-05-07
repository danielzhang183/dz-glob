import { dirname } from 'path'
import fg from 'fast-glob'
import MagicString from 'magic-string'
import type { TransformPluginContext } from 'rollup'
import type { PluginOptions } from '../types'
import { parseImportGlob } from './parse'

const importPrefix = '__glob_next__'

export async function transform(
  code: string,
  id: string,
  parse: TransformPluginContext['parse'],
  options?: PluginOptions,
) {
  let matches = parseImportGlob(code, parse)

  if (options?.takeover) {
    matches.forEach((i) => {
      if (i.type === 'globEager')
        i.options.eager = true
      if (i.type === 'globEagerDefault') {
        i.options.eager = true
        i.options.export = 'default'
      }
    })
  }
  else {
    matches = matches.filter(i => i.type === 'importGlob')
  }

  if (!matches.length)
    return

  const s = new MagicString(code)
  const staticImports: string[] = []

  await Promise.all(matches.map(async ({ match, index, globs, options }) => {
    const files = await fg(globs, {
      dot: true,
      cwd: dirname(id),
    })
    const start = match.index!
    const end = start + match[0].length
    const query = options.as ? `?${options.as}` : ''

    if (options.eager) {
      staticImports.push(
        ...files.map((file, i) => {
          const name = `${importPrefix}${index}_${i}`
          const expression = options.export
            ? `{ ${options.export} as ${name} }`
            : `* as ${name}`

          return `import ${expression} from '${file}${query}'`
        }),
      )
      const replacement = `{\n${files.map((file, idx) => `'${file}': ${importPrefix}${index}_${idx}`).join(',\n')}\n}`
      s.overwrite(start, end, replacement)
    }
    else {
      const objProps = files.map((i) => {
        let importStatement = `import('${i}${query}')`
        if (options.export)
          importStatement += `.then((m) => m.${options.export})`

        return `'${i}': () => ${importStatement}`
      })
      const replacement = `{\n${objProps.join(',\n')}\n}`
      s.overwrite(start, end, replacement)
    }
  }))

  if (staticImports.length)
    s.prepend(`${staticImports.join('\n')}\n`)

  return {
    s,
    matches,
  }
}
