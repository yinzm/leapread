// AI模型交互模块
const AIService = {
  // 调用大模型API进行总结
  async summarizeArticle(articleData, config, prompt) {
    try {
      // 构建完整的输入文本
      const inputText = this.buildInputText(articleData);
      
      // 检查配置
      if (!config.apiKey) {
        throw new Error('请先在设置中配置API Key');
      }

      if (!config.apiEndpoint) {
        throw new Error('请先在设置中配置API Endpoint');
      }

      // 构建请求消息
      const messages = [
        {
          role: 'system',
          content: prompt || '你是一个专业的文章总结助手，请用Markdown无序列表格式总结文章的核心内容。'
        },
        {
          role: 'user',
          content: inputText
        }
      ];

      // 发送API请求
      const response = await this.callAPI(config, messages);
      
      return {
        success: true,
        summary: response
      };
    } catch (error) {
      console.error('AI总结失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 构建输入文本
  buildInputText(articleData) {
    let text = '';
    
    if (articleData.title) {
      text += `标题：${articleData.title}\n\n`;
    }
    
    if (articleData.author) {
      text += `作者：${articleData.author}\n\n`;
    }
    
    text += `正文：\n${articleData.content}`;
    
    return text;
  },

  // 调用API
  async callAPI(config, messages) {
    const requestBody = {
      model: config.modelName || 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000
    };

    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API调用失败 (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    
    // 解析响应
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('API返回数据格式异常');
    }
  },

  // 检查Token限制（简单估算）
  estimateTokens(text) {
    // 简单估算：中文约1.5字符/token，英文约4字符/token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIService;
}
