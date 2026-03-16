/*
|--------------------------------------------------------------------------
| Ace entrypoint (JavaScript)
|--------------------------------------------------------------------------
|
| Node não executa .ts; este arquivo registra o loader do ts-node e
| importa ace.ts para que "node ace" funcione.
|
*/
import { register } from 'node:module'
register('ts-node/esm', import.meta.url)
await import('./ace.ts')
