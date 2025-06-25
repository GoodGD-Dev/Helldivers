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
  }
}, {
  timestamps: true
});

// 🔍 Índices para performance
passiveArmorSchema.index({ name: 1 });

// 🛡️ Middleware de validação
passiveArmorSchema.pre('save', function (next) {
  this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  next();
});

module.exports = mongoose.model('PassiveArmor', passiveArmorSchema);