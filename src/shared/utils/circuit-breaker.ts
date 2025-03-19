// shared/utils/circuit-breaker.ts
export class CircuitBreaker {
    private state: 'CLOSED' | 'OPEN' | 'HALF-OPEN' = 'CLOSED';
    private failureCount: number = 0;
    private lastFailureTime: number = 0;
    private readonly failureThreshold: number;
    private readonly resetTimeout: number;
  
    constructor(failureThreshold = 5, resetTimeout = 30000) {
      this.failureThreshold = failureThreshold;
      this.resetTimeout = resetTimeout;
    }
  
    async execute<T>(fn: () => Promise<T>): Promise<T> {
      if (this.state === 'OPEN') {
        if (Date.now() - this.lastFailureTime > this.resetTimeout) {
          this.state = 'HALF-OPEN';
        } else {
          throw new Error('Circuit breaker is OPEN');
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
  
    private success(): void {
      this.failureCount = 0;
      this.state = 'CLOSED';
    }
  
    private failure(): void {
      this.failureCount++;
      this.lastFailureTime = Date.now();
  
      if (this.state === 'HALF-OPEN' || this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
      }
    }
  }