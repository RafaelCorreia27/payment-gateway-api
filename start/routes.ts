/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import PurchaseController from '#controllers/purchase_controller'
import GatewayController from '#controllers/gateway_controller'
import AuthMiddleware from '#middleware/auth_middleware'
import roleMiddleware from '#middleware/role_middleware'
import { UserRole } from '#types/user_role'

// Rota de teste
router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// ============================================
// Rotas Públicas (não requerem autenticação)
// ============================================

// Autenticação
router.post('/login', [AuthController, 'login'])

// Compras (Transações)
router.post('/purchases', [PurchaseController, 'store'])

// ============================================
// Rotas Privadas (requerem autenticação)
// ============================================

// Exemplo de rota protegida (requer autenticação)
router.get('/me', [AuthMiddleware], async ({ authUser, response }) => {
  return response.ok({
    user: {
      id: authUser!.id,
      email: authUser!.email,
      role: authUser!.role,
    },
  })
})

// Exemplo de rota protegida com role específica (requer ADMIN ou MANAGER)
router.get('/admin-only', [AuthMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.MANAGER])], async ({ response }) => {
  return response.ok({
    message: 'This route is only accessible to ADMIN or MANAGER users',
  })
})

// Gateways (requer ADMIN ou MANAGER)
router
  .group(() => {
    router.patch('/gateways/:id/toggle', [GatewayController, 'toggle'])
    router.patch('/gateways/:id/priority', [GatewayController, 'updatePriority'])
    router.patch('/gateways/:id', [GatewayController, 'update'])
  })
  .use([AuthMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.MANAGER])])
