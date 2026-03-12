import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
  RefundTransactionRequest,
  RefundTransactionResponse,
  ListTransactionsResponse,
} from '#types/gateway'

/**
 * Interface que define o contrato que todos os gateways devem implementar
 * 
 * Esta interface garante que todos os gateways tenham os mesmos métodos,
 * facilitando a adição de novos gateways e a orquestração entre eles.
 */
export interface IGateway {
  /**
   * Nome do gateway (ex: "Gateway 1", "Gateway 2")
   */
  readonly name: string

  /**
   * URL base do gateway (ex: "http://localhost:3001")
   */
  readonly baseUrl: string

  /**
   * Cria uma nova transação no gateway
   * 
   * @param data Dados da transação (valor, nome, email, cartão, etc.)
   * @returns Resposta com sucesso/erro e ID da transação
   */
  createTransaction(data: CreateTransactionRequest): Promise<CreateTransactionResponse>

  /**
   * Realiza reembolso de uma transação
   * 
   * @param data Dados do reembolso (ID da transação)
   * @returns Resposta com sucesso/erro
   */
  refundTransaction(data: RefundTransactionRequest): Promise<RefundTransactionResponse>

  /**
   * Lista transações do gateway
   * Implementação padrão retorna erro, mas pode ser sobrescrita
   * 
   * @returns Lista de transações
   */
  listTransactions(): Promise<ListTransactionsResponse>
}
