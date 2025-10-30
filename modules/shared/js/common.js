// 共享的JavaScript功能

// 通用工具函数
const Utils = {
  // 保存数据到localStorage
  saveToStorage: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  // 从localStorage加载数据
  loadFromStorage: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return defaultValue;
    }
  },

  // 格式化时间
  formatTime: (date = new Date()) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  // 防抖函数
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 节流函数
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// 通用API调用函数
const API = {
  // 发送POST请求
  post: async (url, data) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  // 发送GET请求
  get: async (url) => {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  }
};

// 通用UI组件
const UI = {
  // 显示状态消息
  showStatus: (element, message, type = 'info') => {
    if (!element) return;
    
    element.textContent = message;
    element.className = `text-sm mt-1 ${
      type === 'success' ? 'text-green-600' :
      type === 'error' ? 'text-red-600' :
      type === 'warning' ? 'text-yellow-600' :
      'text-blue-600'
    }`;
  },

  // 显示结果
  showResult: (element, content, type = 'success') => {
    if (!element) return;
    
    element.textContent = content;
    element.className = `flex-1 border rounded p-3 text-sm overflow-auto whitespace-pre-wrap ${
      type === 'success' ? 'bg-green-50 border-green-200' :
      type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
      'bg-gray-50 border-gray-200'
    }`;
  },

  // 设置按钮状态
  setButtonState: (button, isLoading, loadingText = '加载中...', normalText = '提交') => {
    if (!button) return;
    
    button.disabled = isLoading;
    button.innerHTML = isLoading ? 
      `<span>⏳</span><span>${loadingText}</span>` : 
      `<span>🚀</span><span>${normalText}</span>`;
  },

  // 添加键盘快捷键支持
  addKeyboardShortcut: (key, callback, ctrlKey = true) => {
    document.addEventListener('keydown', (e) => {
      if (e.key === key && (!ctrlKey || e.ctrlKey)) {
        e.preventDefault();
        callback();
      }
    });
  }
};

// 导出到全局作用域
window.Utils = Utils;
window.API = API;
window.UI = UI;
