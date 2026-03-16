/*
|--------------------------------------------------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands.
 * Em produção passamos href (string) para evitar coerção a primitivo.
 */
const APP_ROOT_URL = new URL('./', import.meta.url)
const APP_ROOT: URL | string =
  process.env.NODE_ENV === 'production' ? APP_ROOT_URL.href : APP_ROOT_URL

/**
 * The ignitor will let you start the AdonisJS application
 */
const ignitor = new Ignitor(APP_ROOT as URL, {
  importer: (url: string | URL) => import(typeof url === 'string' ? url : url.href),
})

/**
 * Start the HTTP server
 */
try {
  await ignitor
    .httpServer()
    .start()
} catch (error) {
  await prettyPrintError(error)
  process.exit(1)
}
