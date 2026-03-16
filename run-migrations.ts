// Roda migrations (local: npx tsx run-migrations.ts | Docker: node ace.js migration:run)
import { execSync } from 'node:child_process'

try {
  execSync('node ace.js migration:run', {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
} catch {
  process.exit(1)
}
