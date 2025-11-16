# LeapRead 🐸

> Leap through articles with AI-powered summaries - Your smart reading companion for WeChat articles

**一键跳读，智能总结。像青蛙跳跃一样快速获取文章精华。**

[![Chrome](https://img.shields.io/badge/Chrome-114%2B-green.svg)](https://www.google.com/chrome/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ 功能特性

- 🤖 **AI智能总结** - 使用大语言模型生成结构化Markdown格式总结
- 🔗 **链接提取** - 自动识别并提取文章中的所有外部链接
- 📌 **侧边栏模式** - 固定显示，切换页面时状态保持
- 📋 **格式保留** - 复制时保持Markdown原格式（粗体、斜体、列表）
- ⚙️ **高度可配置** - 支持自定义API、模型和Prompt
- 🔒 **隐私安全** - 所有处理在本地完成，数据不上传

## 🚀 快速开始

### 安装

1. **克隆项目**
   ```bash
   git clone https://github.com/yinzm/leapread.git
   cd leapread
   ```

2. **准备图标**（可选）
   ```bash
   cd icons
   # 替换 icon16.png
   # 替换 icon48.png
   # 替换 icon128.png
   ```

3. **安装到Chrome**
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目目录

4. **配置API**
   - 右键插件图标 → 选项
   - 填入API配置（推荐使用SiliconFlow）
   - 保存设置

### 使用

1. 打开任意微信公众号文章页面
2. 点击浏览器工具栏的插件图标
3. 侧边栏打开后，点击"开始总结"
4. 查看AI生成的总结和提取的链接

## ⚙️ 配置

### API配置

支持所有兼容OpenAI格式的API：

| 服务商 | Endpoint | 推荐模型 |
|--------|----------|---------|
| SiliconFlow | `https://api.siliconflow.cn/v1/chat/completions` | `zai-org/GLM-4.6` |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `gpt-4o-mini` |

### Prompt自定义

- 内置默认Prompt模板
- 支持上传自定义`.txt`或`.md`文件
- 可在设置页面实时编辑

## 🏗️ 技术架构

### 技术栈

- **Chrome Extension Manifest V3**
- **原生JavaScript** (无框架依赖)
- **Chrome APIs**: Side Panel, Storage, Tabs, Runtime

### 项目结构

```
article_dry/
├── manifest.json           # 扩展配置
├── background/            # Service Worker
├── content/               # 内容脚本
├── popup/                 # 侧边栏UI
├── options/               # 设置页面
├── modules/               # 核心功能模块
│   ├── htmlCleaner.js    # HTML清洗
│   ├── linkExtractor.js  # 链接提取
│   └── aiService.js      # AI交互
├── utils/                 # 工具函数
└── prompts/              # Prompt模板
```

### 核心模块

- **HTML Cleaner** - 提取公众号文章纯文本内容
- **Link Extractor** - 识别并提取外部链接
- **AI Service** - 封装AI API调用逻辑
- **Storage Manager** - 配置和数据管理

## 📋 系统要求

- **Chrome浏览器**: 114+ (推荐 120+)
- **操作系统**: Windows / macOS / Linux
- **网络**: 需要访问AI API服务

## 🐛 常见问题

<details>
<summary><b>点击图标没反应？</b></summary>

- 确认Chrome版本 >= 114
- 在 `chrome://extensions/` 重新加载插件
- 检查Service Worker是否有错误
</details>

<details>
<summary><b>API调用失败？</b></summary>

- 检查API Key是否正确
- 验证API Endpoint是否可访问
- 确认网络连接正常
- 查看控制台详细错误信息
</details>

<details>
<summary><b>文章内容提取不完整？</b></summary>

- 刷新公众号文章页面后重试
- 确认在 `mp.weixin.qq.com/s/` 域名下
- 检查浏览器控制台是否有错误
</details>

## 🔧 开发

### 调试

- **Popup**: 右键插件图标 → 检查
- **Content Script**: 在文章页面按F12
- **Background**: `chrome://extensions/` → Service Worker

### 文档

- 产品需求: `prd.md`
- 开发日志: `.cursor/rules/development_log.md`
- 项目规则: `.cursor/rules/projectrule.mdc`

## 📝 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**⭐ 如果这个项目对你有帮助，请给个Star！**
