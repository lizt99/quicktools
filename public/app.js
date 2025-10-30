const serviceContextEl = document.getElementById('serviceContext');
const promptTemplateEl = document.getElementById('promptTemplate');
const postTitleEl = document.getElementById('postTitle');
const postBodyEl = document.getElementById('postBody');
const runBtn = document.getElementById('runBtn');
const resultEl = document.getElementById('result');
const statusEl = document.getElementById('status');
const modelEl = document.getElementById('model');

async function runTest() {
  try {
    runBtn.disabled = true;
    runBtn.innerHTML = '<span>⏳</span><span>测试中...</span>';
    statusEl.textContent = '正在发送请求到 OpenAI...';
    statusEl.className = 'text-sm text-blue-600 mt-1';
    resultEl.textContent = '';
    resultEl.className = 'w-full h-full bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto font-mono text-sm text-gray-800 whitespace-pre-wrap';

    const payload = {
      serviceContext: serviceContextEl.value,
      promptTemplate: promptTemplateEl.value,
      postTitle: postTitleEl.value,
      postBody: postBodyEl.value,
      model: modelEl.value
    };

    const res = await fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(typeof json.error === 'string' ? json.error : JSON.stringify(json.error));
    }
    
    // Animate result appearance
    resultEl.textContent = json.result || '';
    resultEl.className = 'w-full h-full bg-green-50 border border-green-200 rounded-lg p-4 overflow-auto font-mono text-sm text-gray-800 whitespace-pre-wrap animate-pulse';
    setTimeout(() => {
      resultEl.className = 'w-full h-full bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto font-mono text-sm text-gray-800 whitespace-pre-wrap';
    }, 1000);
    
    statusEl.textContent = '✅ 测试完成';
    statusEl.className = 'text-sm text-green-600 mt-1';
  } catch (e) {
    statusEl.textContent = '❌ 请求失败';
    statusEl.className = 'text-sm text-red-600 mt-1';
    resultEl.textContent = `Error: ${e.message}`;
    resultEl.className = 'w-full h-full bg-red-50 border border-red-200 rounded-lg p-4 overflow-auto font-mono text-sm text-red-800 whitespace-pre-wrap';
  } finally {
    runBtn.disabled = false;
    runBtn.innerHTML = '<span>🚀</span><span>测试 Prompt</span>';
  }
}

runBtn.addEventListener('click', runTest);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    runTest();
  }
});

// Prefill placeholders for quick testing
promptTemplateEl.value = `请基于以下服务上下文和帖子内容进行分析：\n\nSERVICE_CONTEXT: {{agent_setting_query}}\n\n标题: {{post_title}}\n正文: {{post_selftext}}`;

// Add some example data for quick testing
serviceContextEl.value = `你是一个专业的 Reddit 内容分析师，擅长分析帖子的情感倾向、话题分类和用户互动模式。`;
postTitleEl.value = `What's your favorite programming language and why?`;
postBodyEl.value = `I've been coding for 5 years and have tried many languages. Recently I've been working with Python and JavaScript, but I'm curious about what others prefer and their reasoning behind it.`;


