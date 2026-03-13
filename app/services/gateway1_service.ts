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

/**
 * Interface para resposta de login do Gateway 1
 */
interface Gateway1LoginResponse {
  token: string
  [key: string]: any
}

/**
 * Interface para resposta de criação de transação do Gateway 1
 */
interface Gateway1CreateTransactionResponse {
  id: string
  status: string
  [key: string]: any
}

/**
 * Service para integração com Gateway 1
 * 
 * Gateway 1 utiliza autenticação via Bearer token:
 * 1. Faz login em POST /login com email e token
 * 2. Recebe Bearer token na resposta
 * 3. Usa Bearer token em todas as requisições seguintes
 */
export class Gateway1Service extends BaseGateway {
  readonly name = 'Gateway 1'
  readonly baseUrl: string = env.get('GATEWAY_1_URL')

  /**
   * Token Bearer obtido após login
   * Armazenado em memória para uso nas requisições autenticadas
   */
  private bearerToken: string | null = null

  /**
   * Timestamp da última autenticação
   * Usado para detectar se o token pode estar expirado
   */
  private lastAuthTime: number = 0

  /**
   * Tempo de expiração do token em milissegundos (padrão: 1 hora)
   */
  private readonly TOKEN_EXPIRY_TIME = 60 * 60 * 1000 // 1 hora

  constructor() {
    super()
    // Atualiza o baseURL do httpClient após definir baseUrl
    this.httpClient.defaults.baseURL = this.baseUrl
  }

  /**
   * Realiza login no Gateway 1 e armazena o token Bearer
   * 
   * @returns true se login foi bem-sucedido, false caso contrário
   */
  private async authenticate(): Promise<boolean> {
    try {
      // Verifica se já tem token válido (não expirado)
      const now = Date.now()
      if (this.bearerToken && now - this.lastAuthTime < this.TOKEN_EXPIRY_TIME) {
        return true
      }

      // Faz login
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

      // Armazena o token Bearer
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

  /**
   * Garante que está autenticado antes de fazer requisições
   * Se não estiver autenticado ou token expirado, faz login novamente
   */
  private async ensureAuthenticated(): Promise<void> {
    const isAuthenticated = await this.authenticate()
    if (!isAuthenticated) {
      throw new Error('Failed to authenticate with Gateway 1')
    }
  }

  /**
   * Cria uma nova transação no Gateway 1
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

      // Garante que está autenticado
      await this.ensureAuthenticated()

      // Faz a requisição de criação de transação
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
      // Trata erros específicos do Gateway 1
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        // Erro de autenticação (401) - tenta reautenticar uma vez
        if (axiosError.response?.status === 401) {
          this.bearerToken = null // Limpa token inválido
          this.lastAuthTime = 0

          // Tenta uma vez mais após reautenticação
          try {
            await this.ensureAuthenticated()
            // Retenta a criação da transação
            return this.createTransaction(data)
          } catch (retryError) {
            return this.handleError(retryError) as CreateTransactionResponse
          }
        }

        // Erro específico de CVV inválido (100 ou 200)
        if (axiosError.response?.status === 400 || axiosError.response?.status === 422) {
          const errorData = axiosError.response.data as any
          const errorMessage = errorData?.message || errorData?.error || 'Invalid card data'

          return {
            success: false,
            error: errorMessage,
          }
        }
      }

      // Usa o tratamento de erro padrão da classe base
      return this.handleError(error) as CreateTransactionResponse
    }
  }

  /**
   * Realiza reembolso de uma transação no Gateway 1
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

      // Garante que está autenticado
      await this.ensureAuthenticated()

      // Faz a requisição de reembolso
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
      // Trata erros específicos do Gateway 1
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        // Erro de autenticação (401) - tenta reautenticar uma vez
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

        // Erro de transação não encontrada (404)
        if (axiosError.response?.status === 404) {
          return {
            success: false,
            error: 'Transaction not found',
          }
        }
      }

      // Usa o tratamento de erro padrão da classe base
      return this.handleError(error) as RefundTransactionResponse
    }
  }

  /**
   * Lista transações do Gateway 1
   * 
   * @returns Lista de transações
   */
  async listTransactions(): Promise<ListTransactionsResponse> {
    try {
      // Garante que está autenticado
      await this.ensureAuthenticated()

      // Faz a requisição de listagem
      const response = await axios.get(`${this.baseUrl}/transactions`, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
        },
      })

      // Retorna a lista de transações
      return {
        success: true,
        transactions: Array.isArray(response.data) ? response.data : response.data?.transactions || [],
      }
    } catch (error) {
      // Trata erros
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        // Erro de autenticação (401) - tenta reautenticar uma vez
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
