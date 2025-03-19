import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { routes } from "./routes";
import { AppError } from "./shared/errors/AppError";
import { loggerMiddleware } from "./shared/middlewares/logger.middleware";
import { 
  rateLimiter, 
  contentTypeCheck, 
  payloadSizeCheck, 
  sanitizeParams,
  securityHeaders
} from "./shared/middlewares/security.middleware";
import { setupStaticFiles, spaFallback } from "./shared/middlewares/static.middleware";
import { config } from "./config";
import path from "path";

dotenv.config();

class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.securityMiddlewares();
    this.middlewares();
    this.setupStaticFiles();
    this.routes();
    this.errorHandling();
  }

  private securityMiddlewares(): void {
    // Configurações de segurança com helmet
    this.app.use(helmet());
    
    // Configurações específicas para melhorar a segurança
    this.app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      }
    }));
    
    // Previne o browser de fazer MIME sniffing
    this.app.use(helmet.noSniff());
    
    // Esconde o X-Powered-By que expõe informações sobre o servidor
    this.app.disable('x-powered-by');
    
    // Evita o clickjacking com X-Frame-Options
    this.app.use(helmet.frameguard({ action: 'deny' }));
    
    // Configuração CORS ajustada para permitir apenas origens específicas
    this.app.use(cors({
      origin: config.cors.allowedOrigins.includes('*') ? '*' : config.cors.allowedOrigins,
      methods: config.cors.allowedMethods,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      exposedHeaders: ['X-Rate-Limit-Remaining'],
      credentials: true,
      maxAge: 86400
    }));
  }

  private middlewares(): void {
    // Middlewares de segurança adicionais
    this.app.use(rateLimiter);
    this.app.use(securityHeaders);
    this.app.use(sanitizeParams);
    this.app.use(contentTypeCheck);
    this.app.use(payloadSizeCheck('1mb'));
    
    // Middlewares padrão
    this.app.use(express.json({ limit: '1mb' })); // Limita o tamanho do payload
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    this.app.use(loggerMiddleware);
  }

  private setupStaticFiles(): void {
    // Configura arquivos estáticos e página inicial
    setupStaticFiles(this.app);
    
    // Adiciona fallback para SPA no final do processo de roteamento
    // (será chamado após todas as outras rotas não terem correspondência)
    this.app.use(spaFallback(config.server.apiPrefix));
  }

  private routes(): void {
    this.app.use("/api", routes);
  }

  private errorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ 
        status: "error", 
        message: "Rota não encontrada",
        path: req.path
      });
    });

    // Error handling middleware
    this.app.use(
      (
        err: Error | AppError,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        if (err instanceof AppError) {
          return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
          });
        }

        // Apenas loga o erro detalhado no servidor, não expõe detalhes ao cliente
        console.error(err.stack);
        
        return res.status(500).json({
          status: "error",
          message: "Erro interno do servidor",
          requestId: req.headers['x-request-id'] || undefined,
          // Expõe detalhes do erro apenas em ambiente de desenvolvimento
          error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    );
  }
}

// Exporta apenas a instância do Express
export default new App().app;