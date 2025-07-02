// Arquivo principal - Integra todos os módulos do admin

/**
 * Sistema Admin Principal v3.2 - Versão Robusta
 * Inicialização sequencial e tratamento de erros melhorado
 */
class AdminApp {
  constructor() {
    this.core = null;
    this.utils = null;
    this.dashboard = null;
    this.models = null;
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;

    // Bind methods
    this.init = this.init.bind(this);
    this.initializeModules = this.initializeModules.bind(this);
    this.setupGlobalFunctions = this.setupGlobalFunctions.bind(this);
    this.retryInitialization = this.retryInitialization.bind(this);
  }

  // === INICIALIZAÇÃO PRINCIPAL ===
  async init() {
    console.log('🚀 Inicializando Admin App Principal v3.2...');

    try {
      // Verificar se todas as classes estão disponíveis
      if (!this.checkClassesLoaded()) {
        if (this.retryCount < this.maxRetries) {
          console.log(`⏳ Tentativa ${this.retryCount + 1}/${this.maxRetries} - aguardando módulos...`);
          return await this.retryInitialization();
        } else {
          throw new Error('Módulos não carregados após múltiplas tentativas');
        }
      }

      // Inicializar módulos na ordem correta
      await this.initializeModules();

      // Configurar funções globais para compatibilidade
      this.setupGlobalFunctions();

      // Marcar como inicializado
      this.isInitialized = true;

      console.log('✅ Admin App Principal inicializado com sucesso');
      console.log('📊 Módulos carregados:', {
        core: !!this.core,
        utils: !!this.utils,
        dashboard: !!this.dashboard,
        models: !!this.models
      });

      // Mostrar notificação de sucesso (após 2 segundos)
      setTimeout(() => {
        if (this.utils?.showNotification) {
          this.utils.showNotification('Admin Panel carregado com sucesso! 🎉', 'success', 3000);
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Admin App:', error);
      this.handleInitializationError(error);
      return false;
    }
  }

  // === RETRY LOGIC ===
  async retryInitialization() {
    this.retryCount++;

    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.init();
        resolve(result);
      }, 1000); // Aguardar 1 segundo antes de tentar novamente
    });
  }

  // === VERIFICAÇÃO DOS MÓDULOS ===
  checkClassesLoaded() {
    const requiredClasses = {
      AdminCore: window.AdminCore,
      AdminUtils: window.AdminUtils,
      AdminDashboard: window.AdminDashboard,
      AdminModels: window.AdminModels
    };

    const missing = [];
    const loaded = [];

    for (const [name, cls] of Object.entries(requiredClasses)) {
      if (!cls) {
        missing.push(name);
      } else {
        loaded.push(name);
      }
    }

    console.log('📦 Classes carregadas:', loaded);
    if (missing.length > 0) {
      console.log('⏳ Aguardando classes:', missing);
      return false;
    }

    // Verificar se as classes são realmente construtores
    for (const [name, cls] of Object.entries(requiredClasses)) {
      if (typeof cls !== 'function') {
        console.error(`❌ ${name} não é uma função construtora:`, typeof cls);
        return false;
      }
    }

    return true;
  }

  // === INICIALIZAÇÃO DOS MÓDULOS ===
  async initializeModules() {
    try {
      console.log('🔧 Inicializando módulos sequencialmente...');

      // 1. Core primeiro (base de tudo)
      console.log('1️⃣ Inicializando Core...');
      this.core = new window.AdminCore();
      const coreSuccess = await this.core.init();
      if (!coreSuccess) {
        throw new Error('Falha ao inicializar Core');
      }

      // 2. Utils (depende do Core para configurações)
      console.log('2️⃣ Inicializando Utils...');
      this.utils = new window.AdminUtils();
      this.utils.init();

      // Disponibilizar instâncias globalmente ANTES de inicializar Dashboard
      window.AdminSystem = {
        core: this.core,
        utils: this.utils,
        dashboard: null, // Será definido após inicialização
        models: null     // Será definido após inicialização
      };

      // 3. Dashboard (precisa das instâncias disponíveis)
      console.log('3️⃣ Inicializando Dashboard...');
      this.dashboard = new window.AdminDashboard();
      window.AdminSystem.dashboard = this.dashboard;

      const dashboardSuccess = await this.dashboard.init();
      if (!dashboardSuccess) {
        console.warn('⚠️ Dashboard não inicializou corretamente, mas continuando...');
      }

      // 4. Models (precisa das outras instâncias)
      console.log('4️⃣ Inicializando Models...');
      this.models = new window.AdminModels();
      window.AdminSystem.models = this.models;

      // Atualizar referência global final
      window.AdminSystem = {
        core: this.core,
        utils: this.utils,
        dashboard: this.dashboard,
        models: this.models
      };

      console.log('✅ Todos os módulos inicializados com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao inicializar módulos:', error);
      throw error;
    }
  }

  // === FUNÇÕES GLOBAIS PARA COMPATIBILIDADE ===
  setupGlobalFunctions() {
    // Compatibilidade com código existente
    window.AdminApp = {
      // Métodos de models
      viewModel: (modelKey) => this.models?.viewModel(modelKey),
      addToModel: (modelKey) => this.models?.addToModel(modelKey),
      editItem: (modelKey, itemId, itemData) => this.models?.editItem(modelKey, itemId, itemData),
      deleteItem: (modelKey, itemId, itemName) => this.models?.confirmDeleteItem(modelKey, itemId, itemName),

      // Métodos de utils
      showNotification: (message, type, duration) => this.utils?.showNotification(message, type, duration),
      showLoading: () => this.core?.showLoading(),
      hideLoading: () => this.core?.hideLoading(),
      confirmAction: (title, message, callback) => this.utils?.confirmAction(title, message, callback),

      // Métodos de core
      refresh: () => this.core?.refresh(),
      getSettings: () => this.core?.getSettings(),

      // Métodos de dashboard
      loadDashboardData: () => this.dashboard?.loadDashboardData(),
      showStats: () => this.dashboard?.showStats()
    };

    // Compatibilidade com DashboardApp
    window.DashboardApp = {
      init: () => this.dashboard?.init(),
      loadDashboardData: () => this.dashboard?.loadDashboardData()
    };

    // Funções globais individuais
    window.confirmAction = (title, message, callback) => {
      this.utils?.confirmAction(title, message, callback);
    };

    window.showLoading = () => {
      this.core?.showLoading();
    };

    window.hideLoading = () => {
      this.core?.hideLoading();
    };

    window.showNotification = (message, type = 'info', duration = 5000) => {
      this.utils?.showNotification(message, type, duration);
    };

    console.log('🔗 Funções globais configuradas para compatibilidade');
  }

  // === TRATAMENTO DE ERROS ===
  handleInitializationError(error) {
    console.error('❌ Falha crítica na inicialização:', error);

    // Tentar mostrar erro na UI se possível
    const container = document.getElementById('notificationContainer');
    if (container) {
      const errorNotification = document.createElement('div');
      errorNotification.className = 'notification notification-error';
      errorNotification.innerHTML = `
        <div class="notification-content">
          <span class="notification-icon">❌</span>
          <span class="notification-message">Erro ao carregar Admin Panel: ${error.message}</span>
          <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
      `;
      container.appendChild(errorNotification);

      // Remover após 15 segundos
      setTimeout(() => {
        if (errorNotification.parentNode) {
          errorNotification.remove();
        }
      }, 15000);
    }

    // Mostrar no loadingScreen se ainda estiver visível
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && loadingScreen.style.display !== 'none') {
      const loadingContent = loadingScreen.querySelector('.loading-content');
      if (loadingContent) {
        loadingContent.innerHTML = `
          <div style="color: #ef4444; text-align: center;">
            <h2>❌ Erro na Inicialização</h2>
            <p>${error.message}</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
              🔄 Tentar Novamente
            </button>
          </div>
        `;
      }
    }

    // Fallback para alert se necessário (apenas após múltiplas tentativas)
    if (this.retryCount >= this.maxRetries) {
      setTimeout(() => {
        if (confirm(`Erro ao carregar Admin Panel:\n\n${error.message}\n\nDeseja recarregar a página?`)) {
          location.reload();
        }
      }, 2000);
    }
  }

  // === MÉTODOS PÚBLICOS ===
  async refresh() {
    if (this.core) {
      await this.core.refresh();
    }
  }

  async showStats() {
    if (this.dashboard) {
      await this.dashboard.showStats();
    }
  }

  async syncData() {
    if (this.utils) {
      await this.utils.syncData();
    }
  }

  async exportData() {
    if (this.utils) {
      await this.utils.exportData();
    }
  }

  showSettings() {
    if (this.utils) {
      this.utils.showSettings();
    }
  }

  async viewModel(modelKey) {
    if (this.models) {
      await this.models.viewModel(modelKey);
    }
  }

  async addToModel(modelKey) {
    if (this.models) {
      await this.models.addToModel(modelKey);
    }
  }

  // === DIAGNÓSTICO ===
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      retryCount: this.retryCount,
      modules: {
        core: {
          loaded: !!window.AdminCore,
          instance: !!this.core,
          methods: this.core ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.core)) : []
        },
        utils: {
          loaded: !!window.AdminUtils,
          instance: !!this.utils,
          methods: this.utils ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.utils)) : []
        },
        dashboard: {
          loaded: !!window.AdminDashboard,
          instance: !!this.dashboard,
          modelConfigs: Object.keys(this.dashboard?.modelConfigs || {})
        },
        models: {
          loaded: !!window.AdminModels,
          instance: !!this.models,
          modelConfigs: Object.keys(this.models?.modelConfigs || {})
        }
      },
      globalReferences: {
        AdminSystem: !!window.AdminSystem,
        AdminApp: !!window.AdminApp,
        DashboardApp: !!window.DashboardApp
      },
      timestamp: new Date().toISOString()
    };
  }

  debug() {
    console.log('🐛 Admin System Debug Info:');
    console.table(this.getSystemStatus());
  }
}

// === INICIALIZAÇÃO AUTOMÁTICA ===

let adminApp = null;

async function initializeAdmin() {
  try {
    console.log('📄 Iniciando processo de inicialização...');
    console.log('🔍 Classes disponíveis:', {
      AdminCore: !!window.AdminCore,
      AdminUtils: !!window.AdminUtils,
      AdminDashboard: !!window.AdminDashboard,
      AdminModels: !!window.AdminModels
    });

    // Criar instância principal
    adminApp = new AdminApp();

    // Inicializar
    const success = await adminApp.init();

    if (success) {
      // Disponibilizar globalmente
      window.AdminSystemApp = adminApp;

      // Debug em modo desenvolvimento
      const settings = adminApp.core?.getSettings() || {};
      if (settings.devMode) {
        console.log('🔧 Modo debug ativado');
        window.AdminDebug = () => adminApp.debug();
        window.AdminStatus = () => adminApp.getSystemStatus();
      }

      console.log('🎉 Sistema Admin completamente carregado e funcional!');

      // Esconder loading screen
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }

    } else {
      throw new Error('Falha na inicialização do sistema');
    }

  } catch (error) {
    console.error('❌ Erro crítico na inicialização:', error);

    // Mostrar erro detalhado no loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      const loadingContent = loadingScreen.querySelector('.loading-content');
      if (loadingContent) {
        loadingContent.innerHTML = `
          <div style="color: #ef4444; text-align: center; max-width: 500px;">
            <h2>❌ Erro na Inicialização</h2>
            <p><strong>Erro:</strong> ${error.message}</p>
            <details style="margin: 20px 0; text-align: left;">
              <summary style="cursor: pointer; color: #ffd700;">🔍 Detalhes Técnicos</summary>
              <pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; font-size: 12px; overflow: auto; max-height: 200px;">${error.stack || 'Stack trace não disponível'}</pre>
            </details>
            <div style="margin-top: 20px;">
              <button onclick="location.reload()" style="margin: 5px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🔄 Recarregar Página
              </button>
              <button onclick="console.log('AdminApp Debug:', window.AdminSystemApp?.getSystemStatus?.() || 'Não disponível')" style="margin: 5px; padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🐛 Debug Console
              </button>
            </div>
          </div>
        `;
      }
    }
  }
}

// === CARREGAMENTO INTELIGENTE ===

function startInitialization() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeAdmin, 100);
    });
  } else {
    setTimeout(initializeAdmin, 100);
  }
}

// === TRATAMENTO DE ERROS GLOBAL ===

window.addEventListener('error', function (e) {
  console.error('🐛 Erro JavaScript capturado:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error?.stack
  });

  // Se houver sistema disponível, mostrar notificação
  if (window.AdminSystem?.utils?.showNotification) {
    window.AdminSystem.utils.showNotification(
      `Erro JavaScript: ${e.message}`,
      'error',
      5000
    );
  }
});

// Inicializar
startInitialization();

console.log('📄 Admin.js principal carregado - iniciando processo...');