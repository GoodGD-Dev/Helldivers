const express = require('express');
const router = express.Router();

const {
  getAllThrowables,
  getThrowableById,
  createThrowable,
  updateThrowable,
  deleteThrowable,
  getThrowableStats
} = require('../controllers/throwableController');

const { validate, validateId, validatePagination } = require('../middleware/validation');
const { throwableValidator } = require('../validators/equipmentValidators');

// 📊 GET /api/throwables/stats - Estatísticas
router.get('/stats', getThrowableStats);

// 📋 GET /api/throwables - Listar todos
router.get('/', validatePagination, getAllThrowables);

// 🔍 GET /api/throwables/:id - Buscar por ID
router.get('/:id', validateId, getThrowableById);

// ➕ POST /api/throwables - Criar novo
router.post('/', validate(throwableValidator), createThrowable);

// ✏️ PUT /api/throwables/:id - Atualizar
router.put('/:id', validateId, validate(throwableValidator), updateThrowable);

// 🗑️ DELETE /api/throwables/:id - Deletar
router.delete('/:id', validateId, deleteThrowable);

module.exports = router;