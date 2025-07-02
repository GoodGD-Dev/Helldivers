// Gerenciamento CRUD dos modelos - Create, Read, Update, Delete

class AdminModels {
  constructor() {
    this.deleteItem = null;

    this.modelConfigs = {
      'primary-weapons': {
        name: 'Armas Primárias',
        icon: '🔫',
        description: 'Rifles, shotguns e outras armas principais',
        fields: [
          { key: 'damage', icon: '💥', label: 'Dano' },
          { key: 'fireRate', icon: '🔥', label: 'Taxa', unit: 'RPM' },
          { key: 'magazineSize', icon: '📦', label: 'Carregador' },
          { key: 'reloadTime', icon: '⏱️', label: 'Recarga', unit: 's' }
        ],
        formFields: ['damage', 'fireRate', 'magazineSize', 'reloadTime'],
        selectOptions: [
          { value: 'Assault Rifle', label: 'Assault Rifle' },
          { value: 'Shotgun', label: 'Shotgun' },
          { value: 'Sniper', label: 'Sniper' },
          { value: 'SMG', label: 'SMG' }
        ]
      },
      'secondary-weapons': {
        name: 'Armas Secundárias',
        icon: '🔫',
        description: 'Pistolas e revólveres',
        fields: [
          { key: 'damage', icon: '💥', label: 'Dano' },
          { key: 'fireRate', icon: '🔥', label: 'Taxa', unit: 'RPM' },
          { key: 'magazineSize', icon: '📦', label: 'Carregador' },
          { key: 'reloadTime', icon: '⏱️', label: 'Recarga', unit: 's' }
        ],
        formFields: ['damage', 'fireRate', 'magazineSize', 'reloadTime'],
        selectOptions: [
          { value: 'Pistol', label: 'Pistol' },
          { value: 'Revolver', label: 'Revolver' },
          { value: 'Auto Pistol', label: 'Auto Pistol' }
        ]
      },
      'throwables': {
        name: 'Explosivos',
        icon: '💣',
        description: 'Granadas e outros explosivos',
        fields: [
          { key: 'damage', icon: '💥', label: 'Dano' },
          { key: 'blastRadius', icon: '💣', label: 'Raio', unit: 'm' }
        ],
        formFields: ['damage', 'blastRadius'],
        selectOptions: [
          { value: 'Frag Grenade', label: 'Frag Grenade' },
          { value: 'Incendiary', label: 'Incendiary' },
          { value: 'Anti-Tank', label: 'Anti-Tank' }
        ]
      },
      'stratagems': {
        name: 'Stratagemas',
        icon: '📡',
        description: 'Suporte orbital e terrestre',
        fields: [
          { key: 'cooldown', icon: '⏱️', label: 'Cooldown', unit: 's' },
          { key: 'uses', icon: '🔄', label: 'Usos' },
          { key: 'category', icon: '📂', label: 'Categoria' }
        ],
        formFields: ['cooldown', 'uses'],
        selectField: 'category',
        selectOptions: [
          { value: 'Defensive', label: 'Defensive' },
          { value: 'Offensive', label: 'Offensive' },
          { value: 'Supply', label: 'Supply' }
        ]
      },
      'armors': {
        name: 'Armaduras',
        icon: '🛡️',
        description: 'Equipamentos de proteção',
        fields: [
          { key: 'armorRating', icon: '🛡️', label: 'Proteção' },
          { key: 'speed', icon: '⚡', label: 'Velocidade', unit: '%' },
          { key: 'staminaRegen', icon: '💪', label: 'Stamina', unit: '%' },
          { key: 'passive', icon: '🌀', label: 'Passiva' }
        ],
        formFields: ['armorRating', 'speed', 'staminaRegen'],
        selectOptions: [
          { value: 'Light', label: 'Light' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Heavy', label: 'Heavy' }
        ],
        extraSelectFields: ['passive']
      },
      'passive-armors': {
        name: 'Passivas de Armadura',
        icon: '⚡',
        description: 'Efeitos passivos das armaduras',
        fields: [
          { key: 'effect', icon: '⚡', label: 'Efeito' }
        ],
        textFields: ['effect']
      },
      'perks': {
        name: 'Perks',
        icon: '🎯',
        description: 'Vantagens e habilidades especiais',
        fields: [
          { key: 'effect', icon: '⚡', label: 'Efeito' }
        ],
        textFields: ['effect']
      }
    };

    // Bind methods
    this.viewModel = this.viewModel.bind(this);
    this.showModelModal = this.showModelModal.bind(this);
    this.addToModel = this.addToModel.bind(this);
    this.editItem = this.editItem.bind(this);
    this.confirmDeleteItem = this.confirmDeleteItem.bind(this);
    this.executeDelete = this.executeDelete.bind(this);
    this.saveNewItem = this.saveNewItem.bind(this);
    this.saveEditedItem = this.saveEditedItem.bind(this);
    this.generateFormFields = this.generateFormFields.bind(this);
    this.fetchPassiveOptions = this.fetchPassiveOptions.bind(this);
  }

  async fetchPassiveOptions() {
    try {
      const res = await fetch('/api/passive-armors');
      const json = await res.json();
      if (json.success) {
        return json.data.map(p => ({
          value: p._id,
          label: p.name
        }));
      }
    } catch (e) {
      console.error('Erro ao buscar passivas:', e);
    }
    return [];
  }

  async generateFormFields(config, existingData = {}) {
    let html = `
      <div class="form-group">
        <label for="itemName" class="required">Nome</label>
        <input type="text" id="itemName" name="name" value="${existingData.name || ''}" required>
      </div>
      <div class="form-group">
        <label for="itemDescription" class="required">Descrição</label>
        <textarea id="itemDescription" name="description" required rows="3">${existingData.description || ''}</textarea>
      </div>
    `;

    if (config.selectOptions) {
      const selectField = config.selectField || 'type';
      const currentValue = existingData[selectField] || config.selectOptions[0].value;

      html += `
        <div class="form-group">
          <label for="item${selectField}">${selectField === 'category' ? 'Categoria' : 'Tipo'}</label>
          <select id="item${selectField}" name="${selectField}">
            ${config.selectOptions.map(opt => `
              <option value="${opt.value}" ${opt.value === currentValue ? 'selected' : ''}>${opt.label}</option>
            `).join('')}
          </select>
        </div>
      `;
    }

    if (config.formFields) {
      const fieldLabels = {
        damage: 'Dano',
        fireRate: 'Taxa de Disparo (RPM)',
        magazineSize: 'Carregador',
        reloadTime: 'Recarga (s)',
        blastRadius: 'Raio (m)',
        cooldown: 'Cooldown (s)',
        uses: 'Usos',
        armorRating: 'Proteção',
        speed: 'Velocidade (%)',
        staminaRegen: 'Stamina (%)'
      };

      config.formFields.forEach(field => {
        const step = field.includes('Time') ? 'step="0.1"' : '';
        const value = existingData[field] || '';
        html += `
          <div class="form-group">
            <label for="item${field}">${fieldLabels[field]}</label>
            <input type="number" id="item${field}" name="${field}" value="${value}" min="0" ${step}>
          </div>
        `;
      });
    }

    if (config.textFields) {
      config.textFields.forEach(field => {
        const value = existingData[field] || '';
        html += `
          <div class="form-group">
            <label for="item${field}">Efeito</label>
            <input type="text" id="item${field}" name="${field}" value="${value}" placeholder="Ex: +25% de velocidade">
          </div>
        `;
      });
    }

    if (config.extraSelectFields) {
      for (const field of config.extraSelectFields) {
        if (field === 'passive') {
          const passiveOptions = await this.fetchPassiveOptions();
          const currentValue = existingData.passive?._id || existingData.passive || '';

          html += `
            <div class="form-group">
              <label for="item${field}">Passiva</label>
              <select id="item${field}" name="${field}">
                <option value="">Nenhuma</option>
                ${passiveOptions.map(opt => `
                  <option value="${opt.value}" ${opt.value === currentValue ? 'selected' : ''}>${opt.label}</option>
                `).join('')}
              </select>
            </div>
          `;
        }
      }
    }

    return html;
  }