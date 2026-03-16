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

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => Gateway)
  declare gateway: BelongsTo<typeof Gateway>

  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
    pivotForeignKey: 'transaction_id',
    pivotRelatedForeignKey: 'product_id',
    pivotColumns: ['quantity'],
  })
  declare products: ManyToMany<typeof Product>

  @hasMany(() => TransactionProduct)
  declare transactionProducts: HasMany<typeof TransactionProduct>
}
