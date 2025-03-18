import { config } from "../../config";

/**
 * Níveis de log disponíveis
 */
type LogLevel = "error" | "warn" | "info" | "debug" | "trace";

/**
 * Interface para mensagens de log
 */
interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

/**
 * Serviço de logging estruturado com suporte a diferentes níveis
 * e formatação para desenvolvimento/produção
 */
class Logger {
  private static instance: Logger;

  /**
   * Mapa para conversão do nível de log para valor numérico
   * para comparação de importância
   */
  private readonly levelPriority: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
  };

  /**
   * Nível configurado para o logger
   */
  private readonly configuredLevel: LogLevel =
    (config.log.level as LogLevel) || "info";

  /**
   * Verifica se o nível está habilitado com base na configuração
   */
  private isLevelEnabled(level: LogLevel): boolean {
    return (
      this.levelPriority[level] <= this.levelPriority[this.configuredLevel]
    );
  }

  /**
   * Formata a mensagem de log
   */
  private formatMessage(logObj: LogMessage): string {
    if (config.log.prettyPrint) {
      // Formato mais legível para desenvolvimento
      return `[${logObj.timestamp}] ${logObj.level.toUpperCase()}: ${
        logObj.message
      } ${logObj.data ? `\n${JSON.stringify(logObj.data, null, 2)}` : ""}`;
    }

    // Formato JSON para produção (facilita a integração com ferramentas de log)
    return JSON.stringify(logObj);
  }

  /**
   * Cria uma mensagem de log
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.isLevelEnabled(level)) return;

    const logObj: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
    };

    // Em ambiente de produção, vamos escrever erros no stderr e o resto em stdout
    if (level === "error") {
      console.error(this.formatMessage(logObj));
    } else {
      console.log(this.formatMessage(logObj));
    }
  }

  /**
   * Registra uma mensagem de erro
   */
  public error(message: string, data?: any): void {
    this.log("error", message, data);
  }

  /**
   * Registra uma mensagem de aviso
   */
  public warn(message: string, data?: any): void {
    this.log("warn", message, data);
  }

  /**
   * Registra uma mensagem informativa
   */
  public info(message: string, data?: any): void {
    this.log("info", message, data);
  }

  /**
   * Registra uma mensagem de depuração
   */
  public debug(message: string, data?: any): void {
    this.log("debug", message, data);
  }

  /**
   * Registra uma mensagem de rastreamento detalhada
   */
  public trace(message: string, data?: any): void {
    this.log("trace", message, data);
  }

  /**
   * Obtém a instância única do logger (Singleton)
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
}

// Exporta a instância única do logger
export const logger = Logger.getInstance();
