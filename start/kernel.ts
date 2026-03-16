/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * The error handler is used to convert an exception
 * to a HTTP response.
 */
server.errorHandler(() => import('#exceptions/handler'))

/**
 * The server middleware stack runs on all the HTTP requests
 * even if there is no route registered for the request URL
 * Nota: force_json_response_middleware foi removido pois mutar request.headers()
 * pode causar 500 (objeto read-only); adonisrc já tem forceContentNegotiationTo: 'application/json'
 */
server.use([() => import('#middleware/container_bindings_middleware')])

/**
 * The router middleware stack runs on all the HTTP requests
 * with a registered route
 */
router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
])

/**
 * The server middleware stack runs on all the HTTP requests
 * even if there is no route registered for the request URL
 */
server.use([() => import('@adonisjs/cors/cors_middleware')])
