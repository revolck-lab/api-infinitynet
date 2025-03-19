import path from 'path';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

/**
 * Configura os middlewares necessários para servir arquivos estáticos
 * @param app Instância do Express
 */
export const setupStaticFiles = (app: express.Express): void => {
  // Define o diretório de arquivos estáticos, considerando ambiente de produção vs desenvolvimento
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Em produção, tentamos múltiplos caminhos possíveis para encontrar o diretório public
  const possiblePaths = isProduction 
    ? [
        path.resolve(process.cwd(), 'dist/public'),
        path.resolve(process.cwd(), 'src/dist/public'),
        path.resolve(process.cwd(), 'public'),
        path.resolve(process.cwd(), 'src/public'),
      ]
    : [
        path.resolve(process.cwd(), 'src/public')
      ];
  
  // Encontra o primeiro caminho que existe
  const publicDir = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  
  console.log(`Configurando arquivos estáticos no diretório: ${publicDir}`);
  
  // Tenta criar o diretório se não existir
  if (!fs.existsSync(publicDir)) {
    console.log(`Diretório não encontrado, criando: ${publicDir}`);
    try {
      fs.mkdirSync(publicDir, { recursive: true });
    } catch (error) {
      console.error(`Erro ao criar diretório: ${error}`);
    }
  }
  
  // Configura o Express para servir arquivos estáticos
  app.use(express.static(publicDir));
  
  // Rota raiz para servir o index.html
  app.get('/', (req: Request, res: Response) => {
    const indexPath = path.join(publicDir, 'index.html');
    console.log(`Tentando servir o arquivo: ${indexPath}`);
    
    // Verifica se o arquivo existe antes de tentar servi-lo
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Fallback para um JSON simples se o arquivo não existir
      console.log(`Arquivo não encontrado: ${indexPath}, servindo JSON padrão`);
      res.status(200).json({
        name: "InfinityNet API",
        description: "Bem-vindo à API da InfinityNet",
        api_endpoint: "/api",
        version: "1.0.0",
        status: "online"
      });
    }
  });
};

/**
 * Fallback para SPA - redireciona rotas não-API para a página inicial
 * Isso permitirá que a aplicação front-end gerencie suas próprias rotas
 * @param apiPrefix O prefixo das rotas da API (ex: '/api')
 */
export const spaFallback = (apiPrefix: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Se a rota não começar com o prefixo da API e for uma requisição GET, servir o index.html
    if (!req.path.startsWith(apiPrefix) && req.method === 'GET') {
      const isProduction = process.env.NODE_ENV === 'production';
      
      // Mesma lógica de múltiplos caminhos possíveis
      const possiblePaths = isProduction 
        ? [
            path.resolve(process.cwd(), 'dist/public'),
            path.resolve(process.cwd(), 'src/dist/public'),
            path.resolve(process.cwd(), 'public'),
            path.resolve(process.cwd(), 'src/public'),
          ]
        : [
            path.resolve(process.cwd(), 'src/public')
          ];
      
      // Encontra o primeiro caminho que existe
      const publicDir = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
      const indexPath = path.join(publicDir, 'index.html');
      
      // Verifica se o arquivo existe antes de tentar servi-lo
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Se não encontrar o arquivo, passa para o próximo middleware
        next();
      }
    } else {
      next();
    }
  };
};