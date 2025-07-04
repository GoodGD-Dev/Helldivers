const mongoose = require('mongoose');

const passiveArmorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da passiva é obrigatório'],
    unique: true,
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  effect: {
    type: String,
    required: [true, 'Efeito da passiva é obrigatório'],
    trim: true,
    maxlength: [200, 'Efeito deve ter no máximo 200 caracteres']
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

// 🖼️ Virtual para URL da imagem
passiveArmorSchema.virtual('imageUrl').get(function () {
  if (this.image) {
    // Se já é uma URL completa, retornar como está
    if (this.image.startsWith('http') || this.image.startsWith('/uploads/')) {
      return this.image;
    }
    // Se é apenas o nome do arquivo, adicionar o path completo
    return `/uploads/pasive-armors/${this.image}`;
  }
  // Imagem padrão para passivas (pode ser baseada no efeito)
  return '/assets/images/passive-armor-default.webp';
});

// ✅ CORREÇÃO: Removido schema.index({ name: 1 }) 
// O "unique: true" já cria automaticamente o índice necessário

// 🛡️ Middleware de validação
passiveArmorSchema.pre('save', function (next) {
  this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  next();
});

module.exports = mongoose.model('PassiveArmor', passiveArmorSchema);