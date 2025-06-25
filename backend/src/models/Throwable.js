const mongoose = require('mongoose');
const { THROWABLE_TYPES } = require('../utils/constants');

const throwableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do item é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  type: {
    type: String,
    required: [true, 'Tipo do explosivo é obrigatório'],
    enum: {
      values: THROWABLE_TYPES,
      message: 'Tipo deve ser um dos seguintes: {VALUE}'
    }
  },
  damage: {
    type: Number,
    required: [true, 'Dano é obrigatório'],
    min: [0, 'Dano não pode ser negativo'],
    max: [10000, 'Dano não pode exceder 10000']
  },
  blastRadius: {
    type: Number,
    required: [true, 'Raio de explosão é obrigatório'],
    min: [0, 'Raio de explosão não pode ser negativo'],
    max: [100, 'Raio de explosão não pode exceder 100 metros']
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

// 📊 Virtual para área de dano (π * r²)
throwableSchema.virtual('blastArea').get(function () {
  return Math.round(Math.PI * Math.pow(this.blastRadius, 2) * 100) / 100;
});

// 📊 Virtual para dano por área
throwableSchema.virtual('damagePerArea').get(function () {
  const area = this.blastArea;
  return area > 0 ? Math.round((this.damage / area) * 100) / 100 : 0;
});

// 🔍 Índices para performance
throwableSchema.index({ name: 1 });
throwableSchema.index({ type: 1 });
throwableSchema.index({ damage: -1 });
throwableSchema.index({ blastRadius: -1 });

// 🛡️ Middleware de validação
throwableSchema.pre('save', function (next) {
  this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  next();
});

module.exports = mongoose.model('Throwable', throwableSchema);