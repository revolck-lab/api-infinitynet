// shared/services/logger.service.ts (versão compatível)
import { config } from '../../config';

class EnhancedLogger {
  private static instance: EnhancedLogger;

  /**
   * Formata a mensagem de log
   */
  private formatMessage(level: string, message: string, meta: any = {}): string {
    const timestamp = new Date().toISOString();
    if (config.log.prettyPrint) {
      // Formato mais legível para desenvolvimento
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
        Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : ""
      }`;
    }

    // Formato JSON para produção
    return JSON.stringify({
      level,
      message,
      timestamp,
      service: 'api-infinitynet',
      ...meta
    });
  }

  public error(message: string, meta: any = {}): void {
    console.error(this.formatMessage('error', message, meta));
  }

  public warn(message: string, meta: any = {}): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  public info(message: string, meta: any = {}): void {
    console.info(this.formatMessage('info', message, meta));
  }

  public debug(message: string, meta: any = {}): void {
    console.debug(this.formatMessage('debug', message, meta));
  }

  public static getInstance(): EnhancedLogger {
    if (!EnhancedLogger.instance) {
      EnhancedLogger.instance = new EnhancedLogger();
    }
    return EnhancedLogger.instance;
  }
}

export const logger = EnhancedLogger.getInstance();