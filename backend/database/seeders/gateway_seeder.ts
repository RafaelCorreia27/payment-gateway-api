import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'

export default class extends BaseSeeder {
  async run() {
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
