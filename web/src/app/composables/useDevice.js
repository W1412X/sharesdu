/**
 * 设备类型管理 Composable
 */
import { ref, computed } from 'vue';

export function useDevice() {
  const deviceType = ref('');
  
  // 初始化设备类型
  if (window.innerWidth <= 1000) {
    deviceType.value = 'mobile';
  } else {
    deviceType.value = 'desktop';
  }
  
  const ifMobile = computed(() => {
    return deviceType.value === 'mobile';
  });
  
  return {
    deviceType,
    ifMobile,
  };
}

