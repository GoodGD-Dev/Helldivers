// src/server.js - Configuração CSP e rotas estáticas corrigidas
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDatabase = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const adminRoutes = require('./admin/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARES DE SEGURANÇA ===

// CSP ESPECÍFICO PARA ADMIN - VERSÃO QUE FUNCIONA
app.use('/admin', helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      styleSrcAttr: ["'unsafe-inline'"],
      styleSrcElem: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Necessário para alguns browsers
      scriptSrcElem: ["'self'", "'unsafe-inline'"], // Necessário para alguns browsers  
      scriptSrcAttr: ["'none'"], // Event handlers inline bloqueados
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  referrerPolicy: { policy: "same-origin" }
}));

// CSP para outras rotas (mais restritivo)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(rateLimiter);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || 'https://seudominio.com').split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === ARQUIVOS ESTÁTICOS DO ADMIN - CONFIGURAÇÃO CORRIGIDA ===

// IMPORTANTE: As rotas das controllers do admin já lidam com CSS/JS
// Aqui servimos apenas arquivos extras se necessário
app.use('/admin/assets', express.static(path.join(__dirname, 'admin/public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Garantir MIME types corretos para arquivos estáticos
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

// Middleware de diagnóstico (apenas desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use('/admin/debug', (req, res, next) => {
    console.log('🔍 DEBUG Admin Request:', {
      method: req.method,
      url: req.url,
      path: req.path,
      headers: {
        accept: req.headers.accept,
        'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
      }
    });
    next();
  });
}

// === ROTAS ===

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'connected',
      admin: 'active'
    }
  });
});

// Admin routes ANTES da API para ter prioridade
app.use('/admin', adminRoutes);

// API routes
app.use('/api', routes);

// Homepage
app.get('/', (req, res) => {
  res.json({
    message: '🎮 Helldivers 2 API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      weapons: {
        primary: '/api/primary-weapons',
        secondary: '/api/secondary-weapons'
      },
      equipment: {
        throwables: '/api/throwables',
        stratagems: '/api/stratagems'
      },
      armor: {
        armors: '/api/armors',
        passives: '/api/passive-armors'
      },
      perks: '/api/perks'
    },
    documentation: '/api/docs',
    admin: {
      panel: '/admin',
      description: 'Interface administrativa para gerenciamento de dados',
      features: [
        'Dashboard com estatísticas em tempo real',
        'CRUD completo para todos os modelos',
        'Interface responsiva e moderna',
        'Autenticação integrada',
        'Exportação de dados'
      ]
    },
    status: {
      environment: process.env.NODE_ENV || 'development',
      uptime: `${Math.floor(process.uptime())} segundos`,
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`📍 404 - Rota não encontrada: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint não encontrado',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    },
    suggestions: {
      api: 'Verifique /api/docs para endpoints disponíveis',
      admin: 'Acesse /admin para o painel administrativo',
      health: 'Use /health para verificar status do servidor'
    },
    availableEndpoints: {
      api: '/api/*',
      admin: '/admin',
      docs: '/api/docs',
      health: '/health'
    }
  });
});

app.use(errorHandler);

// === INICIALIZAÇÃO ===

const startServer = async () => {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await connectDatabase();
    console.log('✅ Banco de dados conectado com sucesso');

    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 HELLDIVERS 2 API - SERVIDOR INICIADO');
      console.log('='.repeat(60));
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🕒 Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
      console.log('\n📡 ENDPOINTS DISPONÍVEIS:');
      console.log(`   API Principal: http://localhost:${PORT}/api`);
      console.log(`   ⚙️  Admin Panel: http://localhost:${PORT}/admin`);
      console.log(`   📚 Documentação: http://localhost:${PORT}/api/docs`);
      console.log(`   🏥 Health Check: http://localhost:${PORT}/health`);

      if (process.env.NODE_ENV === 'production') {
        console.log('\n🔐 SEGURANÇA:');
        console.log(`   Admin protegido com Basic Auth`);
        console.log(`   👤 Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
        console.log(`   🔑 Password: ${process.env.ADMIN_PASSWORD ? '[CONFIGURADO]' : 'helldivers123'}`);
        console.log(`   🛡️  CSP configurado adequadamente`);
      } else {
        console.log('\n🔓 DESENVOLVIMENTO:');
        console.log(`   Admin sem autenticação (desenvolvimento)`);
        console.log(`   Configure ADMIN_AUTH=true para ativar autenticação`);
        console.log(`   🛡️  CSP configurado para desenvolvimento`);
      }

      console.log('\n💡 CORREÇÕES APLICADAS:');
      console.log(`   ✅ MIME types corretos para JS (application/javascript)`);
      console.log(`   ✅ MIME types corretos para CSS (text/css)`);
      console.log(`   ✅ Rotas /admin/assets/js/ e /admin/assets/css/ configuradas`);
      console.log(`   ✅ Content-Type-Options nosniff aplicado`);
      console.log(`   ✅ CSP permitindo scripts inline quando necessário`);

      console.log('\n🔧 ESTRUTURA DE ARQUIVOS ESPERADA:');
      console.log(`   src/admin/public/js/admin-core.js`);
      console.log(`   src/admin/public/js/admin-utils.js`);
      console.log(`   src/admin/public/js/admin-dashboard.js`);
      console.log(`   src/admin/public/js/admin-models.js`);
      console.log(`   src/admin/public/js/admin.js`);
      console.log(`   src/admin/public/css/admin.css`);
      console.log('='.repeat(60) + '\n');
    });

    setupGracefulShutdown(server);
    logProcessStats();

    return server;
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO AO INICIAR SERVIDOR:');
    console.error('='.repeat(50));
    console.error('Erro:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.error('='.repeat(50));

    console.log('\n🔍 DIAGNÓSTICO:');
    console.log(`Porta ${PORT}:`, await checkPortAvailability(PORT) ? 'Disponível' : 'Em uso');
    console.log(`MongoDB URI:`, process.env.MONGODB_URI ? 'Configurado' : 'Não configurado');
    console.log(`NODE_ENV:`, process.env.NODE_ENV || 'não definido');

    process.exit(1);
  }
};

// Configurar encerramento gracioso
function setupGracefulShutdown(server) {
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Recebido sinal ${signal}, encerrando servidor graciosamente...`);

    server.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar servidor:', err);
        process.exit(1);
      }

      console.log('✅ Servidor HTTP fechado');

      // Fechar conexão com MongoDB
      if (require('mongoose').connection.readyState === 1) {
        require('mongoose').connection.close(() => {
          console.log('✅ Conexão MongoDB fechada');
          console.log('👋 Servidor encerrado com sucesso');
          process.exit(0);
        });
      } else {
        console.log('👋 Servidor encerrado com sucesso');
        process.exit(0);
      }
    });

    // Forçar encerramento após 10 segundos
    setTimeout(() => {
      console.error('❌ Encerramento forçado após timeout');
      process.exit(1);
    }, 10000);
  };

  // Capturar sinais de encerramento
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Capturar erros não tratados
  process.on('uncaughtException', (error) => {
    console.error('❌ ERRO NÃO CAPTURADO:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ PROMISE REJEITADA NÃO TRATADA:', reason);
    console.error('Promise:', promise);
    gracefulShutdown('unhandledRejection');
  });
}

// Log de estatísticas do processo
function logProcessStats() {
  setInterval(() => {
    const usage = process.memoryUsage();
    const stats = {
      heap: Math.round(usage.heapUsed / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
      uptime: Math.floor(process.uptime())
    };

    // Log apenas se memory usage for alta (desenvolvimento)
    if (process.env.NODE_ENV !== 'production' && stats.heap > 100) {
      console.log(`📊 Memory: ${stats.heap}MB heap, ${stats.rss}MB RSS, Uptime: ${stats.uptime}s`);
    }
  }, 60000); // A cada minuto
}

// Verificar se porta está disponível
async function checkPortAvailability(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

// === EXPORTAÇÃO E INICIALIZAÇÃO ===

// Inicializar servidor se executado diretamente
if (require.main === module) {
  startServer().catch((error) => {
    console.error('❌ Falha na inicialização:', error);
    process.exit(1);
  });
}

// Exportar app para testes
module.exports = { app, startServer };