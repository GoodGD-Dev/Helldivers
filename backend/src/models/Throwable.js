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

// 📊 Virtual para área de dano (π * r²)
throwableSchema.virtual('blastArea').get(function () {
  return Math.round(Math.PI * Math.pow(this.blastRadius, 2) * 100) / 100;
});

// 📊 Virtual para dano por área
throwableSchema.virtual('damagePerArea').get(function () {
  const area = this.blastArea;
  return area > 0 ? Math.round((this.damage / area) * 100) / 100 : 0;
});

// 🖼️ Virtual para URL da imagem
throwableSchema.virtual('imageUrl').get(function () {
  if (this.image) {
    if (this.image.startsWith('http') || this.image.startsWith('data:')) {
      return this.image;
    }
    return `/uploads/throwables/${this.image}`;
  }
  // Imagem padrão baseada no tipo
  const defaultImages = {
    'Frag Grenade': '/assets/images/throwable-frag-default.webp',
    'Incendiary': '/assets/images/throwable-incendiary-default.webp',
    'Anti-Tank': '/assets/images/throwable-antitank-default.webp'
  };
  return defaultImages[this.type] || '/assets/images/throwable-default.webp';
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