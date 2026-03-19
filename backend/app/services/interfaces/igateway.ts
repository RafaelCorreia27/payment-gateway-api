import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
  RefundTransactionRequest,
  RefundTransactionResponse,
  ListTransactionsResponse,
} from '#types/gateway'

export interface IGateway {
  readonly name: string
  readonly baseUrl: string

  createTransaction(data: CreateTransactionRequest): Promise<CreateTransactionResponse>
  refundTransaction(data: RefundTransactionRequest): Promise<RefundTransactionResponse>
  listTransactions(): Promise<ListTransactionsResponse>
}
