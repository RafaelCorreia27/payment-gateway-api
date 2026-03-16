/*
|--------------------------------------------------------------------------
| AdonisJS RC File
|--------------------------------------------------------------------------
|
| This file is used to configure the AdonisJS application.
| In AdonisJS v6, this file uses a simple object structure.
|
*/

export default {
  /*
  |--------------------------------------------------------------------------
  | App key
  |--------------------------------------------------------------------------
  |
  | The appKey is used for encrypting cookies, generating signed URLs,
  | and by the "encryption" module.
  |
  */
  appKey: process.env.APP_KEY || '',

  http: {
    allowMethodSpoofing: false,
    trustProxy: false,
    forceContentNegotiationTo: 'application/json',
  },

  /*
  |--------------------------------------------------------------------------
  | Directories
  |--------------------------------------------------------------------------
  */
  directories: {
    commands: './commands',
    migrations: './database/migrations',
    seeders: './database/seeders',
  },

  /*
  |--------------------------------------------------------------------------
  | Commands (core + lucid para build, serve, migration, etc.)
  |--------------------------------------------------------------------------
  */
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Preloads
  |--------------------------------------------------------------------------
  | Ordem: kernel primeiro (registra middleware: bodyparser, CORS, etc.),
  | depois routes (registra rotas). Sem kernel, o body do POST não é parseado (422).
  */
  preloads: [
    () => import('#start/kernel'),
    () => import('#start/routes'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Providers
  |--------------------------------------------------------------------------
  | app_provider: registra serviços base e o servidor HTTP no container.
  | database_provider: Lucid ORM (caminho correto é database_provider, não database).
  */
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/cors/cors_provider'),
    () => import('@adonisjs/lucid/database_provider'),
  ],
}
