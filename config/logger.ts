export default {
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      level: process.env.LOG_LEVEL || 'info',
    },
  },
}
