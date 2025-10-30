# 模块化测试工具架构

这个项目已经重构为模块化架构，方便您添加多个不同测试用途的页面。

## 目录结构

```
PromptTester/
├── modules/                    # 所有测试模块
│   ├── shared/                # 共享组件
│   │   ├── css/              # 共享样式
│   │   │   └── common.css
│   │   ├── js/               # 共享JavaScript
│   │   │   └── common.js
│   │   └── components/       # 共享HTML组件
│   │       └── navigation.html
│   ├── prompt-tester/        # Prompt测试模块
│   │   ├── index.html
│   │   └── app.js
│   └── api-tester/          # API测试模块
│       ├── index.html
│       └── app.js
├── server.js                 # 服务器配置
└── package.json
```

## 如何添加新的测试模块

### 1. 创建模块目录
```bash
mkdir -p modules/your-module-name
```

### 2. 创建模块文件
在 `modules/your-module-name/` 目录下创建：
- `index.html` - 页面HTML
- `app.js` - 页面JavaScript逻辑

### 3. 更新导航
在 `modules/shared/components/navigation.html` 中添加新模块的导航链接。

### 4. 更新服务器路由
在 `server.js` 中添加新模块的路由：
```javascript
app.get('/modules/your-module-name/', (req, res) => {
  res.sendFile(path.join(__dirname, 'modules/your-module-name/index.html'));
});
```

## 共享组件使用

### CSS样式
在HTML中引入共享样式：
```html
<link rel="stylesheet" href="/modules/shared/css/common.css">
```

### JavaScript工具
共享的JavaScript工具已全局可用：
- `Utils` - 工具函数（localStorage、防抖等）
- `API` - API调用函数
- `UI` - UI组件函数

### 导航组件
在页面中添加导航：
```html
<nav class="nav-container">
  <div class="nav-content">
    <a href="/modules/prompt-tester/" class="nav-item" data-module="prompt-tester">
      Prompt Tester
    </a>
    <a href="/modules/your-module/" class="nav-item active" data-module="your-module">
      Your Module
    </a>
  </div>
</nav>
```

## 现有模块

### Prompt Tester
- 测试AI Prompt模板
- 支持多种GPT模型
- 本地存储配置

### API Tester
- 测试HTTP API接口
- 支持GET/POST/PUT/DELETE方法
- JSON格式的请求头和请求体

## 开发建议

1. **保持一致性**：使用共享的CSS类和JavaScript工具
2. **模块化**：每个模块应该独立，不依赖其他模块
3. **响应式**：确保页面在不同设备上都能正常显示
4. **本地存储**：使用Utils.saveToStorage和Utils.loadFromStorage保存用户配置
5. **错误处理**：使用UI.showStatus和UI.showResult显示状态和结果

## 启动项目

```bash
npm run dev
```

访问 http://localhost:3000 即可使用所有测试模块。
