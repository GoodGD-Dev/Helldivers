const Joi = require('joi');
const {
  PRIMARY_WEAPON_TYPES,
  SECONDARY_WEAPON_TYPES,
  VALIDATION_LIMITS
} = require('../utils/constants');
const {
  baseSchema,
  positiveNumberValidator,
  positiveIntegerValidator,
  enumValidator
} = require('./commonValidators');

// Validador para Armas Primárias
const primaryWeaponValidator = Joi.object({
  ...baseSchema,

  type: enumValidator('Tipo', PRIMARY_WEAPON_TYPES),

  damage: positiveNumberValidator('Dano', VALIDATION_LIMITS.DAMAGE_MIN, VALIDATION_LIMITS.DAMAGE_MAX),

  fireRate: positiveNumberValidator('Taxa de disparo', VALIDATION_LIMITS.FIRE_RATE_MIN, VALIDATION_LIMITS.FIRE_RATE_MAX),

  magazineSize: positiveIntegerValidator('Tamanho do carregador', VALIDATION_LIMITS.MAGAZINE_SIZE_MIN, VALIDATION_LIMITS.MAGAZINE_SIZE_MAX),

  reloadTime: positiveNumberValidator('Tempo de recarga', VALIDATION_LIMITS.RELOAD_TIME_MIN, VALIDATION_LIMITS.RELOAD_TIME_MAX)
});

// Validador para Armas Secundárias
const secondaryWeaponValidator = Joi.object({
  ...baseSchema,

  type: enumValidator('Tipo', SECONDARY_WEAPON_TYPES),

  damage: positiveNumberValidator('Dano', VALIDATION_LIMITS.DAMAGE_MIN, VALIDATION_LIMITS.DAMAGE_MAX),

  magazineSize: positiveIntegerValidator('Tamanho do carregador', VALIDATION_LIMITS.MAGAZINE_SIZE_MIN, 50), // Limite menor para secundárias

  reloadTime: positiveNumberValidator('Tempo de recarga', VALIDATION_LIMITS.RELOAD_TIME_MIN, 5) // Limite menor para secundárias
});

module.exports = {
  primaryWeaponValidator,
  secondaryWeaponValidator
};