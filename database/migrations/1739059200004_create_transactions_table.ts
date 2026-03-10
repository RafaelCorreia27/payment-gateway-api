import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('client_id').unsigned().references('id').inTable('clients').onDelete('CASCADE').notNullable()
      table.integer('gateway_id').unsigned().references('id').inTable('gateways').onDelete('SET NULL').nullable()
      table.string('external_id', 255).nullable().comment('ID retornado pelo gateway')
      table.enum('status', ['pending', 'approved', 'rejected', 'refunded']).defaultTo('pending').notNullable()
      table.integer('amount').notNullable().comment('Valor total em centavos')
      table.string('card_last_numbers', 4).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
