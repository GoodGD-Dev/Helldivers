const express = require('express');
const router = express.Router();

const {
  getAllPerks,
  getPerkById,
  createPerk,
  updatePerk,
  deletePerk
} = require('../controllers/perkController');

const { validate, validateId, validatePagination } = require('../middleware/validation');
const { perkValidator } = require('../validators/equipmentValidators');

// 📋 GET /api/perks - Listar todos
router.get('/', validatePagination, getAllPerks);

// 🔍 GET /api/perks/:id - Buscar por ID
router.get('/:id', validateId, getPerkById);

// ➕ POST /api/perks - Criar novo
router.post('/', validate(perkValidator), createPerk);

// ✏️ PUT /api/perks/:id - Atualizar
router.put('/:id', validateId, validate(perkValidator), updatePerk);

// 🗑️ DELETE /api/perks/:id - Deletar
router.delete('/:id', validateId, deletePerk);

module.exports = router;