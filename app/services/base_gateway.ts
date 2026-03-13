import type { IGateway } from './interfaces/igateway.js'
import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
  RefundTransactionRequest,
  RefundTransactionResponse,
  ListTransactionsResponse,
} from '#types/gateway'
import axios, { AxiosInstance, AxiosError } from 'axios'

/**
 * Classe base abstrata para implementação de gateways
 * 
 * Fornece funcionalidades comuns como:
 * - Cliente HTTP (axios) configurado
 * - Tratamento de erros padronizado
 * - Métodos auxiliares
 * 
 * Cada gateway específico deve estender esta classe e implementar
 * os métodos abstratos da interface IGateway.
 */
export abstract class BaseGateway implements IGateway {
  abstract readonly name: string
  abstract readonly baseUrl: string

  /**
   * Cliente HTTP configurado para fazer requisições ao gateway
   * Inicializado de forma lazy na primeira vez que é acessado
   */
  protected _httpClient: AxiosInstance | null = null

  /**
   * Getter que inicializa o httpClient de forma lazy
   * Isso permite acessar baseUrl após a construção da classe filha
   */
  protected get httpClient(): AxiosInstance {
    if (!this._httpClient) {
      this._httpClient = axios.create({
        baseURL: this.baseUrl,
        timeout: 30000, // 30 segundos
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    return this._httpClient
  }

  /**
   * Método abstrato que deve ser implementado por cada gateway
   */
  abstract createTransaction(data: CreateTransactionRequest): Promise<CreateTransactionResponse>

  /**
   * Método abstrato que deve ser implementado por cada gateway
   */
  abstract refundTransaction(data: RefundTransactionRequest): Promise<RefundTransactionResponse>

  /**
   * Método opcional para listar transações
   * Pode ser sobrescrito por gateways que suportam essa funcionalidade
   * Por padrão, retorna erro indicando que não está implementado
   */
  async listTransactions(): Promise<ListTransactionsResponse> {
    return {
      success: false,
      error: `List transactions not implemented for ${this.name}`,
    }
  }

  /**
   * Trata erros HTTP de forma padronizada
   * 
   * @param error Erro do axios
   * @returns Resposta de erro padronizada
   */
  protected handleError(error: unknown): CreateTransactionResponse | RefundTransactionResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError

      // Erro de timeout ou conexão
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: `Gateway ${this.name} is unavailable`,
        }
      }

      // Erro de resposta HTTP (4xx, 5xx)
      if (axiosError.response) {
        const status = axiosError.response.status
        const data = axiosError.response.data as any

        return {
          success: false,
          error: data?.message || data?.error || `Gateway returned error: ${status}`,
        }
      }

      // Erro de requisição (sem resposta)
      return {
        success: false,
        error: `Failed to connect to ${this.name}`,
      }
    }

    // Erro desconhecido
    return {
      success: false,
      error: `Unexpected error in ${this.name}`,
    }
  }

  /**
   * Valida se os dados da transação estão corretos
   * 
   * @param data Dados da transação
   * @returns true se válido, false caso contrário
   */
  protected validateTransactionData(data: CreateTransactionRequest): boolean {
    if (!data.amount || data.amount <= 0) {
      return false
    }

    if (!data.cardNumber || data.cardNumber.length !== 16) {
      return false
    }

    // Valida CVV (3-4 dígitos)
    if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
      return false
    }

    // Valida email básico
    if (!data.email || !data.email.includes('@')) {
      return false
    }

    // Valida nome (não vazio)
    if (!data.name || data.name.trim().length === 0) {
      return false
    }

    return true
  }
}
