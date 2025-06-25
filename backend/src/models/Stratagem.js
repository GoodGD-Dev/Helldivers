const mongoose = require('mongoose');
const { STRATAGEM_CATEGORIES } = require('../utils/constants');

const stratagemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do stratagem é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: {
      values: STRATAGEM_CATEGORIES,
      message: 'Categoria deve ser uma das seguintes: {VALUE}'
    }
  },
  cooldown: {
    type: Number,
    required: [true, 'Tempo de recarga é obrigatório'],
    min: [0, 'Tempo de recarga não pode ser negativo'],
    max: [600, 'Tempo de recarga não pode exceder 600 segundos']
  },
  uses: {
    type: Number,
    required: [true, 'Número de usos é obrigatório'],
    min: [1, 'Deve ter pelo menos 1 uso'],
    max: [999, 'Não pode exceder 999 usos']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 📊 Virtual para eficiência (usos por minuto)
stratagemSchema.virtual('efficiency').get(function () {
  const cooldownMinutes = this.cooldown / 60;
  return cooldownMinutes > 0 ? Math.round((this.uses / cooldownMinutes) * 100) / 100 : 0;
});

// 📊 Virtual para classificação de cooldown
stratagemSchema.virtual('cooldownRating').get(function () {
  if (this.cooldown <= 30) return 'Muito Rápido';
  if (this.cooldown <= 60) return 'Rápido';
  if (this.cooldown <= 120) return 'Médio';
  if (this.cooldown <= 300) return 'Lento';
  return 'Muito Lento';
});

// 🔍 Índices para performance
stratagemSchema.index({ name: 1 });
stratagemSchema.index({ category: 1 });
stratagemSchema.index({ cooldown: 1 });
stratagemSchema.index({ uses: -1 });

// 🛡️ Middleware de validação
stratagemSchema.pre('save', function (next) {
  this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  next();
});

module.exports = mongoose.model('Stratagem', stratagemSchema);