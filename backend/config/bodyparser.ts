import { defineConfig } from '@adonisjs/bodyparser'

const bodyParserConfig = defineConfig({
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
})

export default bodyParserConfig
