// Validação de parâmetros de rota
const validateRouteParams = (req, res, next) => {
  const { model, id } = req.params;

  // Lista de modelos válidos
  const validModels = [
    'primary-weapons',
    'secondary-weapons',
    'throwables',
    'stratagems',
    'armors',
    'passive-armors',
    'perks'
  ];

  // Validar modelo se fornecido
  if (model && !validModels.includes(model)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Modelo inválido',
        validModels: validModels
      }
    });
  }

  // Validar ID se fornecido
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'ID inválido',
        expected: 'ObjectId do MongoDB (24 caracteres hexadecimais)'
      }
    });
  }

  next();
};

// Validação de query parameters para busca
const validateSearchParams = (req, res, next) => {
  const { page, limit, search, filter } = req.query;

  // Validar página
  if (page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Parâmetro "page" inválido',
          expected: 'Número inteiro maior que 0'
        }
      });
    }
    req.query.page = pageNum;
  }

  // Validar limite
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Parâmetro "limit" inválido',
          expected: 'Número inteiro entre 1 e 100'
        }
      });
    }
    req.query.limit = limitNum;
  }

  // Sanitizar busca
  if (search && typeof search === 'string') {
    req.query.search = search.trim().substring(0, 100);
  }

  // Sanitizar filtro
  if (filter && typeof filter === 'string') {
    req.query.filter = filter.trim().substring(0, 50);
  }

  next();
};

// Validação de dados do formulário
const validateFormData = (req, res, next) => {
  const { body } = req;

  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Dados do formulário inválidos',
        expected: 'Objeto JSON válido'
      }
    });
  }

  // Validações gerais para todos os modelos
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nome inválido',
          expected: 'String com pelo menos 2 caracteres'
        }
      });
    }
    body.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Descrição inválida',
          expected: 'String com pelo menos 5 caracteres'
        }
      });
    }
    body.description = body.description.trim();
  }

  // Validar números se fornecidos
  const numberFields = ['damage', 'fireRate', 'magazineSize', 'reloadTime', 'blastRadius',
    'cooldown', 'uses', 'armorRating', 'speed', 'staminaRegen'];

  numberFields.forEach(field => {
    if (body[field] !== undefined) {
      const num = parseFloat(body[field]);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Campo "${field}" inválido`,
            expected: 'Número maior ou igual a 0'
          }
        });
      }
      body[field] = num;
    }
  });

  next();
};

// Validação de headers necessários
const validateHeaders = (req, res, next) => {
  // Verificar Content-Type para requisições POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Content-Type inválido',
          expected: 'application/json'
        }
      });
    }
  }

  next();
};

// Sanitização de dados de entrada
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  // Sanitizar body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitizar query
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Rate limiting específico para admin
const adminRateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const maxRequests = 60; // 60 requests por minuto

  if (!global.adminRateLimitStore) {
    global.adminRateLimitStore = new Map();
  }

  const key = `admin_${ip}`;
  const requests = global.adminRateLimitStore.get(key) || [];

  // Remover requests antigos
  const validRequests = requests.filter(time => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: {
        message: 'Muitas requisições do admin',
        retryAfter: Math.ceil(windowMs / 1000)
      }
    });
  }

  // Adicionar request atual
  validRequests.push(now);
  global.adminRateLimitStore.set(key, validRequests);

  next();
};

module.exports = {
  validateRouteParams,
  validateSearchParams,
  validateFormData,
  validateHeaders,
  sanitizeInput,
  adminRateLimit
};