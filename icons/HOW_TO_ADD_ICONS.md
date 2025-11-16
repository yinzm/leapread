# 如何添加图标

插件需要三种尺寸的PNG图标文件：

## 需要的文件
- `icon16.png` - 16x16 像素
- `icon48.png` - 48x48 像素
- `icon128.png` - 128x128 像素

## 创建图标的方法

### 方法1: 使用在线工具
1. 访问 https://www.figma.com 或 https://www.canva.com
2. 创建128x128的设计
3. 使用渐变色 (#667eea → #764ba2)
4. 添加"AI"或文档图标
5. 导出为PNG，然后调整尺寸

### 方法2: 使用命令行工具 (如果已安装ImageMagick)
```bash
# 从SVG转换为PNG
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### 方法3: 临时使用占位图标
如果暂时没有图标，可以使用纯色方块作为占位：
1. 创建任意PNG文件
2. 重命名为 icon16.png, icon48.png, icon128.png
3. 放入此文件夹

## 注意
- 必须是PNG格式
- 建议使用透明背景
- 保持设计简洁，在小尺寸下也清晰可见
