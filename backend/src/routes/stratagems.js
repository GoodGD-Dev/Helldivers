const express = require('express');
const router = express.Router();

const {
  getAllStratagems,
  getStratagemById,
  createStratagem,
  updateStratagem,
  deleteStratagem,
  getStratagemStats
} = require('../controllers/stratagemController');

const { validate, validateId, validatePagination } = require('../middleware/validation');
const { stratagemValidator } = require('../validators/equipmentValidators');

// 📊 GET /api/stratagems/stats - Estatísticas
router.get('/stats', getStratagemStats);

// 📋 GET /api/stratagems - Listar todos
router.get('/', validatePagination, getAllStratagems);

// 🔍 GET /api/stratagems/:id - Buscar por ID
router.get('/:id', validateId, getStratagemById);

// ➕ POST /api/stratagems - Criar novo
router.post('/', validate(stratagemValidator), createStratagem);

// ✏️ PUT /api/stratagems/:id - Atualizar
router.put('/:id', validateId, validate(stratagemValidator), updateStratagem);

// 🗑️ DELETE /api/stratagems/:id - Deletar
router.delete('/:id', validateId, deleteStratagem);

module.exports = router;