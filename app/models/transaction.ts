import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Client from './client.js'
import Gateway from './gateway.js'
import Product from './product.js'
import TransactionProduct from './transaction_product.js'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: number

  @column()
  declare gatewayId: number | null

  @column()
  declare externalId: string | null

  @column()
  declare status: 'pending' | 'approved' | 'rejected' | 'refunded'

  @column()
  declare amount: number

  @column()
  declare cardLastNumbers: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Relacionamento: Uma transação pertence a um cliente
   */
  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  /**
   * Relacionamento: Uma transação pertence a um gateway (pode ser null)
   */
  @belongsTo(() => Gateway)
  declare gateway: BelongsTo<typeof Gateway>

  /**
   * Relacionamento: Uma transação tem muitos produtos (através da tabela pivot)
   */
  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
    pivotForeignKey: 'transaction_id',
    pivotRelatedForeignKey: 'product_id',
    pivotColumns: ['quantity'],
  })
  declare products: ManyToMany<typeof Product>

  /**
   * Relacionamento: Uma transação tem muitos transaction_products
   * (acesso direto à tabela pivot com informações adicionais)
   */
  @hasMany(() => TransactionProduct)
  declare transactionProducts: HasMany<typeof TransactionProduct>
}
