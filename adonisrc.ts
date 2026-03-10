import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
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
})
