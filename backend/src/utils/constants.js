// 🔫 Tipos de Armas Primárias
const PRIMARY_WEAPON_TYPES = [
  'Assault Rifle',
  'Shotgun',
  'Sniper',
  'SMG',
  'LMG',
  'DMR'
];

// 🔫 Tipos de Armas Secundárias
const SECONDARY_WEAPON_TYPES = [
  'Pistol',
  'Revolver',
  'Auto Pistol',
];

// 💣 Tipos de Explosivos/Granadas
const THROWABLE_TYPES = [
  'Frag Grenade',
  'Incendiary',
  'Anti-Tank',
  'Proximity Mine'
];

// 📡 Categorias de Stratagemas
const STRATAGEM_CATEGORIES = [
  'Defensive',
  'Offensive',
  'Supply'
];

// 🛡️ Tipos de Armadura
const ARMOR_TYPES = [
  'Light',
  'Medium',
  'Heavy'
];

// 📊 Status HTTP
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
};

// 📝 Mensagens de Erro Padrão
const ERROR_MESSAGES = {
  NOT_FOUND: 'Item não encontrado',
  VALIDATION_ERROR: 'Dados inválidos fornecidos',
  DUPLICATE_ENTRY: 'Item já existe',
  INTERNAL_ERROR: 'Erro interno do servidor',
  INVALID_ID: 'ID inválido fornecido'
};

// ✅ Mensagens de Sucesso
const SUCCESS_MESSAGES = {
  CREATED: 'Item criado com sucesso',
  UPDATED: 'Item atualizado com sucesso',
  DELETED: 'Item deletado com sucesso',
  FOUND: 'Item encontrado'
};

// 🔢 Limites de Validação
const VALIDATION_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  DAMAGE_MIN: 0,
  DAMAGE_MAX: 10000,
  FIRE_RATE_MIN: 0,
  FIRE_RATE_MAX: 2000,
  MAGAZINE_SIZE_MIN: 1,
  MAGAZINE_SIZE_MAX: 200,
  RELOAD_TIME_MIN: 0.1,
  RELOAD_TIME_MAX: 10,
  BLAST_RADIUS_MIN: 0,
  BLAST_RADIUS_MAX: 100,
  COOLDOWN_MIN: 0,
  COOLDOWN_MAX: 600,
  USES_MIN: 1,
  USES_MAX: 999,
  ARMOR_RATING_MIN: 0,
  ARMOR_RATING_MAX: 500,
  SPEED_MIN: 0,
  SPEED_MAX: 100,
  STAMINA_REGEN_MIN: 0,
  STAMINA_REGEN_MAX: 100
};

module.exports = {
  PRIMARY_WEAPON_TYPES,
  SECONDARY_WEAPON_TYPES,
  THROWABLE_TYPES,
  STRATAGEM_CATEGORIES,
  ARMOR_TYPES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_LIMITS
};