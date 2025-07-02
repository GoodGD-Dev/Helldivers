// Utilitários de UI - Modais, notificações, helpers

class AdminUtils {
  constructor() {
    this.confirmCallback = null;

    // Bind methods
    this.showNotification = this.showNotification.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.confirmAction = this.confirmAction.bind(this);
    this.showHelpModal = this.showHelpModal.bind(this);
    this.syncData = this.syncData.bind(this);
    this.exportData = this.exportData.bind(this);
    this.showSettings = this.showSettings.bind(this);
    this.closeAllModals = this.closeAllModals.bind(this);
    this.closeConfirmModal = this.closeConfirmModal.bind(this);
    this.executeConfirmAction = this.executeConfirmAction.bind(this);
  }

  // === HELPERS PARA ACESSAR OUTRAS INSTÂNCIAS ===
  getAdminCore() {
    if (window.AdminSystem?.core) {
      return window.AdminSystem.core;
    }
    if (window.adminApp?.core) {
      return window.adminApp.core;
    }
    if (window.AdminSystemApp?.core) {
      return window.AdminSystemApp.core;
    }
    return null;
  }

  getAdminDashboard() {
    if (window.AdminSystem?.dashboard) {
      return window.AdminSystem.dashboard;
    }
    if (window.adminApp?.dashboard) {
      return window.adminApp.dashboard;
    }
    if (window.AdminSystemApp?.dashboard) {
      return window.AdminSystemApp.dashboard;
    }
    return null;
  }

  // === NOTIFICAÇÕES ===
  showNotification(message, type = 'info', duration = 5000) {
    // Obter configurações de forma segura
    let settings = { notifications: true, devMode: false };
    try {
      const core = this.getAdminCore();
      if (core?.getSettings) {
        settings = core.getSettings();
      } else if (localStorage.getItem('adminSettings')) {
        settings = { ...settings, ...JSON.parse(localStorage.getItem('adminSettings')) };
      }
    } catch (error) {
      // Usar configurações padrão se houver erro
    }

    if (!settings.notifications && type !== 'error') return;

    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    container.appendChild(notification);

    // Auto-remover
    setTimeout(() => {
      if (notification.parentNode) notification.remove();
    }, duration);

    // Event listener para botão fechar
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        notification.remove();
      });
    }

    if (settings.devMode) {
      console.log(`📢 Notificação [${type}]: ${message}`);
    }
  }

  // === MODAIS ===
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
      modal.classList.remove('modal-show');
    });
    document.body.style.overflow = 'auto';
    document.body.classList.remove('modal-confirmation-active');
    this.confirmCallback = null;
  }

  showModalFromHTML(id, html) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', html);
  }

  // === CONFIRMAÇÃO - CORRIGIDO PARA Z-INDEX ===
  confirmAction(title, message, callback) {
    // Fechar outros modais primeiro
    this.closeAllModals();

    // Pequeno delay para garantir que outros modais fecharam
    setTimeout(() => {
      const confirmTitle = document.getElementById('confirmTitle');
      const confirmMessage = document.getElementById('confirmMessage');

      if (confirmTitle) confirmTitle.textContent = title;
      if (confirmMessage) confirmMessage.textContent = message;

      this.confirmCallback = callback;

      // Adicionar classe para gestão de z-index
      document.body.classList.add('modal-confirmation-active');

      // Mostrar modal de confirmação
      this.showModal('confirmModal');

      // Garantir z-index máximo
      const confirmModal = document.getElementById('confirmModal');
      if (confirmModal) {
        confirmModal.style.zIndex = '3000';
      }
    }, 100);
  }

  closeConfirmModal() {
    this.closeModal('confirmModal');
    document.body.classList.remove('modal-confirmation-active');
    this.confirmCallback = null;
  }

  executeConfirmAction() {
    const callback = this.confirmCallback;
    this.closeConfirmModal();

    if (callback) {
      // Pequeno delay antes de executar para suavizar transição
      setTimeout(() => {
        callback();
      }, 200);
    }
  }

  setupConfirmModal() {
    const confirmElements = {
      confirmModalClose: () => this.closeConfirmModal(),
      confirmCancel: () => this.closeConfirmModal(),
      confirmButton: () => this.executeConfirmAction()
    };

    Object.entries(confirmElements).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        element.removeEventListener('click', handler);
        element.addEventListener('click', handler);
      }
    });

    // Fechar modais ao clicar fora
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeAllModals();
      }
    });

    // Fechar notificações
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-close')) {
        e.target.closest('.notification').remove();
      }
    });
  }

  // === MODAL DE AJUDA ===
  showHelpModal(title, content) {
    const helpModal = document.createElement('div');
    helpModal.className = 'modal help-modal';
    helpModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close help-close">&times;</button>
        </div>
        <div class="modal-body">${content}</div>
        <div class="modal-footer">
          <button class="btn btn-primary help-close-btn">Fechar</button>
        </div>
      </div>
    `;

    document.body.appendChild(helpModal);

    const closeHelp = () => {
      helpModal.classList.remove('modal-show');
      setTimeout(() => helpModal.remove(), 300);
    };

    helpModal.querySelector('.help-close').addEventListener('click', closeHelp);
    helpModal.querySelector('.help-close-btn').addEventListener('click', closeHelp);
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) closeHelp();
    });

    setTimeout(() => helpModal.classList.add('modal-show'), 10);
    setTimeout(closeHelp, 30000);
  }

  // === MODAL DE CONFIGURAÇÕES ===
  showSettings() {
    console.log('⚙️ Abrindo configurações...');
    this.showModal('settingsModal');
    this.loadSettingsValues();
    this.setupSettingsModal();
  }

  setupSettingsModal() {
    const settingsElements = {
      settingsModalClose: () => this.closeModal('settingsModal'),
      settingsCancel: () => this.closeModal('settingsModal'),
      settingsSave: () => this.saveSettings()
    };

    Object.entries(settingsElements).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        element.removeEventListener('click', handler);
        element.addEventListener('click', handler);
      }
    });
  }

  loadSettingsValues() {
    // Obter configurações de forma segura
    let settings = { autoRefresh: false, darkTheme: true, notifications: true, devMode: false };
    try {
      const core = this.getAdminCore();
      if (core?.getSettings) {
        settings = core.getSettings();
      } else if (localStorage.getItem('adminSettings')) {
        settings = { ...settings, ...JSON.parse(localStorage.getItem('adminSettings')) };
      }
    } catch (error) {
      // Usar configurações padrão
    }

    const settingInputs = {
      autoRefresh: settings.autoRefresh,
      darkTheme: settings.darkTheme,
      notifications: settings.notifications,
      devMode: settings.devMode
    };

    Object.entries(settingInputs).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.checked = value;
    });
  }

  saveSettings() {
    const settingIds = ['autoRefresh', 'darkTheme', 'notifications', 'devMode'];
    const settings = {};

    settingIds.forEach(id => {
      const input = document.getElementById(id);
      settings[id] = input ? input.checked : false;
    });

    // Salvar configurações de forma segura
    try {
      const core = this.getAdminCore();
      if (core) {
        core.setSettings(settings);
        core.applySettings(settings);
      } else {
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        this.applySettingsFallback(settings);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }

    this.closeModal('settingsModal');
    this.showNotification('Configurações salvas!', 'success');
  }

  applySettingsFallback(settings) {
    document.body.classList.toggle('light-theme', !settings.darkTheme);
    document.body.classList.toggle('dev-mode', settings.devMode);
  }

  // === HELPERS PARA FORMULÁRIOS ===
  getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    const numberFields = [
      'damage', 'fireRate', 'magazineSize', 'reloadTime',
      'blastRadius', 'cooldown', 'uses', 'armorRating',
      'speed', 'staminaRegen'
    ];

    for (let [key, value] of formData.entries()) {
      data[key] = numberFields.includes(key) && value ? parseFloat(value) : value || undefined;
    }

    return data;
  }

  validateFormData(data) {
    const errors = [];

    if (!data.name || !data.name.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!data.description || !data.description.trim()) {
      errors.push('Descrição é obrigatória');
    }

    if (data.name && data.name.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (data.description && data.description.length < 5) {
      errors.push('Descrição deve ter pelo menos 5 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  showFormErrors(errors) {
    const errorList = errors.map(error => `• ${error}`).join('\n');
    this.showNotification(`Erros no formulário:\n${errorList}`, 'error', 7000);
  }

  // === AÇÕES RÁPIDAS ===
  async syncData() {
    console.log('🔄 Sincronizando dados...');

    // Mostrar loading de forma segura
    const core = this.getAdminCore();
    if (core?.showLoading) {
      core.showLoading();
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fazer refresh de forma segura
      if (core?.refresh) {
        await core.refresh();
      }

      this.showNotification('Dados sincronizados com sucesso!', 'success');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      this.showNotification('Erro ao sincronizar dados', 'error');
    } finally {
      // Esconder loading de forma segura
      if (core?.hideLoading) {
        core.hideLoading();
      }
    }
  }

  async exportData() {
    console.log('📁 Exportando dados...');

    try {
      // Mostrar loading de forma segura
      const core = this.getAdminCore();
      if (core?.showLoading) {
        core.showLoading();
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Obter informações da sessão de forma segura
      let sessionInfo = null;
      try {
        sessionInfo = core?.state?.sessionInfo;
      } catch (error) {
        // Usar dados padrão se não conseguir obter da sessão
      }

      const data = {
        timestamp: new Date().toISOString(),
        exported_by: sessionInfo?.user || 'admin',
        note: 'Dados exportados do Admin Panel',
        version: '3.2'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `helldivers2-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification('Dados exportados com sucesso!', 'success');
    } catch (error) {
      console.error('Erro na exportação:', error);
      this.showNotification('Erro ao exportar dados', 'error');
    } finally {
      // Esconder loading de forma segura
      const core = this.getAdminCore();
      if (core?.hideLoading) {
        core.hideLoading();
      }
    }
  }

  // === HELPERS GERAIS ===
  formatDisplayValue(value, fieldConfig) {
    if (value === null || value === undefined) {
      return '-';
    }

    if (fieldConfig?.type === 'number' && fieldConfig?.unit) {
      return `${value} ${fieldConfig.unit}`;
    }

    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }

    return value;
  }

  generateItemId() {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // === DEBUGGING ===
  debug(...args) {
    // Obter configurações de forma segura para debug
    let devMode = false;
    try {
      const core = this.getAdminCore();
      if (core?.getSettings) {
        devMode = core.getSettings().devMode;
      } else if (localStorage.getItem('adminSettings')) {
        const settings = JSON.parse(localStorage.getItem('adminSettings'));
        devMode = settings.devMode;
      }
    } catch (error) {
      // Ignorar erro e não fazer debug
    }

    if (devMode) {
      console.log('🐛 [DEBUG Utils]', ...args);
    }
  }

  // === INICIALIZAÇÃO ===
  init() {
    this.setupConfirmModal();
    console.log('🛠️ Admin Utils inicializado');
  }
}

// Exportar para uso global
window.AdminUtils = AdminUtils;