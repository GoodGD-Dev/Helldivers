const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por IP
  message: {
    error: 'Muitas requisições do mesmo IP',
    message: 'Tente novamente em alguns minutos',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita os headers `X-RateLimit-*`
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Muitas requisições do mesmo IP',
        type: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
      },
      timestamp: new Date().toISOString()
    });
  },
  skip: (req) => {
    // Pular rate limit para health check
    return req.path === '/health';
  }
});

module.exports = rateLimiter;