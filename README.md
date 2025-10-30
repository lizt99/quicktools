# Prompt Tester

运行步骤：

1. 创建配置文件 `.env`：

```bash
# 在项目根目录创建 .env 文件
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
echo "PORT=3001" >> .env
```

2. 安装并启动：

```bash
npm install
npm start
```

3. 打开浏览器访问：`http://localhost:3001`

说明：
- 左侧五区：SERVICE_CONTEXT、prompt 模版、title、正文、测试按钮/模型选择。
- 模版占位符：`{{agent_setting_query}}`、`{{post_title}}`、`{{post_selftext}}`。
- 点击测试后，后端替换占位符并调用 OpenAI，右侧显示结果。
