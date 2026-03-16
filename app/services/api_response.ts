// Formato padrão das respostas: success/data ou success/message/errors/code

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
  static success<T = unknown>(data?: T, message?: string): ApiSuccess<T> {
    return {
      success: true,
      message,
      data,
    }
  }

  static error<E = unknown>(message: string, errors?: E, code?: string): ApiError<E> {
    return {
      success: false,
      message,
      errors,
      code,
    }
  }
}

