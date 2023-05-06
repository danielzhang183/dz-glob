import { dirname } from 'path'
import fg from 'fast-glob'
import MagicString from 'magic-string'
import type { TransformPluginContext } from 'rollup'
import type { ArrayExpression, Literal, ObjectExpression } from 'estree'
import type { GlobalOptions, ParsedImportGlob } from '../types'

const importGlobRE = /\bimport\.meta\.globNext(?:<\w+>)?\(([\s\S]*?)\)/g
const importPrefix = '__glob_next__'

export function parseImportGlob(
  code: string,
  parse: TransformPluginContext['parse'],
): ParsedImportGlob[] {
  const matches = Array.from(code.matchAll(importGlobRE))

  return matches.map((match, index) => {
    const argumentString = `[${match[1]}]`
    // @ts-expect-error ignore for now
    const ast = parse(argumentString, { ecmaVersion: 'latest' }).body[0].expression as Literal | ArrayExpression
    const arg1 = ast.elements[0] as Literal | ArrayExpression
    const globs: string[] = []
    if (arg1.type === 'ArrayExpression') {
      for (const element of arg1.elements) {
        if (element?.type === 'Literal')
          globs.push(element!.value as string)
      }
    }
    else {
      globs.push(arg1.value as string)
    }

    // arg2
    const options: GlobalOptions<boolean> = {}
    const args2 = ast.elements[1] as ObjectExpression | undefined
    if (args2) {
      for (const property of args2.properties) {
        // @ts-expect-error ignore for now
        options[property.key.name] = property.value.value
      }
    }

    return {
      match,
      index,
      globs,
      options,
    }
  })
}

export async function transform(
  code: string,
  id: string,
  parse: TransformPluginContext['parse'],
) {
  const matches = parseImportGlob(code, parse)
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
