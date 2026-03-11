import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import bcrypt from 'bcrypt'

export default class extends BaseSeeder {
  async run() {
    /**
     * Seeder para criar usuário admin padrão
     * Email: admin@paymentgateway.com
     * Senha: admin123 (deve ser alterada em produção)
     * Role: ADMIN
     */
    const adminEmail = 'admin@paymentgateway.com'
    const adminPassword = 'admin123'

    // Verifica se o usuário admin já existe
    const existingAdmin = await User.findBy('email', adminEmail)

    if (!existingAdmin) {
      // Cria o hash da senha usando bcrypt
      // Salt rounds: 10 (padrão recomendado)
      const hashedPassword = await bcrypt.hash(adminPassword, 10)

      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      })

      console.log('✅ Usuário admin criado com sucesso!')
      console.log(`   Email: ${adminEmail}`)
      console.log(`   Senha: ${adminPassword}`)
      console.log('   ⚠️  IMPORTANTE: Altere a senha em produção!')
    } else {
      console.log('ℹ️  Usuário admin já existe, pulando criação.')
    }
  }
}
