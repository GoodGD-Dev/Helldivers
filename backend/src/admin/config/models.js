const modelsConfig = {
  'primary-weapons': {
    name: 'Armas Primárias',
    icon: '🔫',
    description: 'Rifles, shotguns e outras armas principais',
    category: 'weapons',
    apiEndpoint: '/api/primary-weapons',
    fields: {
      name: {
        type: 'text',
        label: 'Nome',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      type: {
        type: 'select',
        label: 'Tipo',
        required: true,
        options: ['Assault Rifle', 'Shotgun', 'Sniper', 'SMG', 'LMG', 'DMR'],
        searchable: true
      },
      damage: {
        type: 'number',
        label: 'Dano',
        required: true,
        min: 0,
        max: 10000,
        step: 1,
        unit: 'HP'
      },
      fireRate: {
        type: 'number',
        label: 'Taxa de Disparo',
        required: true,
        min: 0,
        max: 2000,
        step: 1,
        unit: 'RPM'
      },
      magazineSize: {
        type: 'number',
        label: 'Tamanho do Carregador',
        required: true,
        min: 1,
        max: 200,
        step: 1,
        unit: 'munições'
      },
      reloadTime: {
        type: 'number',
        label: 'Tempo de Recarga',
        required: true,
        min: 0.1,
        max: 10,
        step: 0.1,
        unit: 'segundos'
      },
      description: {
        type: 'textarea',
        label: 'Descrição',
        required: true,
        validation: {
          maxLength: 500
        }
      }
    },
    displayFields: ['name', 'type', 'damage', 'fireRate'],
    sortBy: 'damage',
    sortOrder: 'desc'
  },

  'secondary-weapons': {
    name: 'Armas Secundárias',
    icon: '🔫',
    description: 'Pistolas e revólveres',
    category: 'weapons',
    apiEndpoint: '/api/secondary-weapons',
    fields: {
      name: {
        type: 'text',
        label: 'Nome',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      type: {
        type: 'select',
        label: 'Tipo',
        required: true,
        options: ['Pistol', 'Revolver', 'Auto Pistol'],
        searchable: true
      },
      damage: {
        type: 'number',
        label: 'Dano',
        required: true,
        min: 0,
        max: 10000,
        step: 1,
        unit: 'HP'
      },
      magazineSize: {
        type: 'number',
        label: 'Tamanho do Carregador',
        required: true,
        min: 1,
        max: 50,
        step: 1,
        unit: 'munições'
      },
      reloadTime: {
        type: 'number',
        label: 'Tempo de Recarga',
        required: true,
        min: 0.1,
        max: 5,
        step: 0.1,
        unit: 'segundos'
      },
      description: {
        type: 'textarea',
        label: 'Descrição',
        required: true,
        validation: {
          maxLength: 500
        }
      }
    },
    displayFields: ['name', 'type', 'damage', 'magazineSize'],
    sortBy: 'damage',
    sortOrder: 'desc'
  },

  'throwables': {
    name: 'Explosivos',
    icon: '💣',
    description: 'Granadas e outros explosivos',
    category: 'equipment',
    apiEndpoint: '/api/throwables',
    fields: {
      name: {
        type: 'text',
        label: 'Nome',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      type: {
        type: 'select',
        label: 'Tipo',
        required: true,
        options: ['Frag Grenade', 'Incendiary', 'Anti-Tank', 'Proximity Mine'],
        searchable: true
      },
      damage: {
        type: 'number',
        label: 'Dano',
        required: true,
        min: 0,
        max: 10000,
        step: 1,
        unit: 'HP'
      },
      blastRadius: {
        type: 'number',
        label: 'Raio de Explosão',
        required: true,
        min: 0,
        max: 100,
        step: 0.5,
        unit: 'metros'
      },
      description: {
        type: 'textarea',
        label: 'Descrição',
        required: true,
        validation: {
          maxLength: 500
        }
      }
    },
    displayFields: ['name', 'type', 'damage', 'blastRadius'],
    sortBy: 'damage',
    sortOrder: 'desc'
  },

  'stratagems': {
    name: 'Stratagemas',
    icon: '📡',
    description: 'Suporte orbital e terrestre',
    category: 'support',
    apiEndpoint: '/api/stratagems',
    fields: {
      name: {
        type: 'text',
        label: 'Nome',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      category: {
        type: 'select',
        label: 'Categoria',
        required: true,
        options: ['Defensive', 'Offensive', 'Supply'],
        searchable: true
      },
      cooldown: {
        type: 'number',
        label: 'Cooldown',
        required: true,
        min: 0,
        max: 600,
        step: 5,
        unit: 'segundos'
      },
      uses: {
        type: 'number',
        label: 'Usos',
        required: true,
        min: 1,
        max: 999,
        step: 1,
        unit: 'usos'
      },
      description: {
        type: 'textarea',
        label: 'Descrição',
        required: true,
        validation: {
          maxLength: 500
        }
      }
    },
    displayFields: ['name', 'category', 'cooldown', 'uses'],
    sortBy: 'cooldown',
    sortOrder: 'asc'
  },

  'armors': {
    name: 'Armaduras',
    icon: '🛡️',
    description: 'Equipamentos de proteção',
    category: 'gear',
    apiEndpoint: '/api/armors',
    fields: {
      name: {
        type: 'text',
        label: 'Nome',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      type: {
        type: 'select',
        label: 'Tipo',
        required: true,
        options: ['Light', 'Medium', 'Heavy'],
        searchable: true
      },
      armorRating: {
        type: 'number',
        label: 'Rating da Armadura',
        required: true,
        min: 0,
        max: 500,
        step: 5,
        unit: 'pontos'
      },
      speed: {
        type: 'number',
        label: 'Velocidade',
        required: true,
        min: 0,
        max: 100,
        step: 1,
        unit: '%'
      },
      staminaRegen: {
        type: 'number',
        label: 'Regeneração de Stamina',
        required: true,
        min: 0,
        max: 100,
        step: 1,
        unit: '%'
      },
      passive: {
        type: 'reference',
        label: 'Passiva',
        required: false,
        referenceModel: 'passive-armors',
        displayField: 'name',
        nullable: true
      },
      description: {
        type: 'textarea',
        label: 'Descrição',
        required: true,
        validation: {
          maxLength: 500
        }
      }
    },
    displayFields: ['name', 'type', 'armorRating', 'speed'],
    sortBy: 'armorRating',
    sortOrder: 'desc'
  },

  'passive-armors': {
    name: 'Passivas de Armadura',
    icon: '⚡',
    description: 'Efeitos passivos das armaduras',
    category: 'gear',
    apiEndpoint: '/api/passive-armors',
    fields: {
      name: {
        type: 'text',
        label: 'Nome',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      effect: {
        type: 'text',
        label: 'Efeito',
        required: true,
        validation: {
          maxLength: 200
        },
        placeholder: 'Ex: +25% de velocidade de recarga'
      },
      description: {
        type: 'textarea',
        label: 'Descrição',
        required: true,
        validation: {
          maxLength: 500
        }
      }
    },
    displayFields: ['name', 'effect'],
    sortBy: 'name',
    sortOrder: 'asc'
  },

  'perks': {
    name: 'Perks',
    icon: '🎯',
    description: 'Vantagens e habilidades especiais',
    category: 'abilities',
    apiEndpoint: '/api/perks',
    fields: {
      name: {
        type: 'text',
        label: 'Nome',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      effect: {
        type: 'text',
        label: 'Efeito',
        required: true,
        validation: {
          maxLength: 200
        },
        placeholder: 'Ex: +15% de velocidade de movimento'
      },
      description: {
        type: 'textarea',
        label: 'Descrição',
        required: true,
        validation: {
          maxLength: 500
        }
      }
    },
    displayFields: ['name', 'effect'],
    sortBy: 'name',
    sortOrder: 'asc'
  }
};

// Categorias para agrupamento
const categories = {
  weapons: {
    name: 'Armamentos',
    icon: '⚔️',
    description: 'Armas primárias e secundárias',
    models: ['primary-weapons', 'secondary-weapons']
  },
  equipment: {
    name: 'Equipamentos',
    icon: '🎒',
    description: 'Explosivos e outros equipamentos',
    models: ['throwables']
  },
  support: {
    name: 'Suporte',
    icon: '📡',
    description: 'Stratagemas e suporte orbital',
    models: ['stratagems']
  },
  gear: {
    name: 'Equipamentos de Proteção',
    icon: '🛡️',
    description: 'Armaduras e equipamentos de proteção',
    models: ['armors', 'passive-armors']
  },
  abilities: {
    name: 'Habilidades',
    icon: '🎯',
    description: 'Perks e habilidades especiais',
    models: ['perks']
  }
};

// Configurações globais do admin
const adminConfig = {
  app: {
    name: 'Helldivers 2 Admin Panel',
    version: '1.0.0',
    description: 'Painel administrativo para gerenciamento de dados do jogo',
    author: 'Admin Team',
    supportEmail: 'admin@helldivers2.com'
  },
  api: {
    baseUrl: '/api',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000
  },
  ui: {
    itemsPerPage: 10,
    maxItemsPerPage: 100,
    defaultSort: 'createdAt',
    defaultSortOrder: 'desc',
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutos
    notifications: true,
    darkTheme: true
  },
  features: {
    export: true,
    import: false,
    bulkOperations: true,
    advancedSearch: true,
    statistics: true,
    auditLog: false
  },
  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
    export: true,
    viewStats: true
  }
};

// Validadores personalizados
const validators = {
  // Validar nome único
  uniqueName: async (value, modelKey, currentId = null) => {
    try {
      const response = await fetch(`/api/${modelKey}?name=${encodeURIComponent(value)}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const existingItem = data.data[0];
        if (!currentId || existingItem._id !== currentId) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Erro na validação de nome único:', error);
      return true; // Em caso de erro, permite o valor
    }
  },

  // Validar formato de efeito
  effectFormat: (value) => {
    const pattern = /^[+\-]?\d+(\.\d+)?%?\s+.+$/;
    return pattern.test(value.trim());
  },

  // Validar valores balanceados
  balancedStats: (formData, modelKey) => {
    if (modelKey === 'primary-weapons') {
      const damage = parseFloat(formData.damage) || 0;
      const fireRate = parseFloat(formData.fireRate) || 0;
      const dps = (damage * fireRate) / 60;

      // Evitar armas muito OP
      if (dps > 500) {
        return {
          valid: false,
          message: 'DPS muito alto. Considere balancear dano e taxa de disparo.'
        };
      }
    }

    return { valid: true };
  }
};

// Utilitários para trabalhar com modelos
const modelUtils = {
  // Obter configuração de um modelo
  getModel(modelKey) {
    return modelsConfig[modelKey] || null;
  },

  // Obter todos os modelos
  getAllModels() {
    return modelsConfig;
  },

  // Obter modelos por categoria
  getModelsByCategory(categoryKey) {
    const category = categories[categoryKey];
    if (!category) return [];

    return category.models.map(modelKey => ({
      key: modelKey,
      ...modelsConfig[modelKey]
    }));
  },

  // Obter categorias
  getCategories() {
    return categories;
  },

  // Obter configuração global
  getConfig() {
    return adminConfig;
  },

  // Validar dados de um modelo
  async validateModelData(modelKey, data, currentId = null) {
    const model = this.getModel(modelKey);
    if (!model) {
      return { valid: false, errors: ['Modelo não encontrado'] };
    }

    const errors = [];

    // Validações de campo
    for (const [fieldName, fieldConfig] of Object.entries(model.fields)) {
      const value = data[fieldName];

      // Campo obrigatório
      if (fieldConfig.required && (!value || value.toString().trim() === '')) {
        errors.push(`${fieldConfig.label} é obrigatório`);
        continue;
      }

      // Validações específicas por tipo
      if (value) {
        const validation = fieldConfig.validation || {};

        if (fieldConfig.type === 'text' || fieldConfig.type === 'textarea') {
          if (validation.minLength && value.length < validation.minLength) {
            errors.push(`${fieldConfig.label} deve ter pelo menos ${validation.minLength} caracteres`);
          }
          if (validation.maxLength && value.length > validation.maxLength) {
            errors.push(`${fieldConfig.label} deve ter no máximo ${validation.maxLength} caracteres`);
          }
        }

        if (fieldConfig.type === 'number') {
          const num = parseFloat(value);
          if (isNaN(num)) {
            errors.push(`${fieldConfig.label} deve ser um número válido`);
          } else {
            if (fieldConfig.min !== undefined && num < fieldConfig.min) {
              errors.push(`${fieldConfig.label} deve ser pelo menos ${fieldConfig.min}`);
            }
            if (fieldConfig.max !== undefined && num > fieldConfig.max) {
              errors.push(`${fieldConfig.label} não pode exceder ${fieldConfig.max}`);
            }
          }
        }
      }
    }

    // Validações customizadas
    if (data.name) {
      const isUnique = await validators.uniqueName(data.name, modelKey, currentId);
      if (!isUnique) {
        errors.push('Nome já existe');
      }
    }

    if (data.effect && (modelKey === 'passive-armors' || modelKey === 'perks')) {
      if (!validators.effectFormat(data.effect)) {
        errors.push('Formato do efeito inválido. Use: "+10% damage" ou "Reduz cooldown em 2s"');
      }
    }

    // Validação de balanceamento
    const balanceCheck = validators.balancedStats(data, modelKey);
    if (!balanceCheck.valid) {
      errors.push(balanceCheck.message);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Formatar dados para exibição
  formatDisplayValue(value, fieldConfig) {
    if (value === null || value === undefined) {
      return '-';
    }

    if (fieldConfig.type === 'number' && fieldConfig.unit) {
      return `${value} ${fieldConfig.unit}`;
    }

    if (fieldConfig.type === 'text' && typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }

    return value;
  },

  // Gerar campos de formulário
  generateFormFields(modelKey, data = {}) {
    const model = this.getModel(modelKey);
    if (!model) return [];

    return Object.entries(model.fields).map(([fieldName, fieldConfig]) => ({
      name: fieldName,
      config: fieldConfig,
      value: data[fieldName] || '',
      id: `field_${fieldName}`,
      error: null
    }));
  },

  // Obter estatísticas de um modelo
  async getModelStats(modelKey) {
    try {
      const response = await fetch(`/api/${modelKey}/stats`);
      if (response.ok) {
        const data = await response.json();
        return data.success ? data.data : null;
      }
    } catch (error) {
      console.error(`Erro ao obter estatísticas de ${modelKey}:`, error);
    }
    return null;
  }
};

// Exportar configurações
module.exports = {
  modelsConfig,
  categories,
  adminConfig,
  validators,
  modelUtils
};

// Se estiver no browser, disponibilizar globalmente
if (typeof window !== 'undefined') {
  window.AdminModels = {
    config: modelsConfig,
    categories,
    adminConfig,
    utils: modelUtils
  };
}