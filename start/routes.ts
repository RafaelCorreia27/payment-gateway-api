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
