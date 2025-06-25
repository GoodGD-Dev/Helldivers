const express = require('express');
const router = express.Router();

const {
  getAllPassiveArmors,
  getPassiveArmorById,
  createPassiveArmor,
  updatePassiveArmor,
  deletePassiveArmor
} = require('../controllers/passiveArmorController');

const { validate, validateId, validatePagination } = require('../middleware/validation');
const { passiveArmorValidator } = require('../validators/equipmentValidators');

// 📋 GET /api/passive-armors - Listar todas
router.get('/', validatePagination, getAllPassiveArmors);

// 🔍 GET /api/passive-armors/:id - Buscar por ID
router.get('/:id', validateId, getPassiveArmorById);

// ➕ POST /api/passive-armors - Criar nova
router.post('/', validate(passiveArmorValidator), createPassiveArmor);

// ✏️ PUT /api/passive-armors/:id - Atualizar
router.put('/:id', validateId, validate(passiveArmorValidator), updatePassiveArmor);

// 🗑️ DELETE /api/passive-armors/:id - Deletar
router.delete('/:id', validateId, deletePassiveArmor);

module.exports = router;