const express = require('express');
const router = express.Router();

const {
  getAllArmors,
  getArmorById,
  createArmor,
  updateArmor,
  deleteArmor,
  getArmorStats
} = require('../controllers/armorController');

const { validate, validateId, validatePagination } = require('../middleware/validation');
const { armorValidator } = require('../validators/equipmentValidators');

// 📊 GET /api/armors/stats - Estatísticas
router.get('/stats', getArmorStats);

// 📋 GET /api/armors - Listar todas
router.get('/', validatePagination, getAllArmors);

// 🔍 GET /api/armors/:id - Buscar por ID
router.get('/:id', validateId, getArmorById);

// ➕ POST /api/armors - Criar nova
router.post('/', validate(armorValidator), createArmor);

// ✏️ PUT /api/armors/:id - Atualizar
router.put('/:id', validateId, validate(armorValidator), updateArmor);

// 🗑️ DELETE /api/armors/:id - Deletar
router.delete('/:id', validateId, deleteArmor);

module.exports = router;