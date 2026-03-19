import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,
  origin: true, // Permite qualquer origem (rotas públicas)
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  headers: true, // Permite todos os headers
  exposeHeaders: [],
  credentials: true, // Permite cookies/credenciais
  maxAge: 90, // Cache do preflight request (90 segundos)
})

export default corsConfig
