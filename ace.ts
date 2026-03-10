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
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The ignitor will let you execute ace commands
 */
const ignitor = new Ignitor(APP_ROOT, { importer: (url) => import(url) })

/**
 * Pretty print errors
 */
ignitor.onError((error) => {
  console.error(prettyPrintError(error))
  process.exit(1)
})

/**
 * Execute ace command
 */
await ignitor.exec()
