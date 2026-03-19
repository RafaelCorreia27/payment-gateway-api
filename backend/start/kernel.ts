import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.errorHandler(() => import('#exceptions/handler'))
server.use([() => import('#middleware/container_bindings_middleware')])
router.use([() => import('@adonisjs/core/bodyparser_middleware')])
server.use([() => import('@adonisjs/cors/cors_middleware')])
