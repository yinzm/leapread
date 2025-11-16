// HTML清洗模块 - 提取公众号文章正文
const HTMLCleaner = {
  // 清洗HTML，提取纯文本
  cleanArticle(doc = document) {
    try {
      const result = {
        title: '',
        author: '',
        publishTime: '',
        content: ''
      };

      // 提取标题
      const titleEl = doc.querySelector('#activity-name') || doc.querySelector('.rich_media_title');
      if (titleEl) {
        result.title = titleEl.textContent.trim();
      }

      // 提取作者
      const authorEl = doc.querySelector('#js_name') || doc.querySelector('.rich_media_meta_nickname');
      if (authorEl) {
        result.author = authorEl.textContent.trim();
      }

      // 提取发布时间
      const timeEl = doc.querySelector('#publish_time') || doc.querySelector('.rich_media_meta_text');
      if (timeEl) {
        result.publishTime = timeEl.textContent.trim();
      }

      // 提取正文内容
      const contentEl = doc.querySelector('#js_content') || doc.querySelector('.rich_media_content');
      if (!contentEl) {
        throw new Error('未找到文章正文元素');
      }

      // 克隆内容元素以避免修改原DOM
      const clonedContent = contentEl.cloneNode(true);

      // 移除不需要的元素
      const selectorsToRemove = [
        'img',
        'video',
        'audio',
        'iframe',
        'script',
        'style',
        '.js_sponsor_ad_area',  // 广告
        '.qr_code_pc',           // 二维码
        '.profile_container',    // 公众号信息
        '.rich_media_tool',      // 工具栏
        '.share_notice',         // 分享提示
        '[style*="display:none"]',
        '[style*="display: none"]'
      ];

      selectorsToRemove.forEach(selector => {
        clonedContent.querySelectorAll(selector).forEach(el => el.remove());
      });

      // 提取文本内容，保留基本结构
      result.content = this.extractTextWithStructure(clonedContent);

      return result;
    } catch (error) {
      console.error('HTML清洗失败:', error);
      throw error;
    }
  },

  // 提取文本并保留结构
  extractTextWithStructure(element) {
    let text = '';
    const nodes = element.childNodes;

    for (let node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const content = node.textContent.trim();
        if (content) {
          text += content + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        
        // 处理标题
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          const level = parseInt(tagName[1]);
          const headingText = node.textContent.trim();
          if (headingText) {
            text += '\n' + '#'.repeat(level) + ' ' + headingText + '\n\n';
          }
        }
        // 处理段落
        else if (tagName === 'p' || tagName === 'div') {
          const content = this.extractTextWithStructure(node);
          if (content.trim()) {
            text += content + '\n\n';
          }
        }
        // 处理换行
        else if (tagName === 'br') {
          text += '\n';
        }
        // 处理强调（保留标记以便识别重点）
        else if (tagName === 'strong' || tagName === 'b') {
          const content = node.textContent.trim();
          if (content) {
            text += '**' + content + '** ';
          }
        }
        // 处理斜体
        else if (tagName === 'em' || tagName === 'i') {
          const content = node.textContent.trim();
          if (content) {
            text += '*' + content + '* ';
          }
        }
        // 递归处理其他元素
        else {
          text += this.extractTextWithStructure(node);
        }
      }
    }

    return text;
  },

  // 清理多余空白
  normalizeWhitespace(text) {
    return text
      .replace(/\n{3,}/g, '\n\n')  // 最多保留两个换行
      .replace(/ +/g, ' ')          // 多个空格合并为一个
      .trim();
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HTMLCleaner;
}
