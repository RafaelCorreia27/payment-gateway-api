/*
|--------------------------------------------------------------------------
| Seed runner entrypoint (JavaScript)
|--------------------------------------------------------------------------
|
| Carrega run-seed.ts via ts-node. Use no container quando
| "node ace.js db:seed" falha com "Cannot convert object to primitive value".
|
*/
import { register } from 'node:module'
register('ts-node/esm', import.meta.url)
await import('./run-seed.ts')
