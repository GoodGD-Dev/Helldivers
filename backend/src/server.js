const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const connectDatabase = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Middlewares de Segurança
app.use(helmet());
app.use(rateLimiter);

// 📝 Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 🌐 CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://seudominio.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// 📦 Middlewares Gerais
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📡 Rotas
app.use('/api', routes);

// 🏠 Rota Principal
app.get('/', (req, res) => {
  res.json({
    message: '🎮 Helldivers 2 API',
    version: '1.0.0',
    endpoints: {
      weapons: '/api/primary-weapons, /api/secondary-weapons',
      equipment: '/api/throwables, /api/stratagems',
      armor: '/api/armors, /api/passive-armors',
      perks: '/api/perks'
    },
    docs: '/api/docs'
  });
});

// 🏥 Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ❌ Handler de Erros
app.use(errorHandler);

// 🚫 Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    message: `${req.method} ${req.originalUrl} não existe`
  });
});

// 🔌 Conectar ao banco e iniciar servidor
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// 🎯 Iniciar aplicação
if (require.main === module) {
  startServer();
}

module.exports = app;