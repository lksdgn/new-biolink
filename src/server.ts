import { createApp } from './app';
import { env } from './utils/env';
import prisma from './config/database';

const app = createApp();
const PORT = parseInt(env.PORT, 10);

async function startServer() {
  try {
    // Testar conexão com o banco de dados
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Ambiente: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
