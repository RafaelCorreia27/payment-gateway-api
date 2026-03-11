import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'

export default class extends BaseSeeder {
  async run() {
    /**
     * Seeder para criar os gateways iniciais
     * Gateway 1: Prioridade 1 (será tentado primeiro)
     * Gateway 2: Prioridade 2 (será tentado se Gateway 1 falhar)
     */
    await Gateway.updateOrCreateMany(
      'name',
      [
        {
          name: 'Gateway 1',
          isActive: true,
          priority: 1,
        },
        {
          name: 'Gateway 2',
          isActive: true,
          priority: 2,
        },
      ]
    )
  }
}
