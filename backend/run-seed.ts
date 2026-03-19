/*
|--------------------------------------------------------------------------
| Seed runner (alternativo ao "node ace db:seed")
|--------------------------------------------------------------------------
|
| Roda os seeders sem passar pelo comando Ace (evita erro de primitive no db:seed).
| Lista de seeders fixa para não chamar getList() que usa appRoot em contexto que falha.
|
*/
import 'reflect-metadata'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'
import { Ignitor } from '@adonisjs/core'

const APP_ROOT = new URL('./', import.meta.url)
const ROOT_DIR = fileURLToPath(APP_ROOT)

const ignitor = new Ignitor(APP_ROOT, {
  importer: (url: string | URL) => import(typeof url === 'string' ? url : url.href),
})

const SEEDER_FILES = ['user_seeder', 'gateway_seeder']

function buildSeederFile(name: string) {
  const dir = join(ROOT_DIR, 'database', 'seeders')
  const absPath = join(dir, `${name}.ts`)
  const pathName = `database/seeders/${name}`
  return {
    name: pathName,
    absPath,
    async getSource() {
      const mod = await import(pathToFileURL(absPath).href)
      if (!mod.default) throw new Error(`Missing default export from "${pathName}"`)
      return mod.default
    },
  }
}

async function main() {
  const app = ignitor.createApp('console')
  await app.init()
  await app.boot()
  await app.start(() => {})

  const db = await app.container.make('lucid.db')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error path exists at runtime in node_modules
  const { SeedsRunner } = await import('@adonisjs/lucid/build/src/seeders/runner.js')
  const seeder = new SeedsRunner(db, app, db.primaryConnectionName)

  const files = SEEDER_FILES.map(buildSeederFile)
  for (const file of files) {
    const result = await seeder.run(file)
    const status = result.status === 'completed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️'
    console.log(`${status} ${file.name}`)
    if (result.status === 'failed' && result.error) {
      console.error(result.error.message)
      await seeder.close()
      await app.terminate()
      process.exit(1)
    }
  }

  await seeder.close()
  await app.terminate()
  console.log('Seed concluído.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err?.message ?? String(err))
  if (err?.stack) console.error(err.stack)
  process.exit(1)
})
