/**
 * Tipos de erro conhecidos na aplicação
 */
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  CONFLICT = "CONFLICT_ERROR",
  INTERNAL = "INTERNAL_ERROR",
  BAD_REQUEST = "BAD_REQUEST_ERROR",
}

/**
 * Classe para erros padronizados da aplicação
 * Facilita o tratamento consistente de erros e o envio de respostas ao cliente
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode = 500,
    details?: any,
    isOperational = true
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Comentando a linha problemática
    // Error.captureStackTrace(this, this.constructor);
    
    // Alternativa mais segura para capturar stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
  }

  /**
   * Cria um erro de validação
   */
  public static validation(message: string, details?: any): AppError {
    return new AppError(message, ErrorType.VALIDATION, 400, details);
  }

  /**
   * Cria um erro de autenticação
   */
  public static authentication(message = "Não autorizado"): AppError {
    return new AppError(message, ErrorType.AUTHENTICATION, 401);
  }

  /**
   * Cria um erro de autorização
   */
  public static authorization(message = "Acesso proibido"): AppError {
    return new AppError(message, ErrorType.AUTHORIZATION, 403);
  }

  /**
   * Cria um erro de recurso não encontrado
   */
  public static notFound(message = "Recurso não encontrado"): AppError {
    return new AppError(message, ErrorType.NOT_FOUND, 404);
  }

  /**
   * Cria um erro de conflito (ex: recurso já existe)
   */
  public static conflict(message: string): AppError {
    return new AppError(message, ErrorType.CONFLICT, 409);
  }

  /**
   * Cria um erro de requisição inválida
   */
  public static badRequest(message: string): AppError {
    return new AppError(message, ErrorType.BAD_REQUEST, 400);
  }
}