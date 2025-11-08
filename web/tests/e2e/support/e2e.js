// 导入自定义命令
import './commands';

// 设置全局错误处理
Cypress.on('uncaught:exception', (err, runnable) => {
  // 忽略某些已知的错误
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});

