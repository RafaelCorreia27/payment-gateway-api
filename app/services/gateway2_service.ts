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

interface Gateway2CreateTransactionResponse {
  id: string
  status: string
  [key: string]: any
}

export class Gateway2Service extends BaseGateway {
  readonly name = 'Gateway 2'
  readonly baseUrl: string = env.get('GATEWAY_2_URL')

  private readonly authToken: string = env.get('GATEWAY_2_AUTH_TOKEN')
  private readonly authSecret: string = env.get('GATEWAY_2_AUTH_SECRET')

  private getAuthHeaders(): Record<string, string> {
    return {
      'Gateway-Auth-Token': this.authToken,
      'Gateway-Auth-Secret': this.authSecret,
    }
  }

  private convertToGateway2Format(data: CreateTransactionRequest): Record<string, any> {
    return {
      valor: data.amount,
      nome: data.name,
      email: data.email,
      numeroCartao: data.cardNumber,
      cvv: data.cvv,
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

      const gateway2Data = this.convertToGateway2Format(data)

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

        if (axiosError.response?.status === 400 || axiosError.response?.status === 422) {
          const errorData = axiosError.response.data as any
          const errorMessage = errorData?.message || errorData?.error || 'Invalid card data'

          return {
            success: false,
            error: errorMessage,
          }
        }

        if (axiosError.response?.status === 401) {
          return {
            success: false,
            error: 'Authentication failed: Invalid gateway credentials',
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

      const refundBody = { id: data.transactionId }

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

        if (axiosError.response?.status === 404) {
          return {
            success: false,
            error: 'Transaction not found',
          }
        }

        if (axiosError.response?.status === 401) {
          return {
            success: false,
            error: 'Authentication failed: Invalid gateway credentials',
          }
        }

        if (axiosError.response?.status === 400) {
          const errorData = axiosError.response.data as any
          return {
            success: false,
            error: errorData?.message || errorData?.error || 'Invalid transaction ID',
          }
        }
      }

      return this.handleError(error) as RefundTransactionResponse
    }
  }

  async listTransactions(): Promise<ListTransactionsResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/transacoes`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      })

      return {
        success: true,
        transactions: Array.isArray(response.data) ? response.data : response.data?.transacoes || response.data?.transactions || [],
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

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
