// Options页面脚本
document.addEventListener('DOMContentLoaded', async () => {
  // 获取DOM元素
  const elements = {
    apiEndpoint: document.getElementById('apiEndpoint'),
    apiKey: document.getElementById('apiKey'),
    modelName: document.getElementById('modelName'),
    promptText: document.getElementById('promptText'),
    loadPromptBtn: document.getElementById('loadPromptBtn'),
    resetPromptBtn: document.getElementById('resetPromptBtn'),
    promptFileInput: document.getElementById('promptFileInput'),
    saveBtn: document.getElementById('saveBtn'),
    statusMessage: document.getElementById('statusMessage')
  };

  // 默认Prompt
  const DEFAULT_PROMPT = `你是一个专业的文章总结助手。请仔细阅读以下公众号文章内容，并按照以下要求生成总结：

1. 使用Markdown无序列表格式
2. 提炼文章的核心观点和关键信息
3. 去除营销性和冗余内容
4. 保持客观准确，不臆造信息
5. 可以包含一级列表和二级列表嵌套
6. 允许使用粗体(**text**)和斜体(*text*)强调重点
7. 总结应简洁精炼，一般控制在5-10个要点

请开始总结：`;

  // API配置示例
  const API_EXAMPLES = {
    siliconflow: {
      endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      model: 'zai-org/GLM-4.6'
    },
    siliconflow_qwen: {
      endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      model: 'Qwen/QwQ-32B'
    }
  };

  // 加载当前配置
  await loadConfig();

  // 快速填充API示例
  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const apiType = btn.dataset.api;
      if (apiType === 'siliconflow') {
        elements.apiEndpoint.value = API_EXAMPLES.siliconflow.endpoint;
        elements.modelName.value = API_EXAMPLES.siliconflow.model;
        showStatus('已填充SiliconFlow GLM-4.6配置', 'success');
      } else if (apiType === 'siliconflow_qwen') {
        elements.apiEndpoint.value = API_EXAMPLES.siliconflow_qwen.endpoint;
        elements.modelName.value = API_EXAMPLES.siliconflow_qwen.model;
        showStatus('已填充SiliconFlow Qwen配置', 'success');
      }
    });
  });

  // 保存设置
  elements.saveBtn.addEventListener('click', async () => {
    await saveConfig();
  });

  // 从文件加载Prompt
  elements.loadPromptBtn.addEventListener('click', () => {
    elements.promptFileInput.click();
  });

  elements.promptFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await loadPromptFromFile(file);
    }
  });

  // 恢复默认Prompt
  elements.resetPromptBtn.addEventListener('click', () => {
    elements.promptText.value = DEFAULT_PROMPT;
    showStatus('已恢复默认Prompt', 'success');
  });

  // 加载配置
  async function loadConfig() {
    try {
      const { config, customPrompt } = await chrome.storage.local.get(['config', 'customPrompt']);
      
      if (config) {
        elements.apiEndpoint.value = config.apiEndpoint || '';
        elements.apiKey.value = config.apiKey || '';
        elements.modelName.value = config.modelName || '';
        
        // 加载Prompt（优先使用自定义Prompt）
        if (customPrompt) {
          elements.promptText.value = customPrompt;
        } else if (config.defaultPrompt) {
          elements.promptText.value = config.defaultPrompt;
        } else {
          elements.promptText.value = DEFAULT_PROMPT;
        }
      } else {
        // 首次使用，显示默认值（SiliconFlow）
        elements.apiEndpoint.value = 'https://api.siliconflow.cn/v1/chat/completions';
        elements.modelName.value = 'zai-org/GLM-4.6';
        elements.promptText.value = DEFAULT_PROMPT;
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      showStatus('加载配置失败: ' + error.message, 'error');
    }
  }

  // 保存配置
  async function saveConfig() {
    try {
      // 验证必填项
      if (!elements.apiKey.value.trim()) {
        showStatus('请输入API Key', 'error');
        elements.apiKey.focus();
        return;
      }

      if (!elements.apiEndpoint.value.trim()) {
        showStatus('请输入API Endpoint', 'error');
        elements.apiEndpoint.focus();
        return;
      }

      if (!elements.modelName.value.trim()) {
        showStatus('请输入模型名称', 'error');
        elements.modelName.focus();
        return;
      }

      // 构建配置对象
      const config = {
        apiEndpoint: elements.apiEndpoint.value.trim(),
        apiKey: elements.apiKey.value.trim(),
        modelName: elements.modelName.value.trim(),
        defaultPrompt: DEFAULT_PROMPT
      };

      // 保存配置
      await chrome.storage.local.set({ config });

      // 保存自定义Prompt
      const customPrompt = elements.promptText.value.trim();
      if (customPrompt && customPrompt !== DEFAULT_PROMPT) {
        await chrome.storage.local.set({ customPrompt });
      } else {
        // 如果是默认Prompt，清除自定义Prompt
        await chrome.storage.local.remove('customPrompt');
      }

      showStatus('✅ 设置保存成功！', 'success');
    } catch (error) {
      console.error('保存配置失败:', error);
      showStatus('保存失败: ' + error.message, 'error');
    }
  }

  // 从文件加载Prompt
  async function loadPromptFromFile(file) {
    try {
      const text = await file.text();
      elements.promptText.value = text;
      showStatus('Prompt加载成功', 'success');
    } catch (error) {
      console.error('加载Prompt文件失败:', error);
      showStatus('加载文件失败: ' + error.message, 'error');
    }
  }

  // 显示状态消息
  function showStatus(message, type) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;
    elements.statusMessage.classList.remove('hidden');

    // 3秒后自动隐藏
    setTimeout(() => {
      elements.statusMessage.classList.add('hidden');
    }, 3000);
  }
});
