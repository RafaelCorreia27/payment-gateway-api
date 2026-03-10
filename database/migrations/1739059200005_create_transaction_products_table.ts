import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transaction_products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('transaction_id').unsigned().references('id').inTable('transactions').onDelete('CASCADE').notNullable()
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').notNullable()
      table.integer('quantity').notNullable().defaultTo(1)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      
      table.unique(['transaction_id', 'product_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
