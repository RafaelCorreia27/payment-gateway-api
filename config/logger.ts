/**
 * Configuração do logger (necessária para o AdonisJS)
 * Usado pelo framework para logs da aplicação.
 */
export default {
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      level: process.env.LOG_LEVEL || 'info',
    },
  },
}
