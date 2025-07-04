const mongoose = require('mongoose');
const { ARMOR_TYPES } = require('../utils/constants');

const armorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da armadura é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  type: {
    type: String,
    required: [true, 'Tipo da armadura é obrigatório'],
    enum: {
      values: ARMOR_TYPES,
      message: 'Tipo deve ser um dos seguintes: {VALUE}'
    }
  },
  passive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PassiveArmor',
    required: false
  },
  armorRating: {
    type: Number,
    required: [true, 'Rating da armadura é obrigatório'],
    min: [0, 'Rating da armadura não pode ser negativo'],
    max: [500, 'Rating da armadura não pode exceder 500']
  },
  speed: {
    type: Number,
    required: [true, 'Velocidade é obrigatória'],
    min: [0, 'Velocidade não pode ser negativa'],
    max: [100, 'Velocidade não pode exceder 100']
  },
  staminaRegen: {
    type: Number,
    required: [true, 'Regeneração de stamina é obrigatória'],
    min: [0, 'Regeneração de stamina não pode ser negativa'],
    max: [100, 'Regeneração de stamina não pode exceder 100']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
  },
  // 🖼️ CAMPO DE IMAGEM
  image: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^(https?:\/\/)|(\/uploads\/)|(data:image\/)/.test(v);
      },
      message: 'Image deve ser uma URL válida ou caminho de arquivo'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 📊 Virtual para classificação de mobilidade
armorSchema.virtual('mobilityRating').get(function () {
  const mobilityScore = (this.speed + this.staminaRegen) / 2;
  if (mobilityScore >= 80) return 'Excelente';
  if (mobilityScore >= 60) return 'Boa';
  if (mobilityScore >= 40) return 'Média';
  if (mobilityScore >= 20) return 'Baixa';
  return 'Muito Baixa';
});

// 📊 Virtual para classificação de proteção
armorSchema.virtual('protectionRating').get(function () {
  if (this.armorRating >= 400) return 'Máxima';
  if (this.armorRating >= 300) return 'Alta';
  if (this.armorRating >= 200) return 'Média';
  if (this.armorRating >= 100) return 'Baixa';
  return 'Mínima';
});

// 🖼️ Virtual para URL da imagem
armorSchema.virtual('imageUrl').get(function () {
  if (this.image) {
    // Se já é uma URL completa, retornar como está
    if (this.image.startsWith('http') || this.image.startsWith('/uploads/')) {
      return this.image;
    }
    // Se é apenas o nome do arquivo, adicionar o path completo
    return `/uploads/armors/${this.image}`;
  }
  // Imagem padrão baseada no tipo
  const defaultImages = {
    'Light': '/assets/images/armor-light-default.webp',
    'Medium': '/assets/images/armor-medium-default.webp',
    'Heavy': '/assets/images/armor-heavy-default.webp'
  };
  return defaultImages[this.type] || '/assets/images/armor-default.webp';
});

// 🔍 Índices para performance
armorSchema.index({ name: 1 });
armorSchema.index({ type: 1 });
armorSchema.index({ armorRating: -1 });
armorSchema.index({ speed: -1 });

// 🛡️ Middleware de validação
armorSchema.pre('save', function (next) {
  this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  next();
});

// Popular passiva automaticamente
armorSchema.pre(/^find/, function (next) {
  this.populate('passive');
  next();
});

module.exports = mongoose.model('Armor', armorSchema);