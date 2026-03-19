import { Ignitor, prettyPrintError } from '@adonisjs/core'

// Em produção (Docker) usa process.cwd() pra migrations rodarem
const APP_ROOT =
  process.env.NODE_ENV === 'production'
    ? new URL('file://' + process.cwd() + '/')
    : new URL('./', import.meta.url)

const ignitor = new Ignitor(APP_ROOT, {
  importer: (url: string | URL) => {
    const specifier = typeof url === 'string' ? url : url.href
    return import(specifier)
  },
})

try {
  await ignitor.ace().handle(process.argv.slice(2))
} catch (error) {
  await prettyPrintError(error)
  process.exit(1)
}
