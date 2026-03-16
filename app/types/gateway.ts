export interface CreateTransactionRequest {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export interface CreateTransactionResponse {
  success: boolean
  transactionId?: string
  externalId?: string
  message?: string
  error?: string
}

export interface RefundTransactionRequest {
  transactionId: string
  externalId?: string
}

export interface RefundTransactionResponse {
  success: boolean
  message?: string
  error?: string
}

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
