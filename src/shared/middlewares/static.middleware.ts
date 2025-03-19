import path from 'path';
import express from 'express';
import { Request, Response, NextFunction } from 'express';

/**
 * Configura os middlewares necessários para servir arquivos estáticos
 * @param app Instância do Express
 */
export const setupStaticFiles = (app: express.Express): void => {
  // Define o diretório de arquivos estáticos
  const publicDir = path.join(__dirname, '../../public');
  
  // Configura o Express para servir arquivos estáticos
  app.use(express.static(publicDir));
  
  // Rota raiz para servir o index.html
  app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
};

/**
 * Fallback para SPA - redireciona rotas não-API para a página inicial
 * Isso permitirá que a aplicação front-end gerencie suas próprias rotas
 */
export const spaFallback = (apiPrefix: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Se a rota não começar com /api, servir o index.html
    if (!req.path.startsWith(apiPrefix) && req.method === 'GET') {
      const publicDir = path.join(__dirname, '../../public');
      res.sendFile(path.join(publicDir, 'index.html'));
    } else {
      next();
    }
  };
};