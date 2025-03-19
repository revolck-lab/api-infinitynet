const fs = require('fs');
const path = require('path');

console.log('Iniciando configuração para desenvolvimento...');

// Caminhos para diretórios importantes
const publicDir = path.join(__dirname, '../src/public');

// Reutiliza o mesmo HTML do script render-setup.js
const htmlPath = path.join(__dirname, 'render-setup.js');
let htmlContent = '';

try {
  const renderSetupContent = fs.readFileSync(htmlPath, 'utf8');
  // Extrai o HTML do arquivo render-setup.js usando regex
  const htmlMatch = renderSetupContent.match(/const htmlContent = `([\s\S]*?)`;/);
  
  if (htmlMatch && htmlMatch[1]) {
    htmlContent = htmlMatch[1];
  } else {
    throw new Error('Não foi possível extrair o HTML do arquivo render-setup.js');
  }
} catch (error) {
  console.error('Erro ao ler o arquivo render-setup.js:', error);
  // HTML simplificado para fallback
  htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>InfinityNet API</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    h1 { color: #3498db; }
  </style>
</head>
<body>
  <h1>InfinityNet API</h1>
  <p>API REST para gerenciamento de usuários e autenticação</p>
  <div>
    <h2>Endpoints:</h2>
    <ul>
      <li>/api/auth</li>
      <li>/api/users</li>
      <li>/api/roles</li>
      <li>/api/status</li>
      <li>/api/health</li>
    </ul>
  </div>
</body>
</html>`;
}

// Cria diretório se não existir
console.log(`Verificando diretório public: ${publicDir}`);
if (!fs.existsSync(publicDir)) {
  console.log('Criando diretório public...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Salva o arquivo HTML
console.log('Salvando arquivo index.html...');
fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent);

console.log('Configuração para desenvolvimento concluída com sucesso!');