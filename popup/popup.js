// Popup脚本
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否支持Side Panel (Chrome 114+)
  checkBrowserSupport();
  // 获取DOM元素
  const views = {
    initial: document.getElementById('initialView'),
    loading: document.getElementById('loadingView'),
    result: document.getElementById('resultView'),
    error: document.getElementById('errorView')
  };

  const buttons = {
    summarize: document.getElementById('summarizeBtn'),
    extractLinks: document.getElementById('extractLinksBtn'),
    settings: document.getElementById('settingsBtn'),
    copy: document.getElementById('copyBtn'),
    copyLinks: document.getElementById('copyLinksBtn'),
    newSummary: document.getElementById('newSummaryBtn'),
    retry: document.getElementById('retryBtn')
  };

  const content = {
    summary: document.getElementById('summaryContent'),
    links: document.getElementById('linksContent'),
    linkCount: document.getElementById('linkCount'),
    errorMessage: document.getElementById('errorMessage'),
    articleTitle: document.getElementById('articleTitle'),
    articleMeta: document.getElementById('articleMeta')
  };

  // 切换视图
  function showView(viewName) {
    Object.values(views).forEach(view => view.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
  }

  // 开始总结
  buttons.summarize.addEventListener('click', async () => {
    await startSummarize();
  });

  // 仅提取链接
  buttons.extractLinks.addEventListener('click', async () => {
    await extractLinksOnly();
  });

  // 重试
  buttons.retry.addEventListener('click', async () => {
    await startSummarize();
  });

  // 重新总结/重新提取
  buttons.newSummary.addEventListener('click', () => {
    showView('initial');
  });

  // 打开设置
  buttons.settings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // 存储原始数据
  let currentSummary = '';
  let currentLinks = [];
  let currentArticle = null;
  let currentMode = 'summarize'; // 'summarize' 或 'extractLinks'

  // 复制总结（保持Markdown格式）
  buttons.copy.addEventListener('click', () => {
    navigator.clipboard.writeText(currentSummary).then(() => {
      buttons.copy.textContent = '✅';
      setTimeout(() => {
        buttons.copy.textContent = '📋';
      }, 2000);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  });

  // 复制所有链接
  buttons.copyLinks.addEventListener('click', () => {
    if (currentLinks.length === 0) {
      return;
    }
    
    // 格式化链接为文本
    const linksText = currentLinks.map((link, index) => 
      `${index + 1}. ${link.text}\n   ${link.url}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(linksText).then(() => {
      const originalText = buttons.copyLinks.textContent;
      buttons.copyLinks.textContent = '✅';
      setTimeout(() => {
        buttons.copyLinks.textContent = originalText;
      }, 2000);
    }).catch(err => {
      console.error('复制链接失败:', err);
    });
  });

  // 主要流程：开始总结
  async function startSummarize() {
    try {
      showView('loading');

      // 1. 检查当前标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url || !tab.url.includes('mp.weixin.qq.com/s')) {
        throw new Error('请在公众号文章页面使用此插件');
      }

      // 2. 获取配置
      const { config } = await chrome.storage.local.get('config');
      if (!config || !config.apiKey) {
        throw new Error('请先在设置中配置API Key');
      }

      // 3. 确保Content Script已加载，然后提取文章内容和链接
      let extractResult;
      try {
        extractResult = await chrome.tabs.sendMessage(tab.id, {
          action: 'extractArticle'
        });
      } catch (error) {
        // 如果Content Script未加载，尝试注入它
        console.log('Content Script未加载，尝试注入...');
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content/content.js']
          });
          
          // 等待一小段时间让script加载
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 重试发送消息
          extractResult = await chrome.tabs.sendMessage(tab.id, {
            action: 'extractArticle'
          });
        } catch (injectError) {
          console.error('注入Content Script失败:', injectError);
          throw new Error('页面初始化失败，请刷新页面后重试');
        }
      }

      if (!extractResult || !extractResult.success) {
        throw new Error(extractResult?.error || '提取文章内容失败');
      }

      const { article, links } = extractResult.data;

      // 4. 获取Prompt
      const { customPrompt } = await chrome.storage.local.get('customPrompt');
      const prompt = customPrompt || config.defaultPrompt;

      // 5. 调用AI进行总结
      const aiResult = await chrome.runtime.sendMessage({
        action: 'callAI',
        data: {
          articleData: article,
          config: config,
          prompt: prompt
        }
      });

      if (!aiResult.success) {
        throw new Error(aiResult.error || 'AI总结失败');
      }

      // 6. 保存原始数据并显示结果
      currentSummary = aiResult.summary;
      currentLinks = links;
      currentArticle = article;
      currentMode = 'summarize';
      displayResults(aiResult.summary, links, article, true);
      showView('result');

    } catch (error) {
      console.error('总结过程出错:', error);
      content.errorMessage.textContent = error.message;
      showView('error');
    }
  }

  // 仅提取链接功能
  async function extractLinksOnly() {
    try {
      showView('loading');

      // 1. 检查当前标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url || !tab.url.includes('mp.weixin.qq.com/s')) {
        throw new Error('请在公众号文章页面使用此插件');
      }

      // 2. 确保Content Script已加载，然后提取文章内容和链接
      let extractResult;
      try {
        extractResult = await chrome.tabs.sendMessage(tab.id, {
          action: 'extractArticle'
        });
      } catch (error) {
        // 如果Content Script未加载，尝试注入它
        console.log('Content Script未加载，尝试注入...');
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content/content.js']
          });
          
          // 等待一小段时间让script加载
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 重试发送消息
          extractResult = await chrome.tabs.sendMessage(tab.id, {
            action: 'extractArticle'
          });
        } catch (injectError) {
          console.error('注入Content Script失败:', injectError);
          throw new Error('页面初始化失败，请刷新页面后重试');
        }
      }

      if (!extractResult || !extractResult.success) {
        throw new Error(extractResult?.error || '提取文章内容失败');
      }

      const { article, links } = extractResult.data;

      // 3. 保存数据并显示结果（无需AI总结）
      currentSummary = '';
      currentLinks = links;
      currentArticle = article;
      currentMode = 'extractLinks';
      displayResults('', links, article, false);  // 传入 false 表示不显示总结
      showView('result');

    } catch (error) {
      console.error('提取链接出错:', error);
      content.errorMessage.textContent = error.message;
      showView('error');
    }
  }

  // 显示结果
  function displayResults(summary, links, article, showSummary = true) {
    // 显示文章标题和元信息
    if (article) {
      content.articleTitle.textContent = article.title || '未知标题';
      
      // 显示作者和发布时间
      const metaItems = [];
      if (article.author) {
        metaItems.push(`<span>👤 ${escapeHtml(article.author)}</span>`);
      }
      if (article.publishTime) {
        metaItems.push(`<span>📅 ${escapeHtml(article.publishTime)}</span>`);
      }
      content.articleMeta.innerHTML = metaItems.join('');
    }

    // 根据参数决定是否显示总结部分
    const summarySection = document.getElementById('summarySection');
    if (showSummary && summary) {
      if (summarySection) {
        summarySection.style.display = 'block';
        content.summary.innerHTML = renderMarkdown(summary);
      }
    } else {
      if (summarySection) {
        summarySection.style.display = 'none';
      }
    }

    // 渲染链接
    if (links && links.length > 0) {
      content.linkCount.textContent = links.length;
      content.links.innerHTML = links.map(link => `
        <div class="link-item">
          <span>🔗</span>
          <a href="${escapeHtml(link.url)}" target="_blank" title="${escapeHtml(link.url)}">
            ${escapeHtml(link.text)}
          </a>
        </div>
      `).join('');
    } else {
      content.linkCount.textContent = '0';
      content.links.innerHTML = '<p class="hint">未找到外部链接</p>';
    }

    // 根据当前模式更新底部按钮文案
    if (currentMode === 'extractLinks') {
      buttons.newSummary.textContent = '重新提取';
    } else {
      buttons.newSummary.textContent = '重新总结';
    }
  }

  // 简单的Markdown渲染
  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // 粗体
      .replace(/\*(.+?)\*/g, '<em>$1</em>')              // 斜体
      .replace(/^- (.+)$/gm, '<li>$1</li>')              // 列表项
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')         // 包装列表
      .replace(/\n\n/g, '<br><br>')                      // 段落
      .replace(/\n/g, '<br>');                           // 换行
  }

  // HTML转义
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 检查浏览器支持
  function checkBrowserSupport() {
    // 获取Chrome版本
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/Chrome\/(\d+)/);
    
    if (match) {
      const version = parseInt(match[1]);
      console.log('Chrome版本:', version);
      
      // Chrome 114+ 才支持 Side Panel
      if (version < 114) {
        console.warn('Chrome版本过低，不支持Side Panel功能');
        // 可以显示一个提示横幅
        showUpgradeNotice(version);
      } else {
        console.log('✅ Chrome版本支持Side Panel');
      }
    }
  }

  // 显示升级提示
  function showUpgradeNotice(currentVersion) {
    const notice = document.createElement('div');
    notice.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fff3cd;
      border-bottom: 2px solid #ffc107;
      padding: 12px 20px;
      text-align: center;
      font-size: 13px;
      color: #856404;
      z-index: 1000;
    `;
    notice.innerHTML = `
      ⚠️ 当前Chrome版本 ${currentVersion} 不支持侧边栏功能，建议升级到 Chrome 114+
      <a href="chrome://settings/help" style="color: #667eea; margin-left: 10px;">点击升级</a>
    `;
    document.body.insertBefore(notice, document.body.firstChild);
  }
});
