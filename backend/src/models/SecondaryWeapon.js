const mongoose = require('mongoose');
const { SECONDARY_WEAPON_TYPES } = require('../utils/constants');

const secondaryWeaponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da arma é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  type: {
    type: String,
    required: [true, 'Tipo da arma é obrigatório'],
    enum: {
      values: SECONDARY_WEAPON_TYPES,
      message: 'Tipo deve ser um dos seguintes: {VALUE}'
    }
  },
  damage: {
    type: Number,
    required: [true, 'Dano é obrigatório'],
    min: [0, 'Dano não pode ser negativo'],
    max: [10000, 'Dano não pode exceder 10000']
  },
  // 🔥 ADICIONAR CAMPO FIRE RATE QUE ESTAVA FALTANDO
  fireRate: {
    type: Number,
    required: [true, 'Taxa de disparo é obrigatória'],
    min: [0, 'Taxa de disparo não pode ser negativa'],
    max: [2000, 'Taxa de disparo não pode exceder 2000']
  },
  magazineSize: {
    type: Number,
    required: [true, 'Tamanho do carregador é obrigatório'],
    min: [1, 'Carregador deve ter pelo menos 1 munição'],
    max: [50, 'Carregador não pode exceder 50 munições']
  },
  reloadTime: {
    type: Number,
    required: [true, 'Tempo de recarga é obrigatório'],
    min: [0.1, 'Tempo de recarga deve ser pelo menos 0.1 segundos'],
    max: [5, 'Tempo de recarga não pode exceder 5 segundos']
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

// 📊 Virtual para DPS (Damage Per Second) - ADICIONADO
secondaryWeaponSchema.virtual('dps').get(function () {
  return Math.round((this.damage * this.fireRate / 60) * 100) / 100;
});

// 📊 Virtual para Damage Per Magazine
secondaryWeaponSchema.virtual('damagePerMagazine').get(function () {
  return this.damage * this.magazineSize;
});

// 🖼️ Virtual para URL da imagem
secondaryWeaponSchema.virtual('imageUrl').get(function () {
  if (this.image) {
    // Se já é uma URL completa, retornar como está
    if (this.image.startsWith('http') || this.image.startsWith('/uploads/')) {
      return this.image;
    }
    // Se é apenas o nome do arquivo, adicionar o path completo
    return `/uploads/primary-weapons/${this.image}`;
  }
  // Imagem padrão baseada no tipo
  const defaultImages = {
    'Pistol': '/assets/images/secondary-pistol-default.webp',
    'Revolver': '/assets/images/secondary-revolver-default.webp',
    'Auto Pistol': '/assets/images/secondary-auto-default.webp'
  };
  return defaultImages[this.type] || '/assets/images/secondary-weapon-default.webp';
});

// 🔍 Índices para performance
secondaryWeaponSchema.index({ name: 1 });
secondaryWeaponSchema.index({ type: 1 });
secondaryWeaponSchema.index({ damage: -1 });

// 🛡️ Middleware de validação
secondaryWeaponSchema.pre('save', function (next) {
  this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  next();
});

module.exports = mongoose.model('SecondaryWeapon', secondaryWeaponSchema);