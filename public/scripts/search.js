// 搜索功能实现
// 使用 Pagefind 实现客户端搜索

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
  const searchToggle = document.getElementById('search-toggle');
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchClose = document.getElementById('search-close');

  // 初始化 Pagefind
  let pagefind = null;
  
  // 动态加载 Pagefind
  async function loadPagefind() {
    if (!pagefind) {
      try {
        pagefind = await import('/pagefind/pagefind.js');
      } catch (e) {
        console.error('无法加载 Pagefind:', e);
        return null;
      }
    }
    return pagefind;
  }

  // 打开搜索框
  async function openSearch() {
    searchModal.classList.add('open');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchInput.focus();
    
    // 加载 Pagefind
    await loadPagefind();
  }

  // 关闭搜索框
  function closeSearch() {
    searchModal.classList.remove('open');
    searchInput.value = '';
    searchResults.innerHTML = '';
  }

  // 执行搜索
  async function performSearch(query) {
    if (!query) {
      searchResults.innerHTML = '';
      return;
    }

    const pagefindInstance = await loadPagefind();
    if (!pagefindInstance) {
      searchResults.innerHTML = '<div class="search-error">搜索功能加载失败</div>';
      return;
    }

    try {
      const results = await pagefindInstance.search(query);
      displayResults(results.results);
    } catch (e) {
      console.error('搜索出错:', e);
      searchResults.innerHTML = '<div class="search-error">搜索出错，请稍后重试</div>';
    }
  }

  // 显示搜索结果
  async function displayResults(results) {
    if (!results || results.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">未找到相关内容</div>';
      return;
    }

    const pagefindInstance = await loadPagefind();
    const html = [];

    for (const result of results) {
      try {
        const data = await pagefindInstance.preview(result);
        const url = result.url.replace(/\/$/, ''); // 移除末尾斜杠
        html.push(`
          <div class="search-result-item">
            <h3><a href="${url}">${data.title}</a></h3>
            <p class="search-excerpt">${data.excerpt}</p>
          </div>
        `);
      } catch (e) {
        console.error('获取搜索结果详情出错:', e);
      }
    }

    searchResults.innerHTML = html.join('');
  }

  // 事件监听
  searchToggle.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  
  // 点击遮罩层关闭
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) {
      closeSearch();
    }
  });

  // 输入框输入事件
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query) {
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 300); // 300ms 防抖
    } else {
      searchResults.innerHTML = '';
    }
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K 打开搜索
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (!searchModal.classList.contains('open')) {
        openSearch();
      } else {
        closeSearch();
      }
    }
    
    // ESC 关闭搜索
    if (e.key === 'Escape' && searchModal.classList.contains('open')) {
      closeSearch();
    }
  });
});