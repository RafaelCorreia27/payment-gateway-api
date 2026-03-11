import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Transaction from './transaction.js'
import Product from './product.js'

export default class TransactionProduct extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare transactionId: number

  @column()
  declare productId: number

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Relacionamento: Um transaction_product pertence a uma transação
   */
  @belongsTo(() => Transaction)
  declare transaction: BelongsTo<typeof Transaction>

  /**
   * Relacionamento: Um transaction_product pertence a um produto
   */
  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
