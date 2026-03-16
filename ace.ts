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
 * Em produção (container) passamos href (string) para evitar
 * "Cannot convert object to primitive value"; no build usamos URL.
 */
const APP_ROOT_URL = new URL('./', import.meta.url)
const APP_ROOT: URL | string =
  process.env.NODE_ENV === 'production' ? APP_ROOT_URL.href : APP_ROOT_URL

/**
 * The ignitor will let you execute ace commands
 */
const ignitor = new Ignitor(APP_ROOT as URL, {
  importer: (url: string | URL) => import(typeof url === 'string' ? url : url.href),
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
