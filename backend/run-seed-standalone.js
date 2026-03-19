#!/usr/bin/env node
// Seed direto no MySQL (quando ace db:seed falha no container)
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'

const env = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'payment_user',
  password: process.env.MYSQL_PASSWORD || 'payment_pass',
  database: process.env.MYSQL_DB_NAME || 'payment_gateway',
}

const ADMIN_EMAIL = 'admin@paymentgateway.com'
const ADMIN_PASSWORD = 'admin123'
const GATEWAYS = [
  { name: 'Gateway 1', is_active: 1, priority: 1 },
  { name: 'Gateway 2', is_active: 1, priority: 2 },
]

async function main() {
  const conn = await mysql.createConnection({
    host: env.host,
    port: env.port,
    user: env.user,
    password: env.password,
    database: env.database,
  })

  try {
    // 1. Admin user
    const [rows] = await conn.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [ADMIN_EMAIL]
    )
    if (rows.length === 0) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
      const now = new Date()
      await conn.execute(
        'INSERT INTO users (email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [ADMIN_EMAIL, hash, 'ADMIN', now, now]
      )
      console.log('✅ Usuário admin criado:', ADMIN_EMAIL)
    } else {
      console.log('ℹ️  Usuário admin já existe')
    }

    // 2. Gateways
    for (const gw of GATEWAYS) {
      const [existing] = await conn.execute(
        'SELECT id FROM gateways WHERE name = ? LIMIT 1',
        [gw.name]
      )
      const now = new Date()
      if (existing.length === 0) {
        await conn.execute(
          'INSERT INTO gateways (name, is_active, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [gw.name, gw.is_active, gw.priority, now, now]
        )
        console.log('✅ Gateway criado:', gw.name)
      } else {
        await conn.execute(
          'UPDATE gateways SET is_active = ?, priority = ?, updated_at = ? WHERE name = ?',
          [gw.is_active, gw.priority, now, gw.name]
        )
        console.log('ℹ️  Gateway atualizado:', gw.name)
      }
    }

    // 3. Produto padrão (para testes de compra - POST /purchases)
    const [prodRows] = await conn.execute('SELECT id FROM products LIMIT 1')
    if (prodRows.length === 0) {
      const now = new Date()
      await conn.execute(
        'INSERT INTO products (name, amount, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['Produto Seed', 5000, now, now]
      )
      console.log('✅ Produto criado: Produto Seed (id 1)')
    } else {
      console.log('ℹ️  Produtos já existem')
    }

    console.log('Seed concluído.')
  } finally {
    await conn.end()
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
