const fs = require('fs').promises;
const path = require('path');

class AdminController {
  constructor() {
    this.viewsPath = path.join(__dirname, '../views');
    this.publicPath = path.join(__dirname, '../public');

    // Bind dos métodos para preservar o contexto
    this.dashboard = this.dashboard.bind(this);
    this.serveCSS = this.serveCSS.bind(this);
    this.serveJS = this.serveJS.bind(this);
    this.getSessionInfo = this.getSessionInfo.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  // Renderizar dashboard principal
  async dashboard(req, res) {
    try {
      const layoutHtml = await this.loadTemplate('layout.html');
      const dashboardHtml = await this.loadTemplate('dashboard.html');

      const finalHtml = layoutHtml.replace('{{CONTENT}}', dashboardHtml);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(finalHtml);
    } catch (error) {
      console.error('Erro ao renderizar dashboard:', error);

      // Fallback HTML em caso de erro
      const fallbackHtml = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🎮 Helldivers 2 - Admin Panel</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: white;
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .fallback-container {
                    max-width: 600px;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                }
                h1 {
                    background: linear-gradient(45deg, #ffd700, #ff6b35);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 20px;
                }
                .error-message {
                    color: #ef4444;
                    margin: 20px 0;
                    padding: 15px;
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 8px;
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
            <div class="fallback-container">
                <h1>🎮 Helldivers 2 Admin Panel</h1>
                <div class="error-message">
                    ⚠️ Erro ao carregar templates<br>
                    ${error.message}
                </div>
                <p>O admin está funcionando, mas os templates HTML não foram encontrados.</p>
                <div class="fallback-actions">
                    <a href="/api" class="btn">📡 Ver API</a>
                    <a href="/health" class="btn">🏥 Health Check</a>
                    <button onclick="location.reload()" class="btn">🔄 Tentar Novamente</button>
                </div>
            </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(fallbackHtml);
    }
  }

  // Servir arquivos CSS
  async serveCSS(req, res) {
    try {
      const filename = req.params.filename;
      const cssPath = path.join(this.publicPath, 'css', filename);

      console.log(`📄 Servindo CSS: ${filename} de ${cssPath}`);

      const css = await fs.readFile(cssPath, 'utf8');


      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(css);
    } catch (error) {
      console.error('Erro ao servir CSS:', error);

      // CSS mínimo de fallback
      const fallbackCSS = `
        /* CSS Fallback - Admin Panel */
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .fallback-container {
            max-width: 600px;
            margin: 50px auto;
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 {
            background: linear-gradient(45deg, #ffd700, #ff6b35);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 20px;
        }
        .error-message {
            color: #ef4444;
            margin: 20px 0;
            padding: 15px;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 8px;
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
        /* Erro no CSS: ${error.message} */
      `;

      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.status(404).send(fallbackCSS);
    }
  }

  // Servir arquivos JavaScript
  async serveJS(req, res) {
    try {
      const filename = req.params.filename;
      const jsPath = path.join(this.publicPath, 'js', filename);

      console.log(`📄 Servindo JS: ${filename} de ${jsPath}`);

      const js = await fs.readFile(jsPath, 'utf8');

      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(js);
    } catch (error) {
      console.error('Erro ao servir JS:', error);

      // JavaScript mínimo de fallback
      const fallbackJS = `
        // JavaScript Fallback - Admin Panel
        console.log('🎮 Helldivers 2 Admin Panel - Fallback JS');
        console.error('❌ Erro ao carregar arquivo JavaScript: ${req.path}');
        console.error('Erro específico: ${error.message}');
        
        // Funcionalidade básica de fallback
        window.AdminFallback = {
            showError(message) {
                console.error('Admin Error:', message);
                if (typeof alert !== 'undefined') {
                    alert('Erro no Admin Panel: ' + message);
                }
            },
            
            init() {
                console.log('🔧 Admin em modo fallback');
                
                // Mostrar erro na tela se possível
                if (typeof document !== 'undefined') {
                    const container = document.body;
                    if (container) {
                        const errorDiv = document.createElement('div');
                        errorDiv.style.cssText = \`
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            background: #ef4444;
                            color: white;
                            padding: 15px;
                            border-radius: 8px;
                            z-index: 9999;
                            max-width: 300px;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                        \`;
                        errorDiv.innerHTML = \`
                            <strong>⚠️ Erro no Admin</strong><br>
                            Arquivo JS não carregou: ${filename}<br>
                            <small>Erro: ${error.message}</small><br>
                            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: white; color: black; border: none; border-radius: 4px; cursor: pointer;">Fechar</button>
                        \`;
                        container.appendChild(errorDiv);
                        
                        // Remover após 10 segundos
                        setTimeout(() => {
                            if (errorDiv.parentElement) {
                                errorDiv.remove();
                            }
                        }, 10000);
                    }
                }
            }
        };
        
        // Inicializar fallback
        if (typeof document !== 'undefined') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => AdminFallback.init());
            } else {
                AdminFallback.init();
            }
        } else {
            AdminFallback.init();
        }
        
        console.log('📄 JavaScript fallback carregado para arquivo:', '${filename}');
        console.log('🔍 Caminho solicitado:', '${req.path}');
        console.log('📁 Caminho físico tentado:', '${jsPath}');
      `;


      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.status(404).send(fallbackJS);
    }
  }

  // Carregar template
  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(this.viewsPath, templateName);
      console.log(`📄 Carregando template: ${templatePath}`);
      return await fs.readFile(templatePath, 'utf8');
    } catch (error) {
      console.error(`Erro ao carregar template ${templateName}:`, error);
      throw new Error(`Template ${templateName} não encontrado em ${this.viewsPath}`);
    }
  }

  // Info da sessão admin
  getSessionInfo(req, res) {
    res.json({
      success: true,
      data: {
        user: req.user || 'admin',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        authenticated: true,
        server: {
          uptime: process.uptime(),
          memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          version: process.version
        }
      }
    });
  }

  // Estatísticas gerais
  async getStats(req, res) {
    try {
      // Importar modelos dinamicamente para evitar dependências circulares
      const PrimaryWeapon = require('../../models/PrimaryWeapon');
      const SecondaryWeapon = require('../../models/SecondaryWeapon');
      const Throwable = require('../../models/Throwable');
      const Stratagem = require('../../models/Stratagem');
      const Armor = require('../../models/Armor');
      const PassiveArmor = require('../../models/PassiveArmor');
      const Perk = require('../../models/Perk');

      const stats = await Promise.all([
        PrimaryWeapon.countDocuments(),
        SecondaryWeapon.countDocuments(),
        Throwable.countDocuments(),
        Stratagem.countDocuments(),
        Armor.countDocuments(),
        PassiveArmor.countDocuments(),
        Perk.countDocuments()
      ]);

      const totalItems = stats.reduce((sum, count) => sum + count, 0);

      res.json({
        success: true,
        data: {
          totalItems,
          breakdown: {
            'primary-weapons': stats[0],
            'secondary-weapons': stats[1],
            'throwables': stats[2],
            'stratagems': stats[3],
            'armors': stats[4],
            'passive-armors': stats[5],
            'perks': stats[6]
          },
          timestamp: new Date().toISOString(),
          server: {
            uptime: process.uptime(),
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao obter estatísticas',
          details: error.message
        }
      });
    }
  }

  // Diagnóstico de arquivos (útil para debug)
  async diagnose(req, res) {
    try {
      const jsDir = path.join(this.publicPath, 'js');
      const cssDir = path.join(this.publicPath, 'css');

      const jsFiles = await fs.readdir(jsDir).catch(() => []);
      const cssFiles = await fs.readdir(cssDir).catch(() => []);

      res.json({
        success: true,
        data: {
          paths: {
            views: this.viewsPath,
            public: this.publicPath,
            js: jsDir,
            css: cssDir
          },
          files: {
            js: jsFiles,
            css: cssFiles
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

// Exportar instância única
module.exports = new AdminController();