import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Transaction from './transaction.js'
import TransactionProduct from './transaction_product.js'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare amount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Relacionamento: Um produto pode estar em muitas transações
   * Através da tabela pivot transaction_products
   */
  @manyToMany(() => Transaction, {
    pivotTable: 'transaction_products',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'transaction_id',
    pivotColumns: ['quantity'],
  })
  declare transactions: ReturnType<typeof Transaction.manyToMany>
}
