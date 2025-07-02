const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>🔐 Admin Login</title>
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
                    .login-card {
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
                    .credentials {
                        background: rgba(0, 0, 0, 0.3);
                        padding: 20px;
                        border-radius: 10px;
                        margin-top: 20px;
                        border-left: 4px solid #ffd700;
                    }
                    code {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 5px 10px;
                        border-radius: 5px;
                        font-family: 'Courier New', monospace;
                    }
                </style>
            </head>
            <body>
                <div class="login-card">
                    <h1>🔐 Admin Area</h1>
                    <p>Autenticação necessária para acessar o painel administrativo</p>
                    <div class="credentials">
                        <p><strong>Username:</strong> <code>${process.env.ADMIN_USERNAME || 'admin'}</code></p>
                        <p><strong>Password:</strong> <code>${process.env.ADMIN_PASSWORD || 'helldivers123'}</code></p>
                    </div>
                    <p style="margin-top: 20px; font-size: 0.9em; color: #ccc;">
                        Ambiente: ${process.env.NODE_ENV || 'development'}
                    </p>
                </div>
            </body>
            </html>
        `);
  }

  try {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const username = credentials[0];
    const password = credentials[1];

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'helldivers123';

    // Log da tentativa de login
    console.log('🔐 Tentativa de login admin:', {
      provided: username,
      expected: adminUsername,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    if (username === adminUsername && password === adminPassword) {
      console.log('✅ Login admin autorizado:', username);
      req.user = username; // Adicionar usuário à requisição
      next();
    } else {
      console.log('❌ Login admin negado:', username);
      res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
      return res.status(401).send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>❌ Acesso Negado</title>
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
                        .error-card {
                            background: rgba(239, 68, 68, 0.1);
                            padding: 40px;
                            border-radius: 15px;
                            backdrop-filter: blur(10px);
                            border: 1px solid rgba(239, 68, 68, 0.3);
                            max-width: 400px;
                            width: 100%;
                        }
                        h1 { 
                            font-size: 2.5em; 
                            margin-bottom: 20px;
                            color: #ef4444;
                        }
                        .retry-info {
                            background: rgba(0, 0, 0, 0.3);
                            padding: 20px;
                            border-radius: 10px;
                            margin-top: 20px;
                            border-left: 4px solid #ef4444;
                        }
                        code {
                            background: rgba(255, 255, 255, 0.1);
                            padding: 5px 10px;
                            border-radius: 5px;
                            font-family: 'Courier New', monospace;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-card">
                        <h1>❌ Acesso Negado</h1>
                        <p>Credenciais inválidas fornecidas</p>
                        <div class="retry-info">
                            <p><strong>Credenciais corretas:</strong></p>
                            <p>Username: <code>${adminUsername}</code></p>
                            <p>Password: <code>${adminPassword}</code></p>
                        </div>
                        <p style="margin-top: 20px; font-size: 0.9em; color: #ccc;">
                            Tentativa de: ${username} em ${new Date().toLocaleString('pt-BR')}
                        </p>
                    </div>
                </body>
                </html>
            `);
    }
  } catch (error) {
    console.error('❌ Erro na autenticação admin:', error);
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Erro na autenticação');
  }
};

// Middleware para verificar se a autenticação deve ser aplicada
const requireAuth = (req, res, next) => {
  const shouldAuth = process.env.NODE_ENV === 'production' ||
    process.env.ADMIN_AUTH === 'true';

  if (shouldAuth) {
    console.log('🔐 Autenticação do Admin ATIVADA');
    console.log('👤 Username esperado:', process.env.ADMIN_USERNAME || 'admin');
    console.log('🔑 Password configurado:', process.env.ADMIN_PASSWORD ? '***' : 'helldivers123');
    return basicAuth(req, res, next);
  } else {
    console.log('🔓 Autenticação do Admin DESATIVADA (desenvolvimento)');
    req.user = 'admin'; // Mock user para desenvolvimento
    next();
  }
};

// Middleware para logging de acesso
const logAccess = (req, res, next) => {
  console.log('📊 Acesso ao Admin:', {
    user: req.user || 'anonymous',
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
};

module.exports = {
  basicAuth,
  requireAuth,
  logAccess
};