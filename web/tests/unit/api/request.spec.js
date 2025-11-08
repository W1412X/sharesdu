/**
 * API 请求模块单元测试
 * 注意：由于 request.js 使用了复杂的缓存机制，这里提供测试框架
 * 实际测试需要根据具体实现调整
 */
import axiosInstance from '@/api/request';

// Mock 依赖
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  
  return {
    __esModule: true,
    default: jest.fn(() => mockAxiosInstance),
    create: jest.fn(() => mockAxiosInstance)
  };
});

jest.mock('@/utils/cookie', () => ({
  getCookie: jest.fn(() => 'mock-token')
}));

jest.mock('@/utils/response_cacher', () => ({
  ResponseBuffer: jest.fn().mockImplementation(() => ({
    getResponse: jest.fn(() => null),
    addResponse: jest.fn()
  }))
}));

jest.mock('@/config', () => ({
  default: {
    api: {
      baseURL: 'https://api.sharesdu.com/index/api'
    }
  }
}));

describe('request.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('应该正确创建axios实例', () => {
    expect(axiosInstance).toBeDefined();
    expect(axiosInstance.get).toBeDefined();
    expect(axiosInstance.post).toBeDefined();
  });

  test('应该导出axiosInstanceNoHeader', () => {
    const { axiosInstanceNoHeader } = require('@/api/request');
    expect(axiosInstanceNoHeader).toBeDefined();
  });
});
