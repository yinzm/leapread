// 存储管理工具模块
const StorageManager = {
  // 默认配置
  DEFAULT_CONFIG: {
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    modelName: 'gpt-4o-mini',
    defaultPrompt: ''
  },

  // 获取配置
  async getConfig() {
    try {
      const result = await chrome.storage.local.get('config');
      return result.config || this.DEFAULT_CONFIG;
    } catch (error) {
      console.error('获取配置失败:', error);
      return this.DEFAULT_CONFIG;
    }
  },

  // 保存配置
  async saveConfig(config) {
    try {
      await chrome.storage.local.set({ config });
      return { success: true };
    } catch (error) {
      console.error('保存配置失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 获取Prompt
  async getPrompt() {
    try {
      const result = await chrome.storage.local.get('customPrompt');
      if (result.customPrompt) {
        return result.customPrompt;
      }
      // 如果没有自定义Prompt，返回默认Prompt
      const config = await this.getConfig();
      return config.defaultPrompt;
    } catch (error) {
      console.error('获取Prompt失败:', error);
      return '';
    }
  },

  // 保存自定义Prompt
  async savePrompt(promptContent) {
    try {
      await chrome.storage.local.set({ customPrompt: promptContent });
      return { success: true };
    } catch (error) {
      console.error('保存Prompt失败:', error);
      return { success: false, error: error.message };
    }
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
