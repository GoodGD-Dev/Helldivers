// Gerenciamento CRUD dos modelos - Create, Read, Update, Delete

class AdminModels {
  constructor() {
    this.deleteItem = null; // Para armazenar item sendo deletado

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

  // === HELPERS PARA ACESSAR OUTRAS INSTÂNCIAS ===
  getAdminCore() {
    return window.AdminSystem?.core || null;
  }

  getAdminUtils() {
    return window.AdminSystem?.utils || null;
  }

  getAdminDashboard() {
    return window.AdminSystem?.dashboard || null;
  }

  // === VISUALIZAÇÃO DE MODELOS ===
  async viewModel(modelKey) {
    console.log(`📋 Visualizando modelo: ${modelKey}`);

    try {
      const core = this.getAdminCore();
      if (core) {
        core.showLoading();
      }

      const response = await fetch(`/api/${modelKey}?limit=20`);
      const data = await response.json();

      if (data.success) {
        this.showModelModal(modelKey, data);
      } else {
        const utils = this.getAdminUtils();
        if (utils) {
          utils.showNotification('Erro ao carregar dados do modelo', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao visualizar modelo:', error);
      const utils = this.getAdminUtils();
      if (utils) {
        utils.showNotification('Erro ao carregar dados do modelo', 'error');
      }
    } finally {
      const core = this.getAdminCore();
      if (core) {
        core.hideLoading();
      }
    }
  }

  showModelModal(modelKey, data) {
    const config = this.modelConfigs[modelKey];
    if (!config) return;

    const items = data.data || [];
    const total = data.pagination ? data.pagination.totalItems : items.length;

    const itemsHtml = items.length > 0
      ? items.map((item, index) => this.generateItemHTML(item, index, config, modelKey)).join('')
      : '<p class="no-items">Nenhum item encontrado neste modelo.</p>';

    const modalHTML = `
      <div id="modelViewModal" class="modal model-view-modal">
        <div class="modal-content large">
          <div class="modal-header">
            <h3>👁️ ${config.name}</h3>
            <button class="modal-close model-view-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="model-summary">
              <p><strong>Total de itens:</strong> ${total}</p>
              <p><strong>Mostrando:</strong> ${Math.min(items.length, 20)} primeiros</p>
              ${total > 20 ? '<p><em>Use "Ver Todos" para visualizar itens completos</em></p>' : ''}
            </div>
            <div class="model-items">${itemsHtml}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary model-view-all" data-url="/api/${modelKey}">
              📋 Ver Todos (${total})
            </button>
            <button class="btn btn-success model-add-new" data-model="${modelKey}">
              ➕ Adicionar Novo
            </button>
            <button class="btn btn-secondary model-view-close">Fechar</button>
          </div>
        </div>
      </div>
    `;

    const utils = this.getAdminUtils();
    if (utils) {
      utils.showModalFromHTML('modelViewModal', modalHTML);
    }

    this.setupModelModalListeners(modelKey);
  }

  generateItemHTML(item, index, config, modelKey) {
    return `
      <div class="model-item">
        <div class="model-item-header">
          <h5>${item.name || 'Item ' + (index + 1)}</h5>
          <div class="model-item-actions">
            <span class="model-item-id">#${item._id ? item._id.slice(-6) : 'N/A'}</span>
            <button class="btn btn-sm btn-warning item-edit-btn" 
                    data-model="${modelKey}" 
                    data-id="${item._id}" 
                    data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}' 
                    title="Editar item">
              ✏️
            </button>
            <button class="btn btn-sm btn-danger item-delete-btn" 
                    data-model="${modelKey}" 
                    data-id="${item._id}" 
                    data-name="${item.name || 'Item'}" 
                    title="Excluir item">
              🗑️
            </button>
          </div>
        </div>
        <div class="model-item-content">
          <p><strong>Descrição:</strong> ${item.description || 'Sem descrição'}</p>
          ${this.generateItemDetails(item, config)}
        </div>
      </div>
    `;
  }

  generateItemDetails(item, config) {
    if (!config.fields) return '';

    const stats = config.fields
      .filter(field => item[field.key] !== undefined && item[field.key] !== null)
      .map(field => {
        const value = item[field.key];
        const unit = field.unit ? ` ${field.unit}` : '';
        return `<span class="stat">${field.icon} ${field.label}: ${value}${unit}</span>`;
      })
      .join('');

    return stats ? `<div class="item-stats">${stats}</div>` : '';
  }

  setupModelModalListeners(modelKey) {
    const modal = document.getElementById('modelViewModal');
    if (!modal) return;

    // Fechar modal
    modal.querySelectorAll('.model-view-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    // Ver todos
    const viewAllBtn = modal.querySelector('.model-view-all');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        window.open(viewAllBtn.dataset.url, '_blank');
      });
    }

    // Adicionar novo
    const addNewBtn = modal.querySelector('.model-add-new');
    if (addNewBtn) {
      addNewBtn.addEventListener('click', () => {
        modal.remove();
        this.addToModel(modelKey);
      });
    }

    // Botões de edição
    modal.querySelectorAll('.item-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modelKey = btn.dataset.model;
        const itemId = btn.dataset.id;
        const itemData = JSON.parse(btn.dataset.item);
        modal.remove();
        this.editItem(modelKey, itemId, itemData);
      });
    });

    // Botões de exclusão
    modal.querySelectorAll('.item-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modelKey = btn.dataset.model;
        const itemId = btn.dataset.id;
        const itemName = btn.dataset.name;
        this.confirmDeleteItem(modelKey, itemId, itemName);
      });
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Mostrar modal
    setTimeout(() => modal.classList.add('modal-show'), 10);
  }

  // === CRIAÇÃO DE MODELOS ===
  async addToModel(modelKey) {
    console.log(`➕ Adicionando item ao modelo: ${modelKey}`);

    const config = this.modelConfigs[modelKey];
    if (!config) return;

    this.showAddItemModal(modelKey, config);
  }

  async showAddItemModal(modelKey, config) {
    const formFields = await this.generateFormFields(config);

    const modalHTML = `
      <div id="addItemModal" class="modal add-item-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>➕ Adicionar ${config.name}</h3>
            <button class="modal-close add-item-close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="addItemForm" class="add-item-form">
              ${formFields}
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary add-item-close">Cancelar</button>
            <button class="btn btn-success add-item-save" data-model="${modelKey}">
              💾 Salvar
            </button>
          </div>
        </div>
      </div>
    `;

    const utils = this.getAdminUtils();
    if (utils) {
      utils.showModalFromHTML('addItemModal', modalHTML);
    }

    this.setupAddItemModalListeners(modelKey);
  }

  setupAddItemModalListeners(modelKey) {
    const modal = document.getElementById('addItemModal');
    if (!modal) return;

    // Fechar modal
    modal.querySelectorAll('.add-item-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    // Salvar
    const saveBtn = modal.querySelector('.add-item-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveNewItem(modelKey);
      });
    }

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    setTimeout(() => modal.classList.add('modal-show'), 10);
  }

  async saveNewItem(modelKey) {
    const form = document.getElementById('addItemForm');
    if (!form) return;

    const utils = this.getAdminUtils();
    const data = utils ? utils.getFormData(form) : this.getFormData(form);
    const validation = utils ? utils.validateFormData(data) : { isValid: true, errors: [] };

    if (!validation.isValid) {
      if (utils) {
        utils.showFormErrors(validation.errors);
      }
      return;
    }

    try {
      const core = this.getAdminCore();
      if (core) {
        core.showLoading();
      }

      const response = await fetch(`/api/${modelKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (utils) {
          utils.showNotification(`${data.name} adicionado com sucesso!`, 'success');
        }

        document.getElementById('addItemModal')?.remove();

        // Atualizar dashboard
        const dashboard = this.getAdminDashboard();
        if (dashboard) {
          await dashboard.loadDashboardData();
          dashboard.addActivity(`Item "${data.name}" criado em ${this.modelConfigs[modelKey]?.name}`, '➕');
        }
      } else {
        if (utils) {
          utils.showNotification(result.error?.message || 'Erro ao salvar item', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      if (utils) {
        utils.showNotification('Erro ao conectar com o servidor', 'error');
      }
    } finally {
      const core = this.getAdminCore();
      if (core) {
        core.hideLoading();
      }
    }
  }

  // === EDIÇÃO DE ITENS ===
  editItem(modelKey, itemId, itemData) {
    console.log(`✏️ Editando item: ${itemId} do modelo: ${modelKey}`);

    const config = this.modelConfigs[modelKey];
    if (!config) return;

    this.showEditItemModal(modelKey, itemId, itemData, config);
  }

  async showEditItemModal(modelKey, itemId, itemData, config) {
    const formFields = await this.generateFormFields(config, itemData);

    const modalHTML = `
      <div id="editItemModal" class="modal add-item-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>✏️ Editar ${config.name}</h3>
            <button class="modal-close edit-item-close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="editItemForm" class="add-item-form">
              ${formFields}
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary edit-item-close">Cancelar</button>
            <button class="btn btn-primary edit-item-save" 
                    data-model="${modelKey}" 
                    data-id="${itemId}">
              💾 Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    `;

    const utils = this.getAdminUtils();
    if (utils) {
      utils.showModalFromHTML('editItemModal', modalHTML);
    }

    this.setupEditItemModalListeners(modelKey, itemId);
  }

  setupEditItemModalListeners(modelKey, itemId) {
    const modal = document.getElementById('editItemModal');
    if (!modal) return;

    // Fechar modal
    modal.querySelectorAll('.edit-item-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    // Salvar alterações
    const saveBtn = modal.querySelector('.edit-item-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveEditedItem(modelKey, itemId);
      });
    }

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    setTimeout(() => modal.classList.add('modal-show'), 10);
  }

  async saveEditedItem(modelKey, itemId) {
    const form = document.getElementById('editItemForm');
    if (!form) return;

    const utils = this.getAdminUtils();
    const data = utils ? utils.getFormData(form) : this.getFormData(form);
    const validation = utils ? utils.validateFormData(data) : { isValid: true, errors: [] };

    if (!validation.isValid) {
      if (utils) {
        utils.showFormErrors(validation.errors);
      }
      return;
    }

    try {
      const core = this.getAdminCore();
      if (core) {
        core.showLoading();
      }

      const response = await fetch(`/api/${modelKey}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (utils) {
          utils.showNotification(`"${data.name}" atualizado com sucesso!`, 'success');
        }

        document.getElementById('editItemModal')?.remove();

        // Atualizar dashboard
        const dashboard = this.getAdminDashboard();
        if (dashboard) {
          await dashboard.loadDashboardData();
          dashboard.addActivity(`Item "${data.name}" editado em ${this.modelConfigs[modelKey]?.name}`, '✏️');
        }

        // Reabrir modal de visualização atualizado
        this.viewModel(modelKey);
      } else {
        if (utils) {
          utils.showNotification(result.error?.message || 'Erro ao atualizar item', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      if (utils) {
        utils.showNotification('Erro ao conectar com o servidor', 'error');
      }
    } finally {
      const core = this.getAdminCore();
      if (core) {
        core.hideLoading();
      }
    }
  }

  // === EXCLUSÃO DE ITENS ===
  confirmDeleteItem(modelKey, itemId, itemName) {
    const config = this.modelConfigs[modelKey];
    if (!config) return;

    this.deleteItem = { modelKey, itemId, itemName };

    const utils = this.getAdminUtils();
    if (utils) {
      utils.confirmAction(
        '🗑️ Confirmar Exclusão',
        `Tem certeza que deseja excluir "${itemName}" de ${config.name}?\n\nEsta ação não pode ser desfeita.`,
        () => this.executeDelete()
      );
    }
  }

  async executeDelete() {
    if (!this.deleteItem) return;

    const { modelKey, itemId, itemName } = this.deleteItem;

    try {
      const core = this.getAdminCore();
      const utils = this.getAdminUtils();

      if (core) {
        core.showLoading();
      }

      const response = await fetch(`/api/${modelKey}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (utils) {
          utils.showNotification(`"${itemName}" excluído com sucesso!`, 'success');
        }

        // Recarregar dashboard
        const dashboard = this.getAdminDashboard();
        if (dashboard) {
          await dashboard.loadDashboardData();
          dashboard.addActivity(`Item "${itemName}" excluído de ${this.modelConfigs[modelKey]?.name}`, '🗑️');
        }

        // Se o modal ainda estiver aberto, recarregá-lo
        const modalOpen = document.getElementById('modelViewModal');
        if (modalOpen) {
          modalOpen.remove();
          this.viewModel(modelKey); // Reabrir modal atualizado
        }
      } else {
        if (utils) {
          utils.showNotification(
            result.error?.message || 'Erro ao excluir item',
            'error'
          );
        }
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      const utils = this.getAdminUtils();
      if (utils) {
        utils.showNotification('Erro ao conectar com o servidor', 'error');
      }
    } finally {
      const core = this.getAdminCore();
      if (core) {
        core.hideLoading();
      }
      this.deleteItem = null;
    }
  }

  // === GERAÇÃO DE FORMULÁRIOS ===
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

    // Campo de seleção
    if (config.selectOptions) {
      const selectField = config.selectField || 'type';
      const currentValue = existingData[selectField] || config.selectOptions[0].value;

      html += `
        <div class="form-group">
          <label for="item${selectField}">${selectField === 'category' ? 'Categoria' : 'Tipo'}</label>
          <select id="item${selectField}" name="${selectField}">
            ${config.selectOptions.map(opt =>
        `<option value="${opt.value}" ${opt.value === currentValue ? 'selected' : ''}>${opt.label}</option>`
      ).join('')}
          </select>
        </div>
      `;
    }

    // Campos numéricos
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

    // Campos de texto
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

    // Campos de seleção extras (como passivas)
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

  // === FALLBACK HELPER ===
  getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    const numberFields = ['damage', 'fireRate', 'magazineSize', 'reloadTime', 'blastRadius', 'cooldown', 'uses', 'armorRating', 'speed', 'staminaRegen'];

    for (let [key, value] of formData.entries()) {
      data[key] = numberFields.includes(key) && value ? parseFloat(value) : value || undefined;
    }

    return data;
  }

  // === DEBUGGING ===
  debug(...args) {
    const core = this.getAdminCore();
    const settings = core?.getSettings() || {};
    if (settings.devMode) {
      console.log('🐛 [DEBUG Models]', ...args);
    }
  }
}

// Exportar para uso global
window.AdminModels = AdminModels;