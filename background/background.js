// Background Service Worker - 增强调试版本
console.log('🐸 LeapRead - Background Service Worker 启动中...');

// 详细的启动检查
(async function initializeExtension() {
  console.log('步骤1: 检查Chrome API可用性');
  
  // 检查基本API
  console.log('- chrome.runtime:', chrome.runtime ? '✅' : '❌');
  console.log('- chrome.action:', chrome.action ? '✅' : '❌');
  console.log('- chrome.sidePanel:', chrome.sidePanel ? '✅' : '❌');
  console.log('- chrome.storage:', chrome.storage ? '✅' : '❌');
  
  if (chrome.sidePanel) {
    console.log('步骤2: 尝试配置侧边栏行为');
    try {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      console.log('✅ 侧边栏行为配置成功！点击图标将打开侧边栏');
    } catch (error) {
      console.error('❌ 侧边栏行为配置失败:', error);
      console.log('提示：这不影响使用，用户可以右键点击图标 → "打开侧面板"');
    }
  } else {
    console.warn('⚠️ chrome.sidePanel API 不可用');
    console.log('当前Chrome版本可能不支持Side Panel');
    console.log('请检查Chrome版本是否 >= 114');
  }
  
  console.log('步骤3: 添加点击监听器（备用方案）');
  // 添加点击监听作为备用
  chrome.action.onClicked.addListener(async (tab) => {
    console.log('🖱️ 用户点击了插件图标！');
    console.log('- 标签页ID:', tab.id);
    console.log('- 标签页URL:', tab.url);
    console.log('- 窗口ID:', tab.windowId);
    
    if (chrome.sidePanel && chrome.sidePanel.open) {
      try {
        console.log('尝试打开侧边栏...');
        await chrome.sidePanel.open({ windowId: tab.windowId });
        console.log('✅ 侧边栏打开成功！');
      } catch (error) {
        console.error('❌ 侧边栏打开失败:', error);
      }
    } else {
      console.warn('⚠️ chrome.sidePanel.open 方法不可用');
    }
  });
  
  console.log('✅ 初始化完成！扩展已准备就绪');
})();

// 插件安装时初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('📦 onInstalled 事件触发:', details.reason);
  
  if (details.reason === 'install') {
    console.log('插件首次安装');
    
    // 设置默认配置
    const defaultConfig = {
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      apiKey: '',
      modelName: 'zai-org/GLM-4.6',
      defaultPrompt: '你是一个专业的文章总结助手。请仔细阅读以下公众号文章内容，并按照以下要求生成总结：\n\n1. 使用Markdown无序列表格式\n2. 提炼文章的核心观点和关键信息\n3. 去除营销性和冗余内容\n4. 保持客观准确，不臆造信息\n5. 可以包含一级列表和二级列表嵌套\n6. 允许使用粗体(**text**)和斜体(*text*)强调重点\n\n请开始总结：'
    };
    
    await chrome.storage.local.set({ config: defaultConfig });
    console.log('✅ 默认配置已保存');
    
    // 打开设置页面
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('插件已更新到新版本');
  }
});

// 监听来自popup或content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 收到消息:', request.action, 'from', sender.tab ? 'content script' : 'popup');
  
  if (request.action === 'callAI') {
    handleAICall(request.data)
      .then(result => {
        console.log('✅ AI调用完成');
        sendResponse(result);
      })
      .catch(error => {
        console.error('❌ AI调用失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// 处理AI调用
async function handleAICall(data) {
  console.log('🤖 开始AI调用...');
  try {
    const { articleData, config, prompt } = data;
    
    // 构建输入文本
    let inputText = '';
    if (articleData.title) {
      inputText += `标题：${articleData.title}\n\n`;
    }
    if (articleData.author) {
      inputText += `作者：${articleData.author}\n\n`;
    }
    inputText += `正文：\n${articleData.content}`;

    // 构建请求消息
    const messages = [
      {
        role: 'system',
        content: prompt || config.defaultPrompt
      },
      {
        role: 'user',
        content: inputText
      }
    ];

    // 调用API
    const requestBody = {
      model: config.modelName || 'zai-org/GLM-4.6',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000
    };

    console.log('调用AI API:', config.apiEndpoint);
    console.log('使用模型:', config.modelName);

    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('API响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API调用失败 (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }

    const responseData = await response.json();
    
    if (responseData.choices && responseData.choices.length > 0) {
      console.log('✅ AI返回成功');
      return {
        success: true,
        summary: responseData.choices[0].message.content.trim()
      };
    } else {
      throw new Error('API返回数据格式异常');
    }
  } catch (error) {
    console.error('AI调用失败:', error);
    throw error;
  }
}

console.log('📄 background.js 加载完成');
