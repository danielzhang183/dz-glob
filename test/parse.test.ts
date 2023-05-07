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
      .toMatchInlineSnapshot('[Error: Could only use literals in import.meta.globNext]')
  })

  it('template', () => {
    // eslint-disable-next-line no-template-curly-in-string
    expect(runError('import.meta.globNext(`hi ${hey}`)'))
      .toMatchInlineSnapshot('[Error: Could only use literals in import.meta.globNext]')
  })

  it('to be string', () => {
    expect(runError('import.meta.globNext(1)'))
      .toMatchInlineSnapshot('[Error: Expected glob to be a string, but got "number"]')
  })

  it('be array variable', () => {
    expect(runError('import.meta.globNext([hey])'))
      .toMatchInlineSnapshot('[Error: Could only use literals in import.meta.globNext]')
    expect(runError('import.meta.globNext(["1", hey])'))
      .toMatchInlineSnapshot('[Error: Could only use literals in import.meta.globNext]')
  })

  it('options', () => {
    expect(runError('import.meta.globNext("hey", hey)'))
      .toMatchInlineSnapshot('[Error: Expected the second argument of import.meta.globNext to be a object literal, but got "Identifier"]')
    expect(runError('import.meta.globNext("hey", [])'))
      .toMatchInlineSnapshot('[Error: Expected the second argument of import.meta.globNext to be a object literal, but got "ArrayExpression"]')
  })

  it('options props', () => {
    expect(runError('import.meta.globNext("hey", { hey: 1 })'))
      .toMatchInlineSnapshot('[Error: Unknown options hey]')
    expect(runError('import.meta.globNext("hey", { expect: hey })'))
      .toMatchInlineSnapshot('[Error: Could only use literals in import.meta.globNext]')
    expect(runError('import.meta.globNext("hey", { eager: 123 })'))
      .toMatchInlineSnapshot('[Error: Expect the type of option "eager" to be "boolean", but got "number"]')
  })
})
