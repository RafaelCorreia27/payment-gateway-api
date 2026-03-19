import router from '@adonisjs/core/services/router'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import AuthController from '#controllers/auth_controller'
import PurchaseController from '#controllers/purchase_controller'
import GatewayController from '#controllers/gateway_controller'
import UserController from '#controllers/user_controller'
import ProductController from '#controllers/product_controller'
import ClientController from '#controllers/client_controller'
import TransactionController from '#controllers/transaction_controller'
import roleMiddleware from '#middleware/role_middleware'
import { UserRole } from '#types/user_role'
import { ApiResponse } from '#services/api_response'
import User from '#models/user'
import type { JwtPayload } from '#types/jwt'

router.get('/', async () => {
  return { hello: 'world' }
})

router.post('/login', [AuthController, 'login'])
router.post('/purchases', [PurchaseController, 'store'])

// /me: validação do token no handler pra garantir 401 com token inválido no Docker
router.get('/me', async (ctx) => {
  const authHeader = ctx.request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ctx.response.unauthorized(
      ApiResponse.error('Authentication required. Please provide a valid token.', null, 'UNAUTHORIZED')
    )
  }
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, env.get('JWT_SECRET')) as JwtPayload
    const found = await User.find(decoded.userId)
    if (!found) {
      return ctx.response.unauthorized(
        ApiResponse.error('User not found', null, 'USER_NOT_FOUND')
      )
    }
    return ctx.response.ok(
      ApiResponse.success(
        {
          user: {
            id: found.id,
            email: found.email,
            role: found.role,
          },
        },
        'User retrieved successfully'
      )
    )
  } catch {
    return ctx.response.unauthorized(
      ApiResponse.error('Invalid token', null, 'INVALID_TOKEN')
    )
  }
})

router
  .get('/admin-only', async (ctx) => {
    return ctx.response.ok({
      message: 'This route is only accessible to ADMIN or MANAGER users',
    })
  })
  .use(() => import('#middleware/auth_middleware'))
  .use(roleMiddleware([UserRole.ADMIN, UserRole.MANAGER]))

router
  .group(() => {
    router.patch('/gateways/:id/toggle', [GatewayController, 'toggle'])
    router.patch('/gateways/:id/priority', [GatewayController, 'updatePriority'])
    router.patch('/gateways/:id', [GatewayController, 'update'])
  })
  .use(() => import('#middleware/auth_middleware'))
  .use(roleMiddleware([UserRole.ADMIN, UserRole.MANAGER]))

router
  .group(() => {
    router.get('/users', [UserController, 'index'])
    router.get('/users/:id', [UserController, 'show'])
    router.post('/users', [UserController, 'store'])
    router.put('/users/:id', [UserController, 'update'])
    router.delete('/users/:id', [UserController, 'destroy'])
  })
  .use(() => import('#middleware/auth_middleware'))
  .use(roleMiddleware([UserRole.ADMIN, UserRole.MANAGER]))

router
  .group(() => {
    router.get('/products', [ProductController, 'index'])
    router.get('/products/:id', [ProductController, 'show'])
    router.post('/products', [ProductController, 'store'])
    router.put('/products/:id', [ProductController, 'update'])
    router.delete('/products/:id', [ProductController, 'destroy'])
  })
  .use(() => import('#middleware/auth_middleware'))
  .use(roleMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE]))

router
  .group(() => {
    router.get('/clients', [ClientController, 'index'])
    router.get('/clients/:id', [ClientController, 'show'])
  })
  .use(() => import('#middleware/auth_middleware'))

router
  .group(() => {
    router.get('/transactions', [TransactionController, 'index'])
    router.get('/transactions/:id', [TransactionController, 'show'])
  })
  .use(() => import('#middleware/auth_middleware'))

router
  .post('/transactions/:id/refund', [TransactionController, 'refund'])
  .use(() => import('#middleware/auth_middleware'))
  .use(roleMiddleware([UserRole.ADMIN, UserRole.FINANCE]))
