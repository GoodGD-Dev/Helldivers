const express = require('express');
const router = express.Router();

const {
  getAllSecondaryWeapons,
  getSecondaryWeaponById,
  createSecondaryWeapon,
  updateSecondaryWeapon,
  deleteSecondaryWeapon
} = require('../controllers/secondaryWeaponController');

const { validate, validateId, validatePagination } = require('../middleware/validation');
const { secondaryWeaponValidator } = require('../validators/weaponValidators');

// 📋 GET /api/secondary-weapons - Listar todas as armas
router.get('/', validatePagination, getAllSecondaryWeapons);

// 🔍 GET /api/secondary-weapons/:id - Buscar por ID
router.get('/:id', validateId, getSecondaryWeaponById);

// ➕ POST /api/secondary-weapons - Criar nova arma
router.post('/', validate(secondaryWeaponValidator), createSecondaryWeapon);

// ✏️ PUT /api/secondary-weapons/:id - Atualizar arma
router.put('/:id', validateId, validate(secondaryWeaponValidator), updateSecondaryWeapon);

// 🗑️ DELETE /api/secondary-weapons/:id - Deletar arma
router.delete('/:id', validateId, deleteSecondaryWeapon);

module.exports = router;