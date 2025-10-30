const urlEl = document.getElementById('url');
const headersEl = document.getElementById('headers');
const bodyEl = document.getElementById('body');
const methodEl = document.getElementById('method');
const runBtn = document.getElementById('runBtn');
const resultEl = document.getElementById('result');
const statusEl = document.getElementById('status');

// Storage keys
const STORAGE_KEYS = {
  url: 'apiTester_url',
  headers: 'apiTester_headers',
  body: 'apiTester_body',
  method: 'apiTester_method',
  lastResult: 'apiTester_lastResult',
  lastStatus: 'apiTester_lastStatus'
};

// Save data to localStorage
function saveToStorage() {
  const data = {
    url: urlEl.value,
    headers: headersEl.value,
    body: bodyEl.value,
    method: methodEl.value
  };
  
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(STORAGE_KEYS[key], value);
  });
}

// Load data from localStorage
function loadFromStorage() {
  const data = {
    url: localStorage.getItem(STORAGE_KEYS.url) || '',
    headers: localStorage.getItem(STORAGE_KEYS.headers) || '',
    body: localStorage.getItem(STORAGE_KEYS.body) || '',
    method: localStorage.getItem(STORAGE_KEYS.method) || 'GET'
  };
  
  // Apply loaded data
  urlEl.value = data.url;
  headersEl.value = data.headers;
  bodyEl.value = data.body;
  methodEl.value = data.method;
  
  // Load last result if exists
  const lastResult = localStorage.getItem(STORAGE_KEYS.lastResult);
  const lastStatus = localStorage.getItem(STORAGE_KEYS.lastStatus);
  
  if (lastResult) {
    resultEl.textContent = lastResult;
    resultEl.className = 'flex-1 border rounded p-3 text-sm bg-gray-50 overflow-auto whitespace-pre-wrap';
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
    UI.setButtonState(runBtn, true, '发送中...', '发送请求');
    UI.showStatus(statusEl, '正在发送请求...', 'info');
    resultEl.textContent = '';
    resultEl.className = 'flex-1 border rounded p-3 text-sm bg-gray-50 overflow-auto whitespace-pre-wrap';

    const url = urlEl.value.trim();
    if (!url) {
      throw new Error('请输入API URL');
    }

    const method = methodEl.value;
    let headers = {};
    let body = null;

    // Parse headers
    if (headersEl.value.trim()) {
      try {
        headers = JSON.parse(headersEl.value);
      } catch (e) {
        throw new Error('请求头格式错误，请输入有效的JSON');
      }
    }

    // Parse body for POST/PUT requests
    if ((method === 'POST' || method === 'PUT') && bodyEl.value.trim()) {
      try {
        body = JSON.parse(bodyEl.value);
      } catch (e) {
        throw new Error('请求体格式错误，请输入有效的JSON');
      }
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData
    };

    const formattedResult = `状态码: ${result.status} ${result.statusText}\n\n响应头:\n${JSON.stringify(result.headers, null, 2)}\n\n响应数据:\n${JSON.stringify(result.data, null, 2)}`;
    
    UI.showResult(resultEl, formattedResult, response.ok ? 'success' : 'error');
    UI.showStatus(statusEl, response.ok ? '✅ 请求成功' : '❌ 请求失败', response.ok ? 'success' : 'error');
    
    // Save result to localStorage
    saveResult(formattedResult, response.ok ? '✅ 请求成功' : '❌ 请求失败');
  } catch (e) {
    UI.showStatus(statusEl, '❌ 请求失败', 'error');
    UI.showResult(resultEl, `Error: ${e.message}`, 'error');
    
    // Save error result to localStorage
    saveResult(`Error: ${e.message}`, '❌ 请求失败');
  } finally {
    UI.setButtonState(runBtn, false, '发送中...', '发送请求');
  }
}

runBtn.addEventListener('click', runTest);

// Add keyboard shortcuts
UI.addKeyboardShortcut('Enter', runTest);

// Add event listeners for real-time saving
[urlEl, headersEl, bodyEl, methodEl].forEach(element => {
  element.addEventListener('input', saveToStorage);
  element.addEventListener('change', saveToStorage);
});

// Initialize the app
function initializeApp() {
  // Try to load saved data first
  loadFromStorage();
  
  // If no saved data, use default values
  if (!localStorage.getItem(STORAGE_KEYS.url)) {
    urlEl.value = 'https://jsonplaceholder.typicode.com/posts/1';
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.headers)) {
    headersEl.value = '{\n  "Content-Type": "application/json"\n}';
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.body)) {
    bodyEl.value = '{\n  "title": "Test Post",\n  "body": "This is a test post",\n  "userId": 1\n}';
  }
  
  // Save initial data if it's the first time
  saveToStorage();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
