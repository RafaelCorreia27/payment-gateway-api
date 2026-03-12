/**
 * Tipos para requisições e respostas dos gateways
 */

/**
 * Dados necessários para criar uma transação
 */
export interface CreateTransactionRequest {
  amount: number // Valor em centavos
  name: string // Nome do comprador
  email: string // Email do comprador
  cardNumber: string // Número do cartão (16 dígitos)
  cvv: string // CVV do cartão
}

/**
 * Resposta de criação de transação
 */
export interface CreateTransactionResponse {
  success: boolean
  transactionId?: string // ID da transação no gateway
  externalId?: string // ID externo retornado pelo gateway
  message?: string
  error?: string
}

/**
 * Dados necessários para fazer reembolso
 */
export interface RefundTransactionRequest {
  transactionId: string // ID da transação no gateway
  externalId?: string // ID externo (se necessário)
}

/**
 * Resposta de reembolso
 */
export interface RefundTransactionResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * Resposta de listagem de transações
 */
export interface ListTransactionsResponse {
  success: boolean
  transactions?: Array<{
    id: string
    amount: number
    status: string
    [key: string]: any
  }>
  error?: string
}
