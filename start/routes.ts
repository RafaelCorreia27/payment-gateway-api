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
import AuthMiddleware from '#middleware/auth_middleware'
import roleMiddleware from '#middleware/role_middleware'

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
router.get('/admin-only', [AuthMiddleware, roleMiddleware(['ADMIN', 'MANAGER'])], async ({ response }) => {
  return response.ok({
    message: 'This route is only accessible to ADMIN or MANAGER users',
  })
})
