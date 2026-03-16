/*
|--------------------------------------------------------------------------
| Script para rodar migrations (uso local ou em ambiente com tsx)
|--------------------------------------------------------------------------
|
| Uso: npx tsx run-migrations.ts
|
| No Docker (imagem de produção), use:
|   docker compose exec app node ace.js migration:run
|
*/
import { execSync } from 'node:child_process'

try {
  execSync('node ace.js migration:run', {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
} catch {
  process.exit(1)
}
