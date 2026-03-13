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
  | Providers
  |--------------------------------------------------------------------------
  */
  providers: [
    () => import('@adonisjs/lucid/database'),
  ],
}
