const express = require('express');
const router = express.Router();
const path = require('path');

// Importar middlewares
const { requireAuth, logAccess } = require('../middleware/auth');
const { validateRouteParams, adminRateLimit } = require('../middleware/validation');

// Importar controller
const adminController = require('../controllers/adminController');

// === MIDDLEWARE GLOBAL PARA ADMIN ===
router.use(adminRateLimit);
router.use(requireAuth);
router.use(logAccess);

// === ARQUIVOS ESTÁTICOS COM MIME TYPES CORRETOS ===

// CSS
router.get('/assets/css/:filename', adminController.serveCSS);

// JavaScript 
router.get('/assets/js/:filename', adminController.serveJS);

// IMPORTANTE: Rotas alternativas para os caminhos no HTML
router.get('/public/css/:filename', adminController.serveCSS);
router.get('/public/js/:filename', adminController.serveJS);

// === ROTAS DO ADMIN ===

// Dashboard principal
router.get('/', adminController.dashboard);
router.get('/dashboard', adminController.dashboard);

// === API INTERNA DO ADMIN ===

// Informações da sessão
router.get('/api/session', adminController.getSessionInfo);

// Estatísticas gerais
router.get('/api/stats', adminController.getStats);

// === ROTAS DE MODELO (com validação) ===

// Listar itens de um modelo
router.get('/models/:model', validateRouteParams, async (req, res) => {
    try {
        const { model } = req.params;
        const { page = 1, limit = 10, search = '', filter = '' } = req.query;

        // Mapear modelo para rota da API
        const apiPath = `/api/${model}`;
        const apiUrl = `${req.protocol}://${req.get('host')}${apiPath}`;

        // Parâmetros da query
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(filter && { filter })
        });

        // Fazer requisição interna
        const response = await fetch(`${apiUrl}?${params}`);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar dados do modelo:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro ao buscar dados do modelo',
                details: error.message
            }
        });
    }
});

// Criar item em um modelo
router.post('/models/:model', validateRouteParams, async (req, res) => {
    try {
        const { model } = req.params;
        const apiUrl = `${req.protocol}://${req.get('host')}/api/${model}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Erro ao criar item:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro ao criar item',
                details: error.message
            }
        });
    }
});

// Atualizar item
router.put('/models/:model/:id', validateRouteParams, async (req, res) => {
    try {
        const { model, id } = req.params;
        const apiUrl = `${req.protocol}://${req.get('host')}/api/${model}/${id}`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Erro ao atualizar item:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro ao atualizar item',
                details: error.message
            }
        });
    }
});

// Excluir item
router.delete('/models/:model/:id', validateRouteParams, async (req, res) => {
    try {
        const { model, id } = req.params;
        const apiUrl = `${req.protocol}://${req.get('host')}/api/${model}/${id}`;

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro ao excluir item',
                details: error.message
            }
        });
    }
});

// === ROTAS DE UTILIDADES ===

// Exportar dados
router.get('/export/:model?', validateRouteParams, async (req, res) => {
    try {
        const { model } = req.params;
        const timestamp = new Date().toISOString();

        if (model) {
            // Exportar modelo específico
            const apiUrl = `${req.protocol}://${req.get('host')}/api/${model}?limit=1000`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            res.setHeader('Content-Disposition', `attachment; filename="${model}-${timestamp}.json"`);
            res.setHeader('Content-Type', 'application/json');
            res.json({
                model,
                timestamp,
                exported_by: req.user || 'admin',
                data: data.success ? data.data : []
            });
        } else {
            // Exportar todos os modelos
            const models = [
                'primary-weapons',
                'secondary-weapons',
                'throwables',
                'stratagems',
                'armors',
                'passive-armors',
                'perks'
            ];

            const exportData = {
                timestamp,
                exported_by: req.user || 'admin',
                models: {}
            };

            for (const modelName of models) {
                try {
                    const apiUrl = `${req.protocol}://${req.get('host')}/api/${modelName}?limit=1000`;
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    exportData.models[modelName] = data.success ? data.data : [];
                } catch (error) {
                    console.error(`Erro ao exportar ${modelName}:`, error);
                    exportData.models[modelName] = [];
                }
            }

            res.setHeader('Content-Disposition', `attachment; filename="helldivers2-full-export-${timestamp}.json"`);
            res.setHeader('Content-Type', 'application/json');
            res.json(exportData);
        }
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro ao exportar dados',
                details: error.message
            }
        });
    }
});

// Health check do admin
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'Admin panel operational',
        timestamp: new Date().toISOString(),
        user: req.user || 'anonymous',
        uptime: process.uptime(),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    });
});

// === LOGOUT ===
router.get('/logout', (req, res) => {
    // Basic Auth logout - força nova autenticação
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    res.status(401).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚪 Logout - Admin</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: white;
                text-align: center;
                padding: 50px;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .logout-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                max-width: 400px;
                width: 100%;
            }
            h1 { 
                font-size: 2.5em; 
                margin-bottom: 20px;
                background: linear-gradient(45deg, #ffd700, #ff6b35);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background: linear-gradient(45deg, #3b82f6, #1d4ed8);
                color: white;
                text-decoration: none;
                border: none;
                border-radius: 8px;
                margin: 10px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: transform 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="logout-card">
            <h1>🚪 Logout Realizado</h1>
            <p>Você foi desconectado do painel administrativo.</p>
            <p>Para acessar novamente, será necessário inserir suas credenciais.</p>
            <div style="margin-top: 20px;">
                <a href="/admin" class="btn">🔐 Fazer Login Novamente</a>
                <a href="/" class="btn">🏠 Ir para Home</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// === MIDDLEWARE DE ERRO ===
router.use((error, req, res, next) => {
    console.error('Erro no admin:', error);

    if (req.xhr || req.headers.accept?.includes('application/json')) {
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro interno do admin',
                details: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
            }
        });
    } else {
        res.status(500).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>❌ Erro - Admin</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                  color: white;
                  text-align: center;
                  padding: 50px;
                  margin: 0;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .error-card {
                  background: rgba(239, 68, 68, 0.1);
                  padding: 40px;
                  border-radius: 15px;
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(239, 68, 68, 0.3);
                  max-width: 500px;
                  width: 100%;
              }
              h1 { 
                  font-size: 2.5em; 
                  margin-bottom: 20px;
                  color: #ef4444;
              }
              .btn {
                  display: inline-block;
                  padding: 12px 24px;
                  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
                  color: white;
                  text-decoration: none;
                  border: none;
                  border-radius: 8px;
                  margin: 10px;
                  cursor: pointer;
                  font-size: 0.9rem;
                  transition: transform 0.3s ease;
              }
              .btn:hover {
                  transform: translateY(-2px);
              }
          </style>
      </head>
      <body>
          <div class="error-card">
              <h1>❌ Erro no Admin</h1>
              <p>Ocorreu um erro interno no painel administrativo.</p>
              ${process.env.NODE_ENV === 'development' ? `<p><code>${error.message}</code></p>` : ''}
              <div style="margin-top: 20px;">
                  <a href="/admin" class="btn">🏠 Voltar ao Dashboard</a>
                  <a href="/admin/health" class="btn">🏥 Verificar Status</a>
              </div>
          </div>
      </body>
      </html>
    `);
    }
});

module.exports = router;