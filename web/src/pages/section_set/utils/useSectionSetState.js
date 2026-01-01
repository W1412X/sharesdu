/**
 * SectionSetPage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { getDeviceType } from '@/utils/device';
import { globalProperties } from '@/main';

export function useSectionSetState() {
  // 是否已挂载
  const ifMounted = ref(false);
  
  // 是否为移动端
  const ifMobile = computed(() => {
    return getDeviceType() === 'mobile';
  });
  
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // 设备类型
  const deviceType = globalProperties.$deviceType;

  return {
    ifMounted,
    ifMobile,
    themeColor,
    deviceType,
  };
}

