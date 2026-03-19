import type { IGateway } from './interfaces/igateway.js'
import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
  RefundTransactionRequest,
  RefundTransactionResponse,
  ListTransactionsResponse,
} from '#types/gateway'
import axios, { AxiosInstance, AxiosError } from 'axios'

export abstract class BaseGateway implements IGateway {
  abstract readonly name: string
  abstract readonly baseUrl: string

  protected _httpClient: AxiosInstance | null = null

  protected get httpClient(): AxiosInstance {
    if (!this._httpClient) {
      this._httpClient = axios.create({
        baseURL: this.baseUrl,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    return this._httpClient
  }

  abstract createTransaction(data: CreateTransactionRequest): Promise<CreateTransactionResponse>
  abstract refundTransaction(data: RefundTransactionRequest): Promise<RefundTransactionResponse>

  async listTransactions(): Promise<ListTransactionsResponse> {
    return {
      success: false,
      error: `List transactions not implemented for ${this.name}`,
    }
  }

  protected handleError(error: unknown): CreateTransactionResponse | RefundTransactionResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError

      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: `Gateway ${this.name} is unavailable`,
        }
      }

      if (axiosError.response) {
        const status = axiosError.response.status
        const data = axiosError.response.data as any

        return {
          success: false,
          error: data?.message || data?.error || `Gateway returned error: ${status}`,
        }
      }

      return {
        success: false,
        error: `Failed to connect to ${this.name}`,
      }
    }

    return {
      success: false,
      error: `Unexpected error in ${this.name}`,
    }
  }

  protected validateTransactionData(data: CreateTransactionRequest): boolean {
    if (!data.amount || data.amount <= 0) return false
    if (!data.cardNumber || data.cardNumber.length !== 16) return false
    if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) return false
    if (!data.email || !data.email.includes('@')) return false
    if (!data.name || data.name.trim().length === 0) {
      return false
    }

    return true
  }
}
