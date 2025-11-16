// Servidor HTTP simples para servir o front-end
// Execute: node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;

  // Redirecionar raiz para index.html
  if (filePath === './') {
    filePath = './index.html';
  }

  // Remover query strings
  filePath = filePath.split('?')[0];

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Se a rota não tiver extensão (não é um arquivo), servir viewer.html
        if (!extname || extname === '') {
          fs.readFile('./viewer.html', (error, content) => {
            if (error) {
              // Se viewer.html não existir, retornar 404
              res.writeHead(404);
              res.end('Not found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content, 'utf-8');
            }
          });
        } else {
          // Arquivo com extensão não encontrado - 404
          res.writeHead(404);
          res.end('Not found');
        }
      } else {
        // Erro do servidor
        res.writeHead(500);
        res.end('Erro no servidor: ' + error.code);
      }
    } else {
      // Sucesso
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`\n📍 Páginas disponíveis:`);
  console.log(`   - Landing:    http://localhost:${PORT}/index.html`);
  console.log(`   - Login:      http://localhost:${PORT}/login.html`);
  console.log(`   - Registro:   http://localhost:${PORT}/register.html`);
  console.log(`   - Dashboard:  http://localhost:${PORT}/dashboard.html`);
  console.log(`   - Viewer:     http://localhost:${PORT}/viewer.html?slug=usuario`);
  console.log(`   - Ranking:    http://localhost:${PORT}/leaderboard.html`);
  console.log(`   - Preços:     http://localhost:${PORT}/pricing.html`);
  console.log(`\n⚠️  Certifique-se de que o backend está rodando em http://localhost:3000\n`);
  console.log(`>  Desenvolvido por Lukas - https://github.com/lksdgn/new-biolink`);
});
