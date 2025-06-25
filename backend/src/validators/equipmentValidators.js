const Joi = require('joi');
const {
  THROWABLE_TYPES,
  STRATAGEM_CATEGORIES,
  ARMOR_TYPES,
  VALIDATION_LIMITS
} = require('../utils/constants');
const {
  baseSchema,
  positiveNumberValidator,
  positiveIntegerValidator,
  enumValidator,
  effectValidator
} = require('./commonValidators');

// Validador para Throwables (Granadas/Explosivos)
const throwableValidator = Joi.object({
  ...baseSchema,

  type: enumValidator('Tipo', THROWABLE_TYPES),

  damage: positiveNumberValidator('Dano', VALIDATION_LIMITS.DAMAGE_MIN, VALIDATION_LIMITS.DAMAGE_MAX),

  blastRadius: positiveNumberValidator('Raio de explosão', VALIDATION_LIMITS.BLAST_RADIUS_MIN, VALIDATION_LIMITS.BLAST_RADIUS_MAX)
});

// Validador para Stratagemas
const stratagemValidator = Joi.object({
  ...baseSchema,

  category: enumValidator('Categoria', STRATAGEM_CATEGORIES),

  cooldown: positiveNumberValidator('Cooldown', VALIDATION_LIMITS.COOLDOWN_MIN, VALIDATION_LIMITS.COOLDOWN_MAX),

  uses: positiveIntegerValidator('Número de usos', VALIDATION_LIMITS.USES_MIN, VALIDATION_LIMITS.USES_MAX)
});

// Validador para Armaduras
const armorValidator = Joi.object({
  ...baseSchema,

  type: enumValidator('Tipo', ARMOR_TYPES),

  passive: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Passive deve ser um ObjectId válido do MongoDB'
    }),

  armorRating: positiveNumberValidator('Rating da armadura', VALIDATION_LIMITS.ARMOR_RATING_MIN, VALIDATION_LIMITS.ARMOR_RATING_MAX),

  speed: positiveNumberValidator('Velocidade', VALIDATION_LIMITS.SPEED_MIN, VALIDATION_LIMITS.SPEED_MAX),

  staminaRegen: positiveNumberValidator('Regeneração de stamina', VALIDATION_LIMITS.STAMINA_REGEN_MIN, VALIDATION_LIMITS.STAMINA_REGEN_MAX)
});

// Validador para Passivas de Armadura
const passiveArmorValidator = Joi.object({
  ...baseSchema,

  effect: effectValidator
});

// Validador para Perks
const perkValidator = Joi.object({
  ...baseSchema,

  effect: effectValidator
});

module.exports = {
  throwableValidator,
  stratagemValidator,
  armorValidator,
  passiveArmorValidator,
  perkValidator
};