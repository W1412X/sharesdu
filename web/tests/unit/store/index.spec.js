/**
 * Vuex Store 单元测试
 */
import store from '@/store/index';

// Mock cookie 工具
const mockGetCookie = jest.fn(() => null);
const mockSetCookie = jest.fn();
const mockClearCookie = jest.fn();

jest.mock('@/utils/cookie', () => ({
  getCookie: () => mockGetCookie(),
  setCookie: mockSetCookie,
  clearCookie: mockClearCookie
}));

jest.mock('@/utils/localStorage', () => ({
  selfDefineLocalStorage: {
    removeItem: jest.fn()
  }
}));

describe('store/index.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCookie.mockReturnValue(null);
    // 重置 store 状态
    store.commit('clearUser');
  });

  test('应该正确初始化store', () => {
    expect(store).toBeDefined();
    expect(store.state).toBeDefined();
    expect(store.state.user).toBeNull();
  });

  test('isLoggedIn getter应该正确判断登录状态', () => {
    expect(store.getters.isLoggedIn).toBe(false);
    
    store.commit('setcookie', 'test-cookie');
    expect(store.getters.isLoggedIn).toBe(true);
  });

  test('setUser mutation应该正确设置用户', () => {
    store.commit('setUser', { id: '123', name: 'test' });
    expect(store.state.user).toEqual({ id: '123', name: 'test' });
  });

  test('clearUser mutation应该清除用户信息', () => {
    store.commit('setUser', { id: '123' });
    store.commit('setcookie', 'test-cookie');
    
    store.commit('clearUser');
    expect(store.state.user).toBeNull();
    expect(store.state.cookie).toBeNull();
  });

  test('storeLogin action应该正确设置登录信息', async () => {
    await store.dispatch('storeLogin', { id: '123', cookie: 'test-cookie' });
    
    expect(store.state.user).toBe('123');
    expect(store.state.cookie).toBe('test-cookie');
  });

  test('storeLogout action应该清除用户信息', async () => {
    await store.dispatch('storeLogin', { id: '123', cookie: 'test-cookie' });
    await store.dispatch('storeLogout');
    
    expect(store.state.user).toBeNull();
    expect(store.state.cookie).toBeNull();
  });

  test('ifRegisterEditor getter应该正确返回状态', () => {
    expect(store.getters.ifRegisterEditor).toBe(false);
    
    store.commit('registerEditor');
    expect(store.getters.ifRegisterEditor).toBe(true);
  });
});

