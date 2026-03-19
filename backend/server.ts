import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

// Produção: usa href pra evitar erro de coerção no build
const APP_ROOT_URL = new URL('./', import.meta.url)
const APP_ROOT: URL | string =
  process.env.NODE_ENV === 'production' ? APP_ROOT_URL.href : APP_ROOT_URL

const ignitor = new Ignitor(APP_ROOT as URL, {
  importer: (url: string | URL) => import(typeof url === 'string' ? url : url.href),
})

try {
  await ignitor
    .httpServer()
    .start()
} catch (error) {
  await prettyPrintError(error)
  process.exit(1)
}
