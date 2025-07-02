// Core básico do admin - Sessão, configurações, UI básica

class AdminCore {
  constructor() {
    this.config = {
      apiBase: '/api',
      adminBase: '/admin',
      refreshInterval: 5 * 60 * 1000
    };

    this.state = {
      sessionInfo: null,
      isLoading: false,
      confirmCallback: null
    };

    // Bind methods
    this.init = this.init.bind(this);
    this.loadSession = this.loadSession.bind(this);
    this.refresh = this.refresh.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
  }

  // === INICIALIZAÇÃO ===
  async init() {
    console.log('🚀 Inicializando Admin Core...');

    try {
      this.hideLoadingScreen();
      this.loadSettings();
      await this.loadSession();
      this.setupCoreListeners();
      this.startClock();
      this.startConnectionCheck();

      console.log('✅ Admin Core inicializado');
      return true;
    } catch (error) {
      console.error('❌ Erro no Admin Core:', error);
      return false;
    }
  }

  hideLoadingScreen() {
    setTimeout(() => {
      const screen = document.getElementById('loadingScreen');
      if (screen) {
        screen.style.opacity = '0';
        setTimeout(() => screen.style.display = 'none', 500);
      }
    }, 1000);
  }

  // === SESSÃO ===
  async loadSession() {
    try {
      const response = await fetch(`${this.config.adminBase}/api/session`);
      const data = await response.json();

      if (data.success) {
        this.state.sessionInfo = data.data;
        this.updateSessionUI();
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
    }
  }

  updateSessionUI() {
    const updates = {
      userInfo: `👤 ${this.state.sessionInfo?.user || 'Admin'}`,
      envInfo: `🌐 ${this.state.sessionInfo?.environment || 'Unknown'}`
    };

    Object.entries(updates).forEach(([id, text]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = text;
    });
  }

  // === CONFIGURAÇÕES ===
  getSettings() {
    const defaults = {
      autoRefresh: false,
      darkTheme: true,
      notifications: true,
      devMode: false
    };

    try {
      const saved = localStorage.getItem('adminSettings');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (error) {
      return defaults;
    }
  }

  setSettings(settings) {
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  loadSettings() {
    const settings = this.getSettings();
    this.applySettings(settings);
  }

  applySettings(settings) {
    document.body.classList.toggle('light-theme', !settings.darkTheme);
    document.body.classList.toggle('dev-mode', settings.devMode);

    if (settings.devMode) {
      console.log('🔧 Modo desenvolvedor ativado');
    }
  }

  // === EVENT LISTENERS BÁSICOS ===
  setupCoreListeners() {
    // Refresh
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refresh());
    }

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
        this.refresh();
      }

      if (e.key === 'Escape') {
        if (window.AdminUtils) {
          window.AdminUtils.closeAllModals();
        }
      }

      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        this.showHelp();
      }
    });

    // Conectividade
    window.addEventListener('offline', () => {
      if (window.AdminUtils) {
        window.AdminUtils.showNotification('Conexão perdida. Trabalhando offline.', 'warning');
      }
    });

    window.addEventListener('online', () => {
      if (window.AdminUtils) {
        window.AdminUtils.showNotification('Conexão restaurada.', 'success');
      }
      this.refresh();
    });
  }

  // === LOADING ===
  showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
    this.state.isLoading = true;
  }

  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
    this.state.isLoading = false;
  }

  // === REFRESH ===
  async refresh() {
    console.log('🔄 Atualizando dados...');

    try {
      await this.loadSession();

      // Notificar outros módulos
      if (window.AdminDashboard) {
        await window.AdminDashboard.loadDashboardData();
      }

      const lastUpdate = document.getElementById('lastUpdate');
      if (lastUpdate) {
        const timeValue = lastUpdate.querySelector('.stat-value');
        if (timeValue) {
          timeValue.textContent = new Date().toLocaleTimeString('pt-BR');
        }
      }
    } catch (error) {
      console.error('Erro no refresh:', error);
      if (window.AdminUtils) {
        window.AdminUtils.showNotification('Erro ao atualizar dados', 'error');
      }
    }
  }

  // === UTILITÁRIOS DE SISTEMA ===
  startClock() {
    const updateClock = () => {
      const clockElement = document.getElementById('currentTime');
      if (clockElement) {
        clockElement.textContent = new Date().toLocaleTimeString('pt-BR');
      }
    };

    setInterval(updateClock, 1000);
    updateClock();
  }

  startConnectionCheck() {
    const checkConnection = () => {
      fetch('/admin/api/session')
        .then(response => {
          const statusElement = document.getElementById('connectionStatus');
          if (!statusElement) return;

          if (response.ok) {
            statusElement.innerHTML = '🟢 Conectado';
            statusElement.className = 'connection-status connected';
          } else {
            statusElement.innerHTML = '🟡 Instável';
            statusElement.className = 'connection-status unstable';
          }
        })
        .catch(() => {
          const statusElement = document.getElementById('connectionStatus');
          if (statusElement) {
            statusElement.innerHTML = '🔴 Desconectado';
            statusElement.className = 'connection-status disconnected';
          }
        });
    };

    setInterval(checkConnection, 30000);
    checkConnection();
  }

  showHelp() {
    if (!window.AdminUtils) return;

    const helpContent = `
      <h4>⌨️ Atalhos de Teclado</h4>
      <ul>
        <li><kbd>Ctrl+R</kbd> ou <kbd>F5</kbd> - Atualizar dados</li>
        <li><kbd>Esc</kbd> - Fechar modais</li>
        <li><kbd>Ctrl+/</kbd> - Mostrar esta ajuda</li>
      </ul>
      <h4>🔧 Funcionalidades CRUD</h4>
      <ul>
        <li>👁️ <strong>Visualizar:</strong> Clique em "Ver" nos cards dos modelos</li>
        <li>➕ <strong>Criar:</strong> Botão "Adicionar" nos cards ou modais</li>
        <li>✏️ <strong>Editar:</strong> Botão de lápis em cada item</li>
        <li>🗑️ <strong>Excluir:</strong> Botão de lixeira em cada item</li>
      </ul>
      <h4>🛡️ Segurança</h4>
      <ul>
        <li>Confirmação obrigatória para exclusões</li>
        <li>Validação de formulários</li>
        <li>Feedback visual de todas as operações</li>
      </ul>
    `;

    window.AdminUtils.showHelpModal('❓ Ajuda - Admin Panel v3.2', helpContent);
  }

  debug(...args) {
    if (this.getSettings().devMode) {
      console.log('🐛 [DEBUG Core]', ...args);
    }
  }
}

// Exportar para uso global
window.AdminCore = AdminCore;