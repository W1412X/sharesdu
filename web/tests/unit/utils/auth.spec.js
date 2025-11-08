/**
 * 认证工具函数单元测试
 */
import { setLogin } from '@/utils/auth';
import { setCookie } from '@/utils/cookie';
import { selfDefineLocalStorage } from '@/utils/localStorage';

// Mock 依赖
jest.mock('@/utils/cookie', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  clearTokenCookies: jest.fn()
}));

jest.mock('@/utils/localStorage', () => ({
  selfDefineLocalStorage: {
    setItem: jest.fn(),
    removeItem: jest.fn()
  }
}));

jest.mock('@/utils/navigation', () => ({
  openPage: jest.fn()
}));

jest.mock('@/main', () => ({
  globalProperties: {
    $themeColor: '#9c0c13'
  }
}));

describe('auth.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setLogin', () => {
    test('应该正确设置所有登录相关的cookie', () => {
      setLogin('testuser', '123', 'test@example.com', 'refresh', 'profile', false, false);
      
      expect(setCookie).toHaveBeenCalledWith('userName', 'testuser', 7 * 24);
      expect(setCookie).toHaveBeenCalledWith('userId', '123', 7 * 24);
      expect(setCookie).toHaveBeenCalledWith('email', 'test@example.com', 7 * 24);
      expect(setCookie).toHaveBeenCalledWith('refreshToken', 'refresh', 7 * 24);
      expect(setCookie).toHaveBeenCalledWith('userProfileUrl', 'profile', 7 * 24);
    });

    test('应该设置master cookie当ifMaster为true时', () => {
      setLogin('testuser', '123', 'test@example.com', 'refresh', 'profile', true, false);
      
      expect(setCookie).toHaveBeenCalledWith('ifMaster', true, 7 * 24);
    });

    test('应该设置superMaster cookie当ifSuperMaster为true时', () => {
      setLogin('testuser', '123', 'test@example.com', 'refresh', 'profile', false, true);
      
      expect(setCookie).toHaveBeenCalledWith('ifSuperMaster', true, 7 * 24);
    });

    test('应该保存密码到localStorage当passwd提供时', () => {
      setLogin('testuser', '123', 'test@example.com', 'refresh', 'profile', false, false, 'password123');
      
      expect(selfDefineLocalStorage.setItem).toHaveBeenCalledWith('passwd', 'password123');
      expect(selfDefineLocalStorage.setItem).toHaveBeenCalledWith('userName', 'testuser');
    });

    test('不应该保存密码当passwd未提供时', () => {
      setLogin('testuser', '123', 'test@example.com', 'refresh', 'profile', false, false);
      
      expect(selfDefineLocalStorage.setItem).not.toHaveBeenCalledWith('passwd', expect.anything());
    });
  });
});

