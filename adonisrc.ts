export default {
  appKey: process.env.APP_KEY || '',

  http: {
    allowMethodSpoofing: false,
    trustProxy: false,
    forceContentNegotiationTo: 'application/json',
  },

  directories: {
    commands: './commands',
    migrations: './database/migrations',
    seeders: './database/seeders',
  },

  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
  ],

  preloads: [
    () => import('#start/kernel'),
    () => import('#start/routes'),
  ],

  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/cors/cors_provider'),
    () => import('@adonisjs/lucid/database_provider'),
  ],
}
