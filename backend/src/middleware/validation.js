const { HTTP_STATUS } = require('../utils/constants');

// Middleware genérico de validação
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'Dados de validação inválidos',
          details: errorMessages
        },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// Validação de parâmetros de ID
const validateId = (req, res, next) => {
  const { id } = req.params;

  // Verificar se é um ObjectId válido do MongoDB
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'ID inválido fornecido',
        details: ['ID deve ser um ObjectId válido do MongoDB']
      },
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Validação de query parameters para paginação
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'Parâmetro de paginação inválido',
        details: ['page deve ser um número maior que 0']
      },
      timestamp: new Date().toISOString()
    });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'Parâmetro de paginação inválido',
        details: ['limit deve ser um número entre 1 e 100']
      },
      timestamp: new Date().toISOString()
    });
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };

  next();
};

module.exports = {
  validate,
  validateId,
  validatePagination
};