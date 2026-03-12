import { BaseGateway } from './base_gateway.js'
import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
  RefundTransactionRequest,
  RefundTransactionResponse,
  ListTransactionsResponse,
} from '#types/gateway'
import env from '#start/env'
import axios, { AxiosError } from 'axios'

/**
 * Interface para resposta de criação de transação do Gateway 2
 */
interface Gateway2CreateTransactionResponse {
  id: string
  status: string
  [key: string]: any
}

/**
 * Service para integração com Gateway 2
 * 
 * Gateway 2 utiliza autenticação via headers fixos:
 * - Gateway-Auth-Token: token fixo
 * - Gateway-Auth-Secret: secret fixo
 * 
 * Não requer login, apenas envia os headers em todas as requisições.
 * 
 * Diferenças do Gateway 1:
 * - Campos em português (valor, nome, email, numeroCartao, cvv)
 * - Endpoint de reembolso: POST /transacoes/reembolso (não /transactions/:id/charge_back)
 * - CVV inválido: 200 ou 300 (não 100 ou 200)
 */
export class Gateway2Service extends BaseGateway {
  readonly name = 'Gateway 2'
  readonly baseUrl: string = env.get('GATEWAY_2_URL')

  /**
   * Headers de autenticação fixos do Gateway 2
   * Armazenados em propriedades para facilitar manutenção
   */
  private readonly authToken: string = env.get('GATEWAY_2_AUTH_TOKEN')
  private readonly authSecret: string = env.get('GATEWAY_2_AUTH_SECRET')

  /**
   * Retorna os headers de autenticação do Gateway 2
   * 
   * @returns Objeto com headers de autenticação
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Gateway-Auth-Token': this.authToken,
      'Gateway-Auth-Secret': this.authSecret,
    }
  }

  /**
   * Converte dados padronizados (CreateTransactionRequest) para formato do Gateway 2
   * Gateway 2 usa campos em português
   * 
   * @param data Dados padronizados
   * @returns Dados no formato do Gateway 2
   */
  private convertToGateway2Format(data: CreateTransactionRequest): Record<string, any> {
    return {
      valor: data.amount,
      nome: data.name,
      email: data.email,
      numeroCartao: data.cardNumber,
      cvv: data.cvv,
    }
  }

  /**
   * Cria uma nova transação no Gateway 2
   * 
   * @param data Dados da transação
   * @returns Resposta com sucesso/erro e ID da transação
   */
  async createTransaction(data: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    try {
      // Valida os dados antes de enviar
      if (!this.validateTransactionData(data)) {
        return {
          success: false,
          error: 'Invalid transaction data',
        }
      }

      // Converte para formato do Gateway 2
      const gateway2Data = this.convertToGateway2Format(data)

      // Faz a requisição de criação de transação
      const response = await axios.post<Gateway2CreateTransactionResponse>(
        `${this.baseUrl}/transacoes`,
        gateway2Data,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
          },
        }
      )

      // Verifica se a resposta indica sucesso
      if (response.data?.id) {
        return {
          success: true,
          transactionId: response.data.id,
          externalId: response.data.id,
          message: 'Transaction created successfully',
        }
      }

      return {
        success: false,
        error: 'Transaction creation failed: Invalid response',
      }
    } catch (error) {
      // Trata erros específicos do Gateway 2
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        // Erro específico de CVV inválido (200 ou 300)
        if (axiosError.response?.status === 400 || axiosError.response?.status === 422) {
          const errorData = axiosError.response.data as any
          const errorMessage = errorData?.message || errorData?.error || 'Invalid card data'

          return {
            success: false,
            error: errorMessage,
          }
        }

        // Erro de autenticação (401) - headers inválidos
        if (axiosError.response?.status === 401) {
          return {
            success: false,
            error: 'Authentication failed: Invalid gateway credentials',
          }
        }
      }

      // Usa o tratamento de erro padrão da classe base
      return this.handleError(error) as CreateTransactionResponse
    }
  }

  /**
   * Realiza reembolso de uma transação no Gateway 2
   * 
   * Gateway 2 usa endpoint diferente: POST /transacoes/reembolso
   * E formato diferente: body com "id" (UUID)
   * 
   * @param data Dados do reembolso (ID da transação)
   * @returns Resposta com sucesso/erro
   */
  async refundTransaction(data: RefundTransactionRequest): Promise<RefundTransactionResponse> {
    try {
      // Valida se tem ID da transação
      if (!data.transactionId) {
        return {
          success: false,
          error: 'Transaction ID is required',
        }
      }

      // Gateway 2 espera o ID no body, não na URL
      const refundBody = {
        id: data.transactionId,
      }

      // Faz a requisição de reembolso
      const response = await axios.post(
        `${this.baseUrl}/transacoes/reembolso`,
        refundBody,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
          },
        }
      )

      // Verifica se a resposta indica sucesso
      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          message: 'Refund processed successfully',
        }
      }

      return {
        success: false,
        error: 'Refund failed: Invalid response',
      }
    } catch (error) {
      // Trata erros específicos do Gateway 2
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        // Erro de transação não encontrada (404)
        if (axiosError.response?.status === 404) {
          return {
            success: false,
            error: 'Transaction not found',
          }
        }

        // Erro de autenticação (401)
        if (axiosError.response?.status === 401) {
          return {
            success: false,
            error: 'Authentication failed: Invalid gateway credentials',
          }
        }

        // Erro de validação (400) - ID inválido
        if (axiosError.response?.status === 400) {
          const errorData = axiosError.response.data as any
          return {
            success: false,
            error: errorData?.message || errorData?.error || 'Invalid transaction ID',
          }
        }
      }

      // Usa o tratamento de erro padrão da classe base
      return this.handleError(error) as RefundTransactionResponse
    }
  }

  /**
   * Lista transações do Gateway 2
   * 
   * @returns Lista de transações
   */
  async listTransactions(): Promise<ListTransactionsResponse> {
    try {
      // Faz a requisição de listagem
      const response = await axios.get(`${this.baseUrl}/transacoes`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      })

      // Retorna a lista de transações
      // Gateway 2 pode retornar em diferentes formatos
      return {
        success: true,
        transactions: Array.isArray(response.data) ? response.data : response.data?.transacoes || response.data?.transactions || [],
      }
    } catch (error) {
      // Trata erros
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        // Erro de autenticação (401)
        if (axiosError.response?.status === 401) {
          return {
            success: false,
            error: 'Authentication failed: Invalid gateway credentials',
          }
        }
      }

      return {
        success: false,
        error: 'Failed to list transactions',
      }
    }
  }
}
