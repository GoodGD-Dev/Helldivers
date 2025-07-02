// Gerenciamento do dashboard - Estatísticas e visualização principal

class AdminDashboard {
  constructor() {
    this.modelConfigs = {
      'primary-weapons': {
        name: 'Armas Primárias',
        icon: '🔫',
        description: 'Rifles, shotguns e outras armas principais'
      },
      'secondary-weapons': {
        name: 'Armas Secundárias',
        icon: '🔫',
        description: 'Pistolas e revólveres'
      },
      'throwables': {
        name: 'Explosivos',
        icon: '💣',
        description: 'Granadas e outros explosivos'
      },
      'stratagems': {
        name: 'Stratagemas',
        icon: '📡',
        description: 'Suporte orbital e terrestre'
      },
      'armors': {
        name: 'Armaduras',
        icon: '🛡️',
        description: 'Equipamentos de proteção'
      },
      'passive-armors': {
        name: 'Passivas de Armadura',
        icon: '⚡',
        description: 'Efeitos passivos das armaduras'
      },
      'perks': {
        name: 'Perks',
        icon: '🎯',
        description: 'Vantagens e habilidades especiais'
      }
    };

    // Bind methods
    this.init = this.init.bind(this);
    this.loadDashboardData = this.loadDashboardData.bind(this);
    this.setupDashboardListeners = this.setupDashboardListeners.bind(this);
    this.showStats = this.showStats.bind(this);
  }

  // === INICIALIZAÇÃO ===
  async init() {
    console.log('📊 Inicializando Dashboard...');

    try {
      await this.loadDashboardData();
      this.setupDashboardListeners();
      console.log('✅ Dashboard inicializado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar dashboard:', error);
      return false;
    }
  }

  // === CARREGAMENTO DE DADOS ===
  async loadDashboardData() {
    try {
      console.log('🔄 Carregando dados do dashboard...');

      // Carregar estatísticas
      const statsResponse = await fetch('/admin/api/stats');
      const statsData = await statsResponse.json();

      if (statsData.success) {
        this.updateStatsCards(statsData.data);
      }

      // Carregar modelos
      await this.loadModels();

      console.log('✅ Dados do dashboard carregados com sucesso');

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      throw error;
    }
  }

  // === ATUALIZAÇÃO DE ESTATÍSTICAS ===
  updateStatsCards(stats) {
    const updates = {
      totalItemsCount: stats.totalItems,
      apiStatus: 'Online',
      lastUpdateTime: new Date(stats.timestamp).toLocaleString('pt-BR')
    };

    // Encontrar categoria com mais itens
    let largestCategoryName = '';
    let maxCount = 0;
    for (const [category, count] of Object.entries(stats.breakdown)) {
      if (count > maxCount) {
        maxCount = count;
        largestCategoryName = category;
      }
    }

    const categoryNames = {
      'primary-weapons': 'Armas Primárias',
      'secondary-weapons': 'Armas Secundárias',
      'throwables': 'Explosivos',
      'stratagems': 'Stratagemas',
      'armors': 'Armaduras',
      'passive-armors': 'Passivas',
      'perks': 'Perks'
    };

    updates.largestCategory = categoryNames[largestCategoryName] || largestCategoryName;

    // Atualizar elementos na UI
    Object.entries(updates).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    // Atualizar stats na navegação
    const totalItems = document.getElementById('totalItems');
    if (totalItems) {
      const statValue = totalItems.querySelector('.stat-value');
      if (statValue) statValue.textContent = stats.totalItems;
    }
  }

  // === CARREGAMENTO DE MODELOS ===
  async loadModels() {
    const grid = document.getElementById('modelsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    for (const [key, config] of Object.entries(this.modelConfigs)) {
      try {
        const count = await this.getModelCount(key);
        const card = this.createModelCard(key, config, count);
        grid.appendChild(card);
      } catch (error) {
        console.error(`Erro ao carregar modelo ${key}:`, error);
      }
    }
  }

  async getModelCount(modelKey) {
    try {
      const response = await fetch(`/api/${modelKey}?limit=1`);
      const data = await response.json();
      return data.pagination ? data.pagination.totalItems : 0;
    } catch (error) {
      return 0;
    }
  }

  createModelCard(key, config, count) {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.innerHTML = `
      <div class="model-icon">${config.icon}</div>
      <div class="model-content">
        <h4 class="model-name">${config.name}</h4>
        <p class="model-description">${config.description}</p>
        <div class="model-stats">
          <span class="model-count">${count} itens</span>
        </div>
      </div>
      <div class="model-actions">
        <button class="btn btn-primary btn-sm model-view-btn" data-model="${key}">
          👁️ Ver
        </button>
        <button class="btn btn-success btn-sm model-add-btn" data-model="${key}">
          ➕ Adicionar
        </button>
      </div>
    `;

    // Event listeners
    const viewBtn = card.querySelector('.model-view-btn');
    const addBtn = card.querySelector('.model-add-btn');

    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const adminSystem = window.AdminSystem;
        if (adminSystem?.models?.viewModel) {
          adminSystem.models.viewModel(key);
        } else {
          console.log(`Tentando visualizar modelo: ${key}`);
        }
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const adminSystem = window.AdminSystem;
        if (adminSystem?.models?.addToModel) {
          adminSystem.models.addToModel(key);
        } else {
          console.log(`Tentando adicionar item ao modelo: ${key}`);
        }
      });
    }

    return card;
  }

  // === EVENT LISTENERS ===
  setupDashboardListeners() {
    const actionButtons = {
      showStatsBtn: () => this.showStats(),
      syncDataBtn: () => this.syncData(),
      exportDataBtn: () => this.exportData(),
      showSettingsBtn: () => this.showSettings()
    };

    Object.entries(actionButtons).forEach(([id, handler]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.removeEventListener('click', handler);
        btn.addEventListener('click', handler);
      }
    });
  }

  // === AÇÕES ===
  async showStats() {
    console.log('📊 Carregando estatísticas detalhadas...');

    try {
      const adminSystem = window.AdminSystem;
      if (adminSystem?.utils?.showModal) {
        adminSystem.utils.showModal('statsModal');
      }

      const response = await fetch('/admin/api/stats');
      const data = await response.json();

      if (data.success) {
        const statsContent = document.getElementById('statsContent');
        if (statsContent) {
          statsContent.innerHTML = this.generateStatsHTML(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Não usar notificação aqui para evitar erros
    }
  }

  async syncData() {
    const adminSystem = window.AdminSystem;
    if (adminSystem?.utils?.syncData) {
      await adminSystem.utils.syncData();
    } else {
      console.log('🔄 Sincronizando dados...');
    }
  }

  async exportData() {
    const adminSystem = window.AdminSystem;
    if (adminSystem?.utils?.exportData) {
      await adminSystem.utils.exportData();
    } else {
      console.log('📁 Exportando dados...');
    }
  }

  showSettings() {
    const adminSystem = window.AdminSystem;
    if (adminSystem?.utils?.showSettings) {
      adminSystem.utils.showSettings();
    } else {
      console.log('⚙️ Abrindo configurações...');
    }
  }

  generateStatsHTML(stats) {
    const modelNames = {
      'primary-weapons': 'Armas Primárias',
      'secondary-weapons': 'Armas Secundárias',
      'throwables': 'Explosivos',
      'stratagems': 'Stratagemas',
      'armors': 'Armaduras',
      'passive-armors': 'Passivas de Armadura',
      'perks': 'Perks'
    };

    let html = `
      <div class="stats-overview">
        <h4>📊 Visão Geral</h4>
        <p><strong>Total de Itens:</strong> ${stats.totalItems}</p>
        <p><strong>Última Atualização:</strong> ${new Date(stats.timestamp).toLocaleString('pt-BR')}</p>
        <p><strong>Servidor:</strong> Uptime ${Math.floor(stats.server?.uptime || 0)}s | RAM ${stats.server?.memory || 0}MB</p>
      </div>
      <div class="stats-breakdown">
        <h4>📋 Detalhamento por Modelo</h4>
        <div class="stats-grid">
    `;

    for (const [key, count] of Object.entries(stats.breakdown)) {
      const name = modelNames[key] || key;
      const percentage = stats.totalItems > 0 ? ((count / stats.totalItems) * 100).toFixed(1) : 0;
      const fillClass = Math.floor(percentage / 10);

      html += `
        <div class="stat-item">
          <div class="stat-header">
            <span class="stat-name">${name}</span>
            <span class="stat-count">${count}</span>
          </div>
          <div class="stat-bar">
            <div class="stat-fill stat-fill-${fillClass}" data-percentage="${percentage}"></div>
          </div>
          <div class="stat-percentage">${percentage}%</div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
      <div class="stats-actions">
        <button class="btn btn-primary" onclick="window.AdminSystem?.utils?.exportData?.()">
          📁 Exportar Dados
        </button>
        <button class="btn btn-secondary" onclick="window.AdminSystem?.core?.refresh?.()">
          🔄 Atualizar
        </button>
      </div>
    `;

    return html;
  }

  // === ATIVIDADE FEED ===
  updateActivityFeed(activity) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
      <div class="activity-icon">${activity.icon || '📝'}</div>
      <div class="activity-content">
        <p class="activity-text">${activity.text}</p>
        <span class="activity-time">${activity.time || 'Agora mesmo'}</span>
      </div>
    `;

    feed.insertBefore(activityItem, feed.firstChild);

    // Manter apenas os últimos 5 itens
    const items = feed.querySelectorAll('.activity-item');
    if (items.length > 5) {
      items[items.length - 1].remove();
    }
  }

  // === HELPERS ===
  addActivity(text, icon = '📝') {
    this.updateActivityFeed({
      text,
      icon,
      time: new Date().toLocaleTimeString('pt-BR')
    });
  }

  getModelConfig(modelKey) {
    return this.modelConfigs[modelKey] || null;
  }

  getAllModelConfigs() {
    return this.modelConfigs;
  }

  // === DEBUGGING ===
  debug(...args) {
    const adminSystem = window.AdminSystem;
    const settings = adminSystem?.core?.getSettings?.() || {};
    if (settings.devMode) {
      console.log('🐛 [DEBUG Dashboard]', ...args);
    }
  }
}

// Exportar para uso global
window.AdminDashboard = AdminDashboard;