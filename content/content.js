// Content Script - 注入到公众号文章页面
console.log('🐸 LeapRead - Content Script已加载');

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractArticle') {
    try {
      // 使用HTMLCleaner提取文章内容
      const articleData = {
        title: '',
        author: '',
        publishTime: '',
        content: ''
      };

      // 提取标题
      const titleEl = document.querySelector('#activity-name') || document.querySelector('.rich_media_title');
      if (titleEl) {
        articleData.title = titleEl.textContent.trim();
      }

      // 提取作者
      const authorEl = document.querySelector('#js_name') || document.querySelector('.rich_media_meta_nickname');
      if (authorEl) {
        articleData.author = authorEl.textContent.trim();
      }

      // 提取发布时间
      const timeEl = document.querySelector('#publish_time') || document.querySelector('.rich_media_meta_text');
      if (timeEl) {
        articleData.publishTime = timeEl.textContent.trim();
      }

      // 提取正文内容
      const contentEl = document.querySelector('#js_content') || document.querySelector('.rich_media_content');
      if (!contentEl) {
        sendResponse({ 
          success: false, 
          error: '未找到文章正文，请确认当前页面是公众号文章页面' 
        });
        return;
      }

      // 克隆内容元素
      const clonedContent = contentEl.cloneNode(true);

      // 移除不需要的元素
      const selectorsToRemove = [
        'img', 'video', 'audio', 'iframe', 'script', 'style',
        '.js_sponsor_ad_area', '.qr_code_pc', '.profile_container',
        '.rich_media_tool', '.share_notice',
        '[style*="display:none"]', '[style*="display: none"]'
      ];

      selectorsToRemove.forEach(selector => {
        clonedContent.querySelectorAll(selector).forEach(el => el.remove());
      });

      // 提取文本内容
      articleData.content = extractTextWithStructure(clonedContent);
      articleData.content = normalizeWhitespace(articleData.content);

      // 提取链接
      const links = extractLinks(contentEl);

      sendResponse({
        success: true,
        data: {
          article: articleData,
          links: links
        }
      });
    } catch (error) {
      console.error('提取文章失败:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  return true; // 保持消息通道开启
});

// 提取文本并保留结构
function extractTextWithStructure(element) {
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
      
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        const level = parseInt(tagName[1]);
        const headingText = node.textContent.trim();
        if (headingText) {
          text += '\n' + '#'.repeat(level) + ' ' + headingText + '\n\n';
        }
      } else if (tagName === 'p' || tagName === 'div') {
        const content = extractTextWithStructure(node);
        if (content.trim()) {
          text += content + '\n\n';
        }
      } else if (tagName === 'br') {
        text += '\n';
      } else if (tagName === 'strong' || tagName === 'b') {
        const content = node.textContent.trim();
        if (content) {
          text += '**' + content + '** ';
        }
      } else if (tagName === 'em' || tagName === 'i') {
        const content = node.textContent.trim();
        if (content) {
          text += '*' + content + '* ';
        }
      } else {
        text += extractTextWithStructure(node);
      }
    }
  }

  return text;
}

// 清理多余空白
function normalizeWhitespace(text) {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ +/g, ' ')
    .trim();
}

// 提取链接
function extractLinks(contentEl) {
  const links = [];
  const anchorElements = contentEl.querySelectorAll('a');
  
  anchorElements.forEach(anchor => {
    const href = anchor.getAttribute('href');
    const text = anchor.textContent.trim();

    if (isValidLink(href) && text) {
      links.push({ text, url: href });
    }
  });

  return deduplicateLinks(links);
}

// 验证链接
function isValidLink(href) {
  if (!href) return false;
  const invalidPatterns = [
    /^#/, /^javascript:/i, /^mailto:/i, /^tel:/i, /^about:/i
  ];
  return !invalidPatterns.some(pattern => pattern.test(href));
}

// 去重链接
function deduplicateLinks(links) {
  const seen = new Set();
  const uniqueLinks = [];
  links.forEach(link => {
    if (!seen.has(link.url)) {
      seen.add(link.url);
      uniqueLinks.push(link);
    }
  });
  return uniqueLinks;
}
