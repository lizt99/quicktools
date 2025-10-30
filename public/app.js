const serviceContextEl = document.getElementById('serviceContext');
const promptTemplateEl = document.getElementById('promptTemplate');
const postTitleEl = document.getElementById('postTitle');
const postBodyEl = document.getElementById('postBody');
const runBtn = document.getElementById('runBtn');
const resultEl = document.getElementById('result');
const statusEl = document.getElementById('status');
const modelEl = document.getElementById('model');

// Storage keys
const STORAGE_KEYS = {
  serviceContext: 'promptTester_serviceContext',
  promptTemplate: 'promptTester_promptTemplate',
  postTitle: 'promptTester_postTitle',
  postBody: 'promptTester_postBody',
  model: 'promptTester_model',
  lastResult: 'promptTester_lastResult',
  lastStatus: 'promptTester_lastStatus'
};

// Save data to localStorage
function saveToStorage() {
  const data = {
    serviceContext: serviceContextEl.value,
    promptTemplate: promptTemplateEl.value,
    postTitle: postTitleEl.value,
    postBody: postBodyEl.value,
    model: modelEl.value
  };
  
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(STORAGE_KEYS[key], value);
  });
}

// Load data from localStorage
function loadFromStorage() {
  const data = {
    serviceContext: localStorage.getItem(STORAGE_KEYS.serviceContext) || '',
    promptTemplate: localStorage.getItem(STORAGE_KEYS.promptTemplate) || '',
    postTitle: localStorage.getItem(STORAGE_KEYS.postTitle) || '',
    postBody: localStorage.getItem(STORAGE_KEYS.postBody) || '',
    model: localStorage.getItem(STORAGE_KEYS.model) || 'gpt-4o-mini'
  };
  
  // Apply loaded data
  serviceContextEl.value = data.serviceContext;
  promptTemplateEl.value = data.promptTemplate;
  postTitleEl.value = data.postTitle;
  postBodyEl.value = data.postBody;
  modelEl.value = data.model;
  
  // Load last result if exists
  const lastResult = localStorage.getItem(STORAGE_KEYS.lastResult);
  const lastStatus = localStorage.getItem(STORAGE_KEYS.lastStatus);
  
  if (lastResult) {
    resultEl.textContent = lastResult;
    resultEl.className = 'w-full h-full bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto font-mono text-sm text-gray-800 whitespace-pre-wrap';
  }
  
  if (lastStatus) {
    statusEl.textContent = lastStatus;
    statusEl.className = 'text-sm text-gray-600 mt-1';
  }
}

// Save result to localStorage
function saveResult(result, status) {
  localStorage.setItem(STORAGE_KEYS.lastResult, result);
  localStorage.setItem(STORAGE_KEYS.lastStatus, status);
}

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
    
    // Save result to localStorage
    saveResult(json.result || '', '✅ 测试完成');
  } catch (e) {
    statusEl.textContent = '❌ 请求失败';
    statusEl.className = 'text-sm text-red-600 mt-1';
    resultEl.textContent = `Error: ${e.message}`;
    resultEl.className = 'w-full h-full bg-red-50 border border-red-200 rounded-lg p-4 overflow-auto font-mono text-sm text-red-800 whitespace-pre-wrap';
    
    // Save error result to localStorage
    saveResult(`Error: ${e.message}`, '❌ 请求失败');
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

// Add event listeners for real-time saving
[serviceContextEl, promptTemplateEl, postTitleEl, postBodyEl, modelEl].forEach(element => {
  element.addEventListener('input', saveToStorage);
  element.addEventListener('change', saveToStorage);
});

// Initialize the app
function initializeApp() {
  // Try to load saved data first
  loadFromStorage();
  
  // If no saved data, use default values
  if (!localStorage.getItem(STORAGE_KEYS.promptTemplate)) {
    promptTemplateEl.value = `请基于以下服务上下文和帖子内容进行分析：\n\nSERVICE_CONTEXT: {{agent_setting_query}}\n\n标题: {{post_title}}\n正文: {{post_selftext}}`;
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.serviceContext)) {
    serviceContextEl.value = `你是一个专业的 Reddit 内容分析师，擅长分析帖子的情感倾向、话题分类和用户互动模式。`;
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.postTitle)) {
    postTitleEl.value = `What's your favorite programming language and why?`;
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.postBody)) {
    postBodyEl.value = `I've been coding for 5 years and have tried many languages. Recently I've been working with Python and JavaScript, but I'm curious about what others prefer and their reasoning behind it.`;
  }
  
  // Save initial data if it's the first time
  saveToStorage();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);


