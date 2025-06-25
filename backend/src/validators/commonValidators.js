const Joi = require('joi');
const { VALIDATION_LIMITS } = require('../utils/constants');

// Schema base para campos comuns
const baseSchema = {
  name: Joi.string()
    .min(VALIDATION_LIMITS.NAME_MIN_LENGTH)
    .max(VALIDATION_LIMITS.NAME_MAX_LENGTH)
    .trim()
    .required()
    .messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': `Nome deve ter pelo menos ${VALIDATION_LIMITS.NAME_MIN_LENGTH} caracteres`,
      'string.max': `Nome deve ter no máximo ${VALIDATION_LIMITS.NAME_MAX_LENGTH} caracteres`,
      'any.required': 'Nome é obrigatório'
    }),

  description: Joi.string()
    .max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH)
    .trim()
    .required()
    .messages({
      'string.empty': 'Descrição é obrigatória',
      'string.max': `Descrição deve ter no máximo ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} caracteres`,
      'any.required': 'Descrição é obrigatória'
    })
};

// Validador para parâmetros de paginação
const paginationValidator = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': 'Página deve ser um número inteiro',
      'number.min': 'Página deve ser maior que 0'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.integer': 'Limit deve ser um número inteiro',
      'number.min': 'Limit deve ser maior que 0',
      'number.max': 'Limit não pode exceder 100'
    })
});

// Validador para filtros de busca
const searchFiltersValidator = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Nome para busca deve ter pelo menos 1 caractere',
      'string.max': 'Nome para busca deve ter no máximo 100 caracteres'
    }),

  type: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'Tipo para busca deve ter pelo menos 1 caractere',
      'string.max': 'Tipo para busca deve ter no máximo 50 caracteres'
    }),

  category: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'Categoria para busca deve ter pelo menos 1 caractere',
      'string.max': 'Categoria para busca deve ter no máximo 50 caracteres'
    })
});

// Validador para ObjectId do MongoDB
const objectIdValidator = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'ID deve ser um ObjectId válido do MongoDB',
    'any.required': 'ID é obrigatório'
  });

// Validador para números positivos
const positiveNumberValidator = (fieldName, min = 0, max = 10000) => {
  return Joi.number()
    .min(min)
    .max(max)
    .required()
    .messages({
      'number.min': `${fieldName} deve ser pelo menos ${min}`,
      'number.max': `${fieldName} não pode exceder ${max}`,
      'any.required': `${fieldName} é obrigatório`
    });
};

// Validador para números inteiros positivos
const positiveIntegerValidator = (fieldName, min = 1, max = 1000) => {
  return Joi.number()
    .integer()
    .min(min)
    .max(max)
    .required()
    .messages({
      'number.integer': `${fieldName} deve ser um número inteiro`,
      'number.min': `${fieldName} deve ser pelo menos ${min}`,
      'number.max': `${fieldName} não pode exceder ${max}`,
      'any.required': `${fieldName} é obrigatório`
    });
};

// Validador para enum (lista de valores válidos)
const enumValidator = (fieldName, validValues) => {
  return Joi.string()
    .valid(...validValues)
    .required()
    .messages({
      'any.only': `${fieldName} deve ser um dos seguintes: ${validValues.join(', ')}`,
      'any.required': `${fieldName} é obrigatório`
    });
};

// Validador para campos de efeito/passiva
const effectValidator = Joi.string()
  .max(200)
  .trim()
  .required()
  .messages({
    'string.empty': 'Efeito é obrigatório',
    'string.max': 'Efeito deve ter no máximo 200 caracteres',
    'any.required': 'Efeito é obrigatório'
  });

// Função para criar validadores dinâmicos
const createValidator = (schema) => {
  return Joi.object(schema);
};

module.exports = {
  baseSchema,
  paginationValidator,
  searchFiltersValidator,
  objectIdValidator,
  positiveNumberValidator,
  positiveIntegerValidator,
  enumValidator,
  effectValidator,
  createValidator
};