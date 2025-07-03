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

// 📸 IMPORTAR ROTAS DE IMAGEM
const imageRoutes = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARES DE SEGURANÇA COM CORREÇÃO CORS ===

// CSP ESPECÍFICO PARA ADMIN - VERSÃO QUE FUNCIONA
app.use('/admin', helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      styleSrcAttr: ["'unsafe-inline'"],
      styleSrcElem: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcElem: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'none'"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "*"], // Permitir imagens de qualquer origem
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
  crossOriginResourcePolicy: { policy: "cross-origin" }, // IMPORTANTE
  referrerPolicy: { policy: "same-origin" }
}));

// CSP para outras rotas (menos restritivo para imagens)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "*"], // Permitir imagens de qualquer origem
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" } // IMPORTANTE
}));

app.use(rateLimiter);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 🚨 CORS MELHORADO PARA PRODUÇÃO
app.use(cors({
  origin: function (origin, callback) {
    console.log('🌍 CORS: Checking origin:', origin);

    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',  // Vite dev server
      'http://localhost:4173',  // Vite preview
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://helldivers.onrender.com',
      // Adicionar domínios da Vercel
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.vercel\.com$/
    ];

    // Em produção, adicionar domínios do .env
    if (process.env.NODE_ENV === 'production' && process.env.CORS_ORIGIN) {
      const prodOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
      allowedOrigins.push(...prodOrigins);
    }

    // Permitir requests sem origin (mobile apps, postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Request sem origin permitido');
      return callback(null, true);
    }

    // Verificar se a origin está na lista ou corresponde aos padrões regex
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      console.log('✅ CORS: Origin permitida:', origin);
      callback(null, true);
    } else {
      console.warn(`🚨 CORS: Origin ${origin} não permitida`);
      console.log('📋 CORS: Origens permitidas:', allowedOrigins);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200,
  // Headers expostos para o cliente
  exposedHeaders: ['Content-Length', 'Content-Type', 'Cache-Control']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === MIDDLEWARE ESPECÍFICO PARA OPTIONS (Preflight) ===
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.sendStatus(200);
});

// === ARQUIVOS ESTÁTICOS COM CORS CORRETO ===

// 📁 SERVIR ARQUIVOS DE UPLOAD COM HEADERS CORS ESPECÍFICOS
app.use('/uploads', (req, res, next) => {
  // Headers CORS mais permissivos para imagens
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');

  // Headers de segurança básicos
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Headers de cache agressivo para imagens
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(req.path)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 ano
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
  }

  // Log para debug (apenas em desenvolvimento)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🖼️ Serving image: ${req.path} with CORS headers`);
  }

  next();
}, express.static(path.join(__dirname, '../uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '365d' : '0',
  etag: true,
  lastModified: true,
  dotfiles: 'deny',
  setHeaders: (res, filePath) => {
    // MIME types específicos
    if (/\.(jpg|jpeg)$/i.test(filePath)) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (/\.png$/i.test(filePath)) {
      res.setHeader('Content-Type', 'image/png');
    } else if (/\.webp$/i.test(filePath)) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (/\.gif$/i.test(filePath)) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (/\.svg$/i.test(filePath)) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }

    // Garantir headers CORS mesmo no setHeaders
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ARQUIVOS ESTÁTICOS DO ADMIN
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
      admin: 'active',
      uploads: 'enabled'
    }
  });
});

// 📸 ROTAS PARA UPLOAD DE IMAGENS (ADMIN API)
app.use('/admin/api', imageRoutes);

// Admin routes
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
        'Upload de imagens para todos os itens',
        'Interface responsiva e moderna',
        'Autenticação integrada',
        'Exportação de dados'
      ]
    },
    uploads: {
      endpoint: '/admin/api/upload-image',
      maxSize: '5MB',
      formats: ['JPG', 'PNG', 'WebP', 'GIF'],
      storage: '/uploads/{modelKey}/'
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
      health: '/health',
      uploads: '/uploads/*'
    }
  });
});

app.use(errorHandler);

// === FUNÇÕES AUXILIARES ===

// 📁 CRIAR ESTRUTURA DE PASTAS DE UPLOAD - VERSÃO CORRIGIDA
async function createUploadDirectories() {
  const fs = require('fs').promises;

  // CORREÇÃO: Pasta uploads na raiz do projeto, não em src/
  const uploadsBasePath = path.join(__dirname, '../uploads');

  console.log('📁 Caminho base dos uploads:', uploadsBasePath);
  console.log('📍 __dirname do server:', __dirname);
  console.log('📍 Caminho absoluto resolvido:', path.resolve(uploadsBasePath));

  const uploadPaths = [
    'uploads',
    'uploads/armors',
    'uploads/primary-weapons',
    'uploads/secondary-weapons',
    'uploads/throwables',
    'uploads/stratagems',
    'uploads/passive-armors',
    'uploads/perks',
    'uploads/general',
    'uploads/temp'
  ];

  try {
    for (const uploadPath of uploadPaths) {
      // Usar caminho relativo à raiz do projeto
      const fullPath = path.join(__dirname, '..', uploadPath);
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`✅ Pasta criada/verificada: ${fullPath}`);
    }
    console.log('📁 Estrutura de pastas de upload criada com sucesso');

    // Verificar se não há pastas em locais incorretos
    await checkForIncorrectDirectories();

  } catch (error) {
    console.warn('⚠️ Aviso ao criar pastas de upload:', error.message);
  }
}

// Verificar se existem pastas em locais incorretos
async function checkForIncorrectDirectories() {
  const fs = require('fs').promises;

  const incorrectPaths = [
    path.join(__dirname, '../../../uploads'),    // Dois níveis acima
    path.join(__dirname, '../uploads'),          // src/uploads (pode estar correto dependendo da estrutura)
    path.join(__dirname, 'uploads')              // Dentro de src/ (incorreto)
  ];

  console.log('🔍 Verificando locais incorretos para pastas de upload...');

  for (const incorrectPath of incorrectPaths) {
    try {
      const stats = await fs.stat(incorrectPath);
      if (stats.isDirectory()) {
        const files = await fs.readdir(incorrectPath);
        if (files.length > 0) {
          console.warn(`⚠️ ATENÇÃO: Encontrada pasta de upload em local incorreto: ${incorrectPath}`);
          console.warn(`   📂 Contém ${files.length} itens`);
          console.warn(`   🔧 Use POST /admin/api/cleanup-directories para limpar`);
        }
      }
    } catch (error) {
      // Pasta não existe - isso é bom
    }
  }
}

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

// === INICIALIZAÇÃO ===

const startServer = async () => {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await connectDatabase();
    console.log('✅ Banco de dados conectado com sucesso');

    // 📁 CRIAR ESTRUTURA DE PASTAS DE UPLOAD
    await createUploadDirectories();

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
      console.log(`   📁 Uploads: http://localhost:${PORT}/uploads/`);

      // Log CORS info
      console.log('\n🌍 CORS CONFIGURADO PARA:');
      console.log('   http://localhost:5173 (Vite dev)');
      console.log('   http://localhost:3000 (Backend)');
      console.log('   http://localhost:4173 (Vite preview)');
      console.log('   *.vercel.app (Vercel deployments)');

      if (process.env.CORS_ORIGIN) {
        console.log('   Origens extras:', process.env.CORS_ORIGIN);
      }

      if (process.env.NODE_ENV === 'production') {
        console.log('\n🔐 SEGURANÇA:');
        console.log(`   Admin protegido com Basic Auth`);
        console.log(`   Headers CORS configurados para produção`);
      } else {
        console.log('\n🔓 DESENVOLVIMENTO:');
        console.log(`   Admin sem autenticação (desenvolvimento)`);
        console.log(`   Configure ADMIN_AUTH=true para ativar autenticação`);
        console.log(`   🛡️  CSP configurado para desenvolvimento`);
      }

      // Log de informações de upload
      console.log('\n📁 SISTEMA DE UPLOADS:');
      console.log(`   Pasta raiz: ${path.join(__dirname, '../uploads')}`);
      console.log(`   URL base: http://localhost:${PORT}/uploads/`);
      console.log(`   Endpoint upload: POST /admin/api/upload-image`);
      console.log(`   Endpoint limpeza: POST /admin/api/cleanup-directories`);
      console.log(`   Debug estrutura: GET /admin/api/debug/folder-structure`);
      console.log(`   🌍 CORS habilitado para imagens`);
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