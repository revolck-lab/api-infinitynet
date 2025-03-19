import { logger } from '../services/logger.service';

/**
 * Estados possíveis do circuit breaker
 */
type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF-OPEN';

/**
 * Implementação do padrão Circuit Breaker para isolar falhas e prevenir cascatas
 * Quando um serviço falha repetidamente, o circuit breaker "abre" para evitar mais chamadas
 * e após um período, tenta novamente permitindo recuperação
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly name: string;

  constructor(name = 'default', failureThreshold = 5, resetTimeout = 30000) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  /**
   * Executa uma função protegida pelo circuit breaker
   * @param fn Função a ser executada
   * @returns Resultado da função 
   * @throws Error se o circuit breaker estiver aberto
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        logger.info(`Circuit breaker [${this.name}] mudou para HALF-OPEN`);
        this.state = 'HALF-OPEN';
      } else {
        logger.warn(`Circuit breaker [${this.name}] bloqueou acesso, estado: OPEN`);
        throw new Error(`Circuit breaker [${this.name}] está OPEN`);
      }
    }

    try {
      const result = await fn();
      this.success();
      return result;
    } catch (error) {
      this.failure();
      throw error;
    }
  }

  /**
   * Registra uma execução bem-sucedida
   */
  private success(): void {
    if (this.state === 'HALF-OPEN') {
      logger.info(`Circuit breaker [${this.name}] restaurado para CLOSED`);
    }
    
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  /**
   * Registra uma falha na execução
   */
  private failure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF-OPEN' || this.failureCount >= this.failureThreshold) {
      logger.warn(`Circuit breaker [${this.name}] mudou para OPEN após ${this.failureCount} falhas`);
      this.state = 'OPEN';
    }
  }

  /**
   * Retorna o estado atual do circuit breaker
   */
  public getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Força a abertura do circuit breaker (útil para testes)
   */
  public forceOpen(): void {
    this.state = 'OPEN';
    this.lastFailureTime = Date.now();
    logger.info(`Circuit breaker [${this.name}] forçado para OPEN`);
  }

  /**
   * Força o fechamento do circuit breaker (útil para testes e reset)
   */
  public forceClose(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    logger.info(`Circuit breaker [${this.name}] forçado para CLOSED`);
  }
}