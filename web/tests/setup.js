/**
 * Jest 测试环境配置
 */
import { config } from '@vue/test-utils';

// 配置全局属性模拟
config.global.mocks = {
  $themeColor: '#9c0c13',
  $apiUrl: 'https://api.sharesdu.com/index/api',
  $deviceType: 'desktop',
  $imgDict: {
    svg: {
      lazy: '/resource/default_img.svg'
    }
  }
};

// 模拟 window 对象
global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:8080',
    origin: 'http://localhost:8080'
  },
  writable: true
});

// 模拟 document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
});

