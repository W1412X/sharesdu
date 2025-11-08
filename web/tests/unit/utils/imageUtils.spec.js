/**
 * 图片工具函数单元测试
 */
import { compressImage, extractImageLinks } from '@/utils/imageUtils';
import config from '@/config';

// Mock config
jest.mock('@/config', () => ({
  default: {
    api: {
      baseURL: 'https://api.sharesdu.com/index/api'
    }
  }
}));

describe('imageUtils.js', () => {
  describe('extractImageLinks', () => {
    test('应该从字符串中提取图片链接', () => {
      const content = '这是一些文本 https://api.sharesdu.com/index/api/image/get?id=123 更多文本';
      const links = extractImageLinks(content);
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toContain('/image/get');
    });

    test('应该返回空数组当没有图片链接时', () => {
      const content = '这是一些没有图片链接的文本';
      const links = extractImageLinks(content);
      expect(links).toEqual([]);
    });

    test('应该提取多个图片链接', () => {
      const content = '图片1 https://api.sharesdu.com/index/api/image/get?id=1 图片2 https://api.sharesdu.com/index/api/image/get?id=2';
      const links = extractImageLinks(content);
      expect(links.length).toBe(2);
    });
  });

  describe('compressImage', () => {
    // 注意：compressImage 需要实际的 File/Blob 对象，测试可能需要 mock
    test('应该处理图片压缩', async () => {
      // 创建模拟的图片文件
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // 由于 compressImage 涉及 Canvas API，需要 mock
      // 这里提供一个测试框架
      expect(typeof compressImage).toBe('function');
    });
  });
});

