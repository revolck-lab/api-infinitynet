import { Router } from 'express';
import { jwtMiddleware, requireRole } from '../middlewares/jwt.middleware';
import { validate } from '../middlewares/validation.middleware';
import { AnyZodObject } from 'zod';

/**
 * Tipo de configuração para criação de rotas
 */
interface RouteConfig {
  // Método HTTP
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  // Caminho da rota
  path: string;
  // Controlador a ser executado
  handler: any;
  // Schema de validação Zod (opcional)
  schema?: AnyZodObject;
  // Se a rota requer autenticação
  auth?: boolean;
  // Nível mínimo de acesso (role.level) necessário
  roleLevel?: number;
  // Middlewares adicionais
  middlewares?: any[];
}

/**
 * Fábrica para criação de rotas com padrões consistentes
 */
export class RouteFactory {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  /**
   * Cria múltiplas rotas a partir de configurações
   * @param routes Array de configurações de rotas
   */
  public createRoutes(routes: RouteConfig[]): Router {
    routes.forEach(route => this.createRoute(route));
    return this.router;
  }

  /**
   * Cria uma rota a partir de uma configuração
   * @param config Configuração da rota
   */
  private createRoute(config: RouteConfig): void {
    const {
      method,
      path,
      handler,
      schema,
      auth = false,
      roleLevel,
      middlewares = []
    } = config;

    // Prepara os middlewares para a rota
    const routeMiddlewares = [];

    // Adiciona autenticação se necessário
    if (auth) {
      routeMiddlewares.push(jwtMiddleware);
      
      // Adiciona verificação de nível se necessário
      if (roleLevel) {
        routeMiddlewares.push(requireRole(roleLevel));
      }
    }

    // Adiciona validação se schema fornecido
    if (schema) {
      routeMiddlewares.push(validate(schema));
    }

    // Adiciona middlewares adicionais
    if (middlewares.length > 0) {
      routeMiddlewares.push(...middlewares);
    }

    // Registra a rota com os middlewares e o handler
    this.router[method](path, [...routeMiddlewares, handler]);
  }

  /**
   * Retorna o router configurado
   */
  public getRouter(): Router {
    return this.router;
  }
}