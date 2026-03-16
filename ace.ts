/*
|--------------------------------------------------------------------------
| Ace entrypoint
|--------------------------------------------------------------------------
|
| The "ace.ts" file is the entrypoint for executing ace commands.
|
*/

import { Ignitor, prettyPrintError } from '@adonisjs/core'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands.
 * Em produção (Docker) o WORKDIR é /app/build, então usamos process.cwd().
 */
const APP_ROOT =
  process.env.NODE_ENV === 'production'
    ? new URL('file://' + process.cwd() + '/')
    : new URL('./', import.meta.url)

/**
 * The ignitor will let you execute ace commands
 */
const ignitor = new Ignitor(APP_ROOT, {
  importer: (url: string | URL) => {
    const specifier = typeof url === 'string' ? url : url.href
    return import(specifier)
  },
})

/**
 * Execute ace command
 */
try {
  await ignitor.ace().handle(process.argv.slice(2))
} catch (error) {
  await prettyPrintError(error)
  process.exit(1)
}
