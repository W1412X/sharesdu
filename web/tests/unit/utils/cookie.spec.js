/**
 * Cookie 工具函数单元测试
 */
import { getCookie, setCookie, clearCookie, clearTokenCookies, unicodeToHex, hexToUnicode } from '@/utils/cookie';

// 模拟 localStorage
jest.mock('@/utils/localStorage', () => ({
  selfDefineLocalStorage: {
    removeItem: jest.fn()
  }
}));

describe('cookie.js', () => {
  beforeEach(() => {
    // 清空 cookie
    document.cookie = '';
  });

  describe('setCookie', () => {
    test('应该正确设置cookie', () => {
      setCookie('test', 'value', 1);
      expect(document.cookie).toContain('test=');
    });

    test('应该处理空值并设置过期时间', () => {
      setCookie('test', '', 1);
      expect(document.cookie).toContain('test=');
    });

    test('应该使用默认过期时间', () => {
      setCookie('test', 'value');
      expect(document.cookie).toContain('test=');
    });

    test('应该对非token类型的值进行Unicode编码', () => {
      setCookie('userName', '测试用户', 1);
      expect(document.cookie).toContain('userName=');
    });
  });

  describe('getCookie', () => {
    test('应该正确获取cookie值', () => {
      document.cookie = 'test=value';
      const value = getCookie('test');
      expect(value).toBe('value');
    });

    test('应该对非token类型的值进行Unicode解码', () => {
      const encoded = unicodeToHex('测试');
      document.cookie = `userName=${encoded}`;
      const value = getCookie('userName');
      expect(value).toBe('测试');
    });

    test('应该返回null当cookie不存在时', () => {
      const value = getCookie('nonexistent');
      expect(value).toBeNull();
    });
  });

  describe('clearCookie', () => {
    test('应该清除指定的cookie', () => {
      setCookie('test', 'value', 1);
      clearCookie('test');
      const value = getCookie('test');
      expect(value).toBeNull();
    });
  });

  describe('clearTokenCookies', () => {
    test('应该清除所有token相关的cookie', () => {
      setCookie('accessToken', 'token', 1);
      setCookie('refreshToken', 'refresh', 1);
      setCookie('userId', '123', 1);
      
      clearTokenCookies();
      
      expect(getCookie('accessToken')).toBeNull();
      expect(getCookie('refreshToken')).toBeNull();
      expect(getCookie('userId')).toBeNull();
    });
  });

  describe('unicodeToHex', () => {
    test('应该正确转换Unicode字符串为十六进制', () => {
      const result = unicodeToHex('测试');
      expect(result).toContain('\\u');
    });

    test('应该处理非字符串类型', () => {
      expect(unicodeToHex(null)).toBeNull();
      expect(unicodeToHex(undefined)).toBeUndefined();
      expect(unicodeToHex(123)).toBe(123);
    });
  });

  describe('hexToUnicode', () => {
    test('应该正确转换十六进制为Unicode字符串', () => {
      const hex = unicodeToHex('测试');
      const result = hexToUnicode(hex);
      expect(result).toBe('测试');
    });

    test('应该处理非字符串类型', () => {
      expect(hexToUnicode(null)).toBeNull();
      expect(hexToUnicode(undefined)).toBeUndefined();
    });
  });
});

