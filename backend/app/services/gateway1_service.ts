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
import logger from '@adonisjs/core/services/logger'

interface Gateway1LoginResponse {
  token: string
  [key: string]: any
}

interface Gateway1CreateTransactionResponse {
  id: string
  status: string
  [key: string]: any
}

export class Gateway1Service extends BaseGateway {
  readonly name = 'Gateway 1'
  readonly baseUrl: string = env.get('GATEWAY_1_URL')

  private bearerToken: string | null = null
  private lastAuthTime: number = 0
  private readonly TOKEN_EXPIRY_TIME = 60 * 60 * 1000

  constructor() {
    super()
    this.httpClient.defaults.baseURL = this.baseUrl
  }

  private async authenticate(): Promise<boolean> {
    try {
      const now = Date.now()
      if (this.bearerToken && now - this.lastAuthTime < this.TOKEN_EXPIRY_TIME) {
        return true
      }

      const response = await axios.post<Gateway1LoginResponse>(
        `${this.baseUrl}/login`,
        {
          email: env.get('GATEWAY_1_EMAIL'),
          token: env.get('GATEWAY_1_TOKEN'),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.token) {
        this.bearerToken = response.data.token
        this.lastAuthTime = now
        return true
      }

      return false
    } catch (error) {
      logger.error({ err: error }, '[Gateway1Service] Authentication failed')
      return false
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    const isAuthenticated = await this.authenticate()
    if (!isAuthenticated) {
      throw new Error('Failed to authenticate with Gateway 1')
    }
  }

  async createTransaction(data: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    try {
      if (!this.validateTransactionData(data)) {
        return {
          success: false,
          error: 'Invalid transaction data',
        }
      }

      await this.ensureAuthenticated()

      const response = await axios.post<Gateway1CreateTransactionResponse>(
        `${this.baseUrl}/transactions`,
        {
          amount: data.amount,
          name: data.name,
          email: data.email,
          cardNumber: data.cardNumber,
          cvv: data.cvv,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.bearerToken}`,
          },
        }
      )

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
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.response?.status === 401) {
          this.bearerToken = null
          this.lastAuthTime = 0

          try {
            await this.ensureAuthenticated()
            return this.createTransaction(data)
          } catch (retryError) {
            return this.handleError(retryError) as CreateTransactionResponse
          }
        }

        if (axiosError.response?.status === 400 || axiosError.response?.status === 422) {
          const errorData = axiosError.response.data as any
          const errorMessage = errorData?.message || errorData?.error || 'Invalid card data'

          return {
            success: false,
            error: errorMessage,
          }
        }
      }

      return this.handleError(error) as CreateTransactionResponse
    }
  }

  async refundTransaction(data: RefundTransactionRequest): Promise<RefundTransactionResponse> {
    try {
      if (!data.transactionId) {
        return {
          success: false,
          error: 'Transaction ID is required',
        }
      }

      await this.ensureAuthenticated()

      const response = await axios.post(
        `${this.baseUrl}/transactions/${data.transactionId}/charge_back`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.bearerToken}`,
          },
        }
      )

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
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.response?.status === 401) {
          this.bearerToken = null
          this.lastAuthTime = 0

          try {
            await this.ensureAuthenticated()
            return this.refundTransaction(data)
          } catch (retryError) {
            return this.handleError(retryError) as RefundTransactionResponse
          }
        }

        if (axiosError.response?.status === 404) {
          return {
            success: false,
            error: 'Transaction not found',
          }
        }
      }

      return this.handleError(error) as RefundTransactionResponse
    }
  }

  async listTransactions(): Promise<ListTransactionsResponse> {
    try {
      await this.ensureAuthenticated()

      const response = await axios.get(`${this.baseUrl}/transactions`, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
        },
      })

      return {
        success: true,
        transactions: Array.isArray(response.data) ? response.data : response.data?.transactions || [],
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.response?.status === 401) {
          this.bearerToken = null
          this.lastAuthTime = 0

          try {
            await this.ensureAuthenticated()
            return this.listTransactions()
          } catch (retryError) {
            return {
              success: false,
              error: 'Failed to authenticate',
            }
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
