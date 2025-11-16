# 开发日志 - LeapRead

## 项目概述
LeapRead - 一个Chrome扩展，用于智能总结公众号文章内容并提取外部链接。像青蛙跳跃一样快速获取文章精华。

## 技术栈
- Chrome Extension Manifest V3
- JavaScript (原生，无框架)
- HTML/CSS
- Chrome Storage API
- Chrome Tabs API
- Chrome Runtime Messaging API

## 项目结构
```
article_dry/
├── manifest.json              # Chrome扩展配置文件 (Manifest V3)
├── popup/                     # 插件弹窗UI
│   ├── popup.html            # 弹窗页面
│   ├── popup.js              # 弹窗逻辑
│   └── popup.css             # 弹窗样式
├── options/                   # 设置页面
│   ├── options.html          # 设置页面UI
│   ├── options.js            # 设置页面逻辑
│   └── options.css           # 设置页面样式
├── content/                   # 内容脚本
│   └── content.js            # 注入到公众号页面的脚本
├── background/                # 后台服务
│   └── background.js         # Service Worker
├── modules/                   # 核心功能模块
│   ├── htmlCleaner.js        # HTML清洗模块
│   ├── linkExtractor.js      # 链接提取模块
│   └── aiService.js          # AI服务模块
├── utils/                     # 工具函数
│   └── storage.js            # 存储管理
├── prompts/                   # Prompt文件
│   └── default_summary_prompt.md  # 默认总结Prompt
└── icons/                     # 插件图标 (待添加)
```

## 开发进度

### Phase 1: 基础框架搭建 ✅
- [x] 创建 manifest.json (Manifest V3规范)
- [x] 设置content script注入规则 (匹配 `*://mp.weixin.qq.com/s/*`)
- [x] 配置必要的permissions和host_permissions
- [x] 创建基础文件结构

### Phase 2: 核心功能模块开发 ✅
- [x] **HTML清洗模块** (`modules/htmlCleaner.js`)
  - 定位公众号文章DOM元素 (`#js_content`, `.rich_media_content`)
  - 提取标题、作者、发布时间
  - 去除图片、视频、广告等非文本元素
  - 保留文本结构和基本格式标记
  - 清理多余空白字符

- [x] **链接提取模块** (`modules/linkExtractor.js`)
  - 遍历文章中所有`<a>`标签
  - 提取链接文案和URL
  - 过滤内部锚点、JavaScript伪链接
  - 链接去重

- [x] **AI服务模块** (`modules/aiService.js`)
  - 封装HTTP请求逻辑
  - 支持OpenAI兼容的API格式
  - 构建消息结构（system + user）
  - 错误处理和异常捕获
  - Token估算功能

- [x] **存储管理模块** (`utils/storage.js`)
  - 配置的读取和保存
  - Prompt的读取和保存
  - 默认配置管理

### Phase 3: 用户界面开发 ✅
- [x] **Content Script** (`content/content.js`)
  - 监听来自popup的消息
  - 在页面DOM中提取文章内容和链接
  - 将结果返回给popup

- [x] **Background Service Worker** (`background/background.js`)
  - 插件安装时初始化默认配置
  - 处理AI API调用（跨域请求）
  - 消息中转和错误处理

- [x] **Popup界面** (`popup/`)
  - 四个视图状态：初始、加载中、结果、错误
  - 开始总结按钮
  - 加载动画和状态提示
  - Markdown格式总结展示
  - 链接列表展示（可点击）
  - 复制总结功能
  - 错误提示和重试

- [x] **设置页面** (`options/`)
  - API配置表单 (Endpoint, API Key, Model)
  - Prompt编辑器
  - 从本地文件加载Prompt
  - 恢复默认Prompt
  - 表单验证
  - 配置保存和状态提示

### Phase 4: 数据流集成 ✅
- [x] Popup与Content Script消息通信
- [x] Popup与Background Service Worker消息通信
- [x] Chrome Storage API集成
- [x] 完整数据流实现：
  1. 用户点击"开始总结" → Popup
  2. Popup发送消息到Content Script → 提取文章和链接
  3. Popup获取配置和Prompt → Chrome Storage
  4. Popup发送消息到Background → 调用AI API
  5. Background返回总结结果 → Popup
  6. Popup渲染结果展示

### Phase 5: 测试与优化 (进行中)
- [x] 创建图标文件夹和说明文档
- [x] 提供SVG模板和图标创建指南
- [ ] 添加PNG图标文件（16x16, 48x48, 128x128）
- [ ] 在真实公众号文章页面测试
- [ ] 测试不同大模型API兼容性
- [ ] 测试自定义Prompt加载
- [ ] 错误场景测试
- [ ] 性能优化
- [ ] 代码审查和重构

## 关键技术实现

### 1. Manifest V3规范
使用Service Worker替代Background Page，符合最新Chrome扩展规范。

### 2. 消息通信
- `chrome.tabs.sendMessage`: Popup → Content Script
- `chrome.runtime.sendMessage`: Popup/Content → Background
- `chrome.runtime.onMessage`: 监听消息

### 3. 跨域请求处理
通过Background Service Worker发起API请求，避免Content Script的跨域限制。

### 4. 存储方案
使用`chrome.storage.local`存储配置和自定义Prompt，数据仅保存在本地。

### 5. DOM操作
使用标准DOM API提取公众号文章内容，支持多种DOM结构变体。

## 核心功能完成情况
✅ 所有核心功能已完成开发
✅ 用户界面已完成
✅ 数据流已完全打通
✅ 配置管理已实现
✅ 开发文档已完善

## 待完成事项（测试阶段）
1. **图标资源**：已提供SVG模板和创建指南，需要生成PNG文件
2. **实际测试**：在真实公众号文章页面测试各项功能
3. **兼容性测试**：测试不同大模型API的兼容性
4. **错误处理优化**：增强各种边缘情况的处理
5. **性能优化**：
   - 长文章的Token限制处理（可能需要分段或截断）
   - 大量链接的渲染优化
6. **用户体验优化**（可选）：
   - 快捷键支持
   - 导出功能（导出总结为文件）
   - 历史记录功能

## 已知问题
- 图标文件需要PNG格式，当前仅提供SVG模板和创建指南
- 需要用户自行配置API Key才能使用（这是设计要求）

## 注意事项
1. API Key敏感信息仅存储在本地
2. 需要用户自行配置API Key才能使用
3. 跨域API请求通过Background处理
4. 公众号DOM结构可能变化，需保持选择器的鲁棒性

## 文件清单
```
article_dry/
├── manifest.json                          # Chrome扩展配置 ✅
├── README.md                              # 项目说明文档 ✅
├── prd.md                                 # 产品需求文档
├── .cursor/rules/
│   ├── projectrule.mdc                   # 项目规则
│   └── development_log.md                # 开发日志 ✅
├── background/
│   └── background.js                      # Service Worker ✅
├── content/
│   └── content.js                         # 内容脚本 ✅
├── popup/
│   ├── popup.html                         # 弹窗页面 ✅
│   ├── popup.js                           # 弹窗逻辑 ✅
│   └── popup.css                          # 弹窗样式 ✅
├── options/
│   ├── options.html                       # 设置页面 ✅
│   ├── options.js                         # 设置逻辑 ✅
│   └── options.css                        # 设置样式 ✅
├── modules/
│   ├── htmlCleaner.js                     # HTML清洗模块 ✅
│   ├── linkExtractor.js                   # 链接提取模块 ✅
│   └── aiService.js                       # AI服务模块 ✅
├── utils/
│   └── storage.js                         # 存储管理 ✅
├── prompts/
│   └── default_summary_prompt.md         # 默认Prompt ✅
└── icons/
    ├── icon.svg                           # SVG模板 ✅
    ├── HOW_TO_ADD_ICONS.md               # 图标创建指南 ✅
    ├── icon16.png                         # 16x16图标 ⏳
    ├── icon48.png                         # 48x48图标 ⏳
    └── icon128.png                        # 128x128图标 ⏳
```

## 更新日志
- **2024-11-15**: 完成Phase 1-4的所有开发工作，核心功能完整实现
- **2024-11-15**: 创建项目文档、开发日志和使用说明
- **2024-11-15**: 创建项目并建立基础架构

---
*本日志记录插件开发的全过程，供团队成员参考*
