import { describe, expect, it } from 'vitest'
import { parse } from 'acorn'
import { parseImportGlob } from '../src/parse'

function run(input: string) {
  return parseImportGlob(input, parse).map(i => ({
    globs: i.globs,
    options: i.options,
  }))
}

function runError(input: string) {
  try {
    run(input)
  }
  catch (e) {
    return e
  }

  throw new Error('Should throw')
}

describe('parse positive', () => {
  it('basic', () => {
    expect(run(`
    import.meta.globNext(\'./modules/*.ts\')
    `)).toMatchInlineSnapshot(`
      [
        {
          "globs": [
            "./modules/*.ts",
          ],
          "options": {},
        },
      ]
    `)
  })

  it('array', () => {
    expect(run(`
    import.meta.globNext([\'./modules/*.ts\', './dir/*/{js,ts}\'])
    `)).toMatchInlineSnapshot(`
      [
        {
          "globs": [
            "./modules/*.ts",
            "./dir/*/{js,ts}",
          ],
          "options": {},
        },
      ]
    `)
  })

  it('options with multilines', () => {
    expect(run(`
    import.meta.globNext([
      \'./modules/*.ts\',
      \'./dir/*.{js,ts}\',
    ], {
      eager: true,
      export: 'named',
    })
    `)).toMatchInlineSnapshot(`
      [
        {
          "globs": [
            "./modules/*.ts",
            "./dir/*.{js,ts}",
          ],
          "options": {
            "eager": true,
            "export": "named",
          },
        },
      ]
    `)
  })
})

describe('parse negative', () => {
  it('variable', () => {
    expect(runError('import.meta.globNext(hi)'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: Could only use literals]')
  })

  it('template', () => {
    // eslint-disable-next-line no-template-curly-in-string
    expect(runError('import.meta.globNext(`hi ${hey}`)'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: Could only use literals]')
  })

  it('to be string', () => {
    expect(runError('import.meta.globNext(1)'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: Expected glob to be a string, but got "number"]')
  })

  it('be array variable', () => {
    expect(runError('import.meta.globNext([hey])'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: Could only use literals]')
    expect(runError('import.meta.globNext(["1", hey])'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: Could only use literals]')
  })

  it('options', () => {
    expect(runError('import.meta.globNext("hey", hey)'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: pattern must start with "." or "/" (relative to project root) or alias path]')
    expect(runError('import.meta.globNext("hey", [])'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: pattern must start with "." or "/" (relative to project root) or alias path]')
  })

  it('options props', () => {
    expect(runError('import.meta.globNext("hey", { hey: 1 })'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: pattern must start with "." or "/" (relative to project root) or alias path]')
    expect(runError('import.meta.globNext("hey", { expect: hey })'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: pattern must start with "." or "/" (relative to project root) or alias path]')
    expect(runError('import.meta.globNext("hey", { eager: 123 })'))
      .toMatchInlineSnapshot('[Error: Invalid glob import syntax: pattern must start with "." or "/" (relative to project root) or alias path]')
  })
})
