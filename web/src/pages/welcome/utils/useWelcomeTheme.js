/**
 * WelcomePage 主题颜色管理 Composable
 */
import { onMounted } from 'vue';
import { hexToRgba } from '@/utils/color';

export function useWelcomeTheme(themeColor) {
  /**
   * 设置基于主题颜色的 CSS 变量
   */
  const setThemeColors = () => {
    const root = document.documentElement;
    root.style.setProperty('--welcome-theme-color', themeColor);
    root.style.setProperty('--welcome-theme-rgba-08', hexToRgba(themeColor, 0.08));
    root.style.setProperty('--welcome-theme-rgba-10', hexToRgba(themeColor, 0.1));
    root.style.setProperty('--welcome-theme-rgba-12', hexToRgba(themeColor, 0.12));
    root.style.setProperty('--welcome-theme-rgba-20', hexToRgba(themeColor, 0.2));
    root.style.setProperty('--welcome-theme-rgba-25', hexToRgba(themeColor, 0.25));
    root.style.setProperty('--welcome-theme-rgba-30', hexToRgba(themeColor, 0.3));
    root.style.setProperty('--welcome-theme-rgba-40', hexToRgba(themeColor, 0.4));
    root.style.setProperty('--welcome-theme-rgba-50', hexToRgba(themeColor, 0.5));
    
    // 生成渐变色（基于主题颜色的变体）
    const hex = themeColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 转换为 HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
        case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
        case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
      }
    }
    
    // 生成渐变色的变体（稍微调整色相和亮度）
    const h1 = (h * 360 + 10) % 360;
    const h2 = (h * 360 - 10 + 360) % 360;
    const l1 = Math.min(100, l * 100 + 5);
    const l2 = Math.max(0, l * 100 - 5);
    
    // HSL 转 RGB 的辅助函数
    const hslToRgb = (h, s, l) => {
      h = h / 360;
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
        g = Math.round(hue2rgb(p, q, h) * 255);
        b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
      }
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    root.style.setProperty('--welcome-theme-gradient-start', hslToRgb(h1, s, l1 / 100));
    root.style.setProperty('--welcome-theme-gradient-end', hslToRgb(h2, s, l2 / 100));
  };
  
  onMounted(() => {
    setThemeColors();
  });
  
  return {
    setThemeColors,
  };
}

