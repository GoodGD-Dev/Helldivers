const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro para debugging
  console.error('❌ Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Erro de Cast do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    error.message = ERROR_MESSAGES.INVALID_ID;
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
  }

  // Erro de Validação do Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', ');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
  }

  // Erro de Duplicação do MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} já existe: ${err.keyValue[field]}`;
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
  }

  // Erro de JSON malformado
  if (err.type === 'entity.parse.failed') {
    error.message = 'JSON inválido fornecido';
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
  }

  // Estrutura da resposta de erro
  const errorResponse = {
    success: false,
    error: {
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_ERROR).json(errorResponse);
};

module.exports = errorHandler;