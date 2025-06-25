// 🔫 Rotas para Armas Primárias
const express = require('express');
const router = express.Router();

const {
  getAllPrimaryWeapons,
  getPrimaryWeaponById,
  createPrimaryWeapon,
  updatePrimaryWeapon,
  deletePrimaryWeapon,
  getPrimaryWeaponStats
} = require('../controllers/primaryWeaponController');

const { validate, validateId, validatePagination } = require('../middleware/validation');
const { primaryWeaponValidator } = require('../validators/weaponValidators');

// 📊 GET /api/primary-weapons/stats - Estatísticas
router.get('/stats', getPrimaryWeaponStats);

// 📋 GET /api/primary-weapons - Listar todas as armas
router.get('/', validatePagination, getAllPrimaryWeapons);

// 🔍 GET /api/primary-weapons/:id - Buscar por ID
router.get('/:id', validateId, getPrimaryWeaponById);

// ➕ POST /api/primary-weapons - Criar nova arma
router.post('/', validate(primaryWeaponValidator), createPrimaryWeapon);

// ✏️ PUT /api/primary-weapons/:id - Atualizar arma
router.put('/:id', validateId, validate(primaryWeaponValidator), updatePrimaryWeapon);

// 🗑️ DELETE /api/primary-weapons/:id - Deletar arma
router.delete('/:id', validateId, deletePrimaryWeapon);

module.exports = router;