// 链接提取模块
const LinkExtractor = {
  // 从文档中提取所有外部链接
  extractLinks(doc = document) {
    try {
      const links = [];
      const contentEl = doc.querySelector('#js_content') || doc.querySelector('.rich_media_content');
      
      if (!contentEl) {
        console.warn('未找到文章内容区域');
        return links;
      }

      // 获取所有<a>标签
      const anchorElements = contentEl.querySelectorAll('a');
      
      anchorElements.forEach(anchor => {
        const href = anchor.getAttribute('href');
        const text = anchor.textContent.trim();

        // 过滤无效链接
        if (this.isValidLink(href) && text) {
          links.push({
            text: text,
            url: href
          });
        }
      });

      // 去重（基于URL）
      return this.deduplicateLinks(links);
    } catch (error) {
      console.error('链接提取失败:', error);
      return [];
    }
  },

  // 验证链接是否有效
  isValidLink(href) {
    if (!href) return false;
    
    // 过滤掉的链接类型
    const invalidPatterns = [
      /^#/,                          // 锚点链接
      /^javascript:/i,               // JavaScript伪链接
      /^mailto:/i,                   // 邮件链接
      /^tel:/i,                      // 电话链接
      /^about:/i                     // about页面
    ];

    return !invalidPatterns.some(pattern => pattern.test(href));
  },

  // 去重链接
  deduplicateLinks(links) {
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
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LinkExtractor;
}
