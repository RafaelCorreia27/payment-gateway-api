import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import bcrypt from 'bcrypt'
import { UserRole } from '#types/user_role'

export default class extends BaseSeeder {
  async run() {
    const adminEmail = 'admin@paymentgateway.com'
    const adminPassword = 'admin123'
    const existingAdmin = await User.findBy('email', adminEmail)

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10)

      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
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
