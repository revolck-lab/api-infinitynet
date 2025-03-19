const fs = require('fs');
const path = require('path');

// Cria diretório público se não existir
const publicDir = path.join(__dirname, '../src/public');
const distPublicDir = path.join(__dirname, '../dist/public');

// Verifica se o diretório src/public existe, se não, cria
if (!fs.existsSync(publicDir)) {
  console.log('Criando diretório public...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copia o arquivo index.html para o diretório public
console.log('Copiando index.html para src/public...');
fs.copyFileSync(
  path.join(__dirname, 'index.html'),
  path.join(publicDir, 'index.html')
);

// Durante o build, também precisamos garantir que o diretório dist/public exista
if (process.argv.includes('--build')) {
  if (!fs.existsSync(distPublicDir)) {
    console.log('Criando diretório dist/public...');
    fs.mkdirSync(distPublicDir, { recursive: true });
  }

  // Copia o arquivo index.html para o diretório dist/public
  console.log('Copiando index.html para dist/public...');
  fs.copyFileSync(
    path.join(__dirname, 'index.html'),
    path.join(distPublicDir, 'index.html')
  );
}

console.log('Arquivos estáticos preparados com sucesso!');