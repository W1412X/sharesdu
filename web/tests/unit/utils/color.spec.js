/**
 * 颜色工具函数单元测试
 */
import { adjustAlpha, hexToRgba } from '@/utils/color';

describe('color.js', () => {
  describe('adjustAlpha', () => {
    test('应该正确调整6位十六进制颜色的透明度', () => {
      const result = adjustAlpha('#ff0000', 0.5);
      expect(result).toMatch(/^#[0-9a-f]{8}$/i);
      expect(result.length).toBe(9);
    });

    test('应该正确调整8位十六进制颜色的透明度', () => {
      const result = adjustAlpha('#ff0000ff', 0.1);
      expect(result).toMatch(/^#[0-9a-f]{8}$/i);
    });

    test('应该使用默认透明度0.1', () => {
      const result = adjustAlpha('#ff0000');
      expect(result).toMatch(/^#[0-9a-f]{8}$/i);
    });

    test('应该对无效格式抛出错误', () => {
      expect(() => adjustAlpha('#ff00')).toThrow('Invalid hex color format');
      expect(() => adjustAlpha('invalid')).toThrow('Invalid hex color format');
      expect(() => adjustAlpha('#ff')).toThrow('Invalid hex color format');
    });

    test('应该处理不带#号的颜色值', () => {
      const result = adjustAlpha('ff0000', 0.5);
      expect(result).toMatch(/^#[0-9a-f]{8}$/i);
    });
  });

  describe('hexToRgba', () => {
    test('应该正确转换6位十六进制颜色为RGBA', () => {
      const result = hexToRgba('#ff0000', 0.5);
      expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });

    test('应该正确转换8位十六进制颜色为RGBA', () => {
      const result = hexToRgba('#ff0000ff');
      expect(result).toContain('rgba(255, 0, 0');
    });

    test('应该使用默认不透明度1', () => {
      const result = hexToRgba('#00ff00');
      expect(result).toBe('rgba(0, 255, 0, 1)');
    });

    test('应该处理无效格式并返回默认值', () => {
      const result = hexToRgba('invalid');
      expect(result).toBe('rgba(156, 12, 19, 0.1)');
    });

    test('应该处理不带#号的颜色值', () => {
      const result = hexToRgba('0000ff', 0.8);
      expect(result).toBe('rgba(0, 0, 255, 0.8)');
    });
  });
});

