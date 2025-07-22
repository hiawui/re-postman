// 监听插件图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 创建新标签页打开插件页面
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});

// 插件安装时的处理
chrome.runtime.onInstalled.addListener(() => {
  console.log('RePostman extension installed');
}); 