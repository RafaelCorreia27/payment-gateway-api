/**
 * Helper para padronizar respostas da API
 *
 * Objetivo:
 * - Manter um formato consistente em todas as respostas
 * - Facilitar o consumo da API pelo front-end
 * - Deixar o código dos controllers mais limpo e legível
 *
 * Formato padrão:
 *
 * Sucesso:
 * {
 *   success: true,
 *   message?: string,
 *   data?: T
 * }
 *
 * Erro:
 * {
 *   success: false,
 *   message: string,
 *   errors?: E,
 *   code?: string
 * }
 */

export interface ApiSuccess<T = unknown> {
  success: true
  message?: string
  data?: T
}

export interface ApiError<E = unknown> {
  success: false
  message: string
  errors?: E
  code?: string
}

export class ApiResponse {
  /**
   * Cria uma resposta de sucesso padronizada
   *
   * @param data Dados da resposta
   * @param message Mensagem opcional
   */
  static success<T = unknown>(data?: T, message?: string): ApiSuccess<T> {
    return {
      success: true,
      message,
      data,
    }
  }

  /**
   * Cria uma resposta de erro padronizada
   *
   * @param message Mensagem de erro principal
   * @param errors Detalhes adicionais do erro (ex: erros de validação)
   * @param code Código de erro opcional (ex: VALIDATION_ERROR)
   */
  static error<E = unknown>(message: string, errors?: E, code?: string): ApiError<E> {
    return {
      success: false,
      message,
      errors,
      code,
    }
  }
}

