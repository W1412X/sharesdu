/**
 * IndexPage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { getCookie } from '@/utils/cookie';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { getDeviceType } from '@/utils/device';
import { globalProperties } from '@/main';

export function useIndexState() {
  // 当前内容类型：article, post, course
  const itemType = ref('article');
  
  // 文章排序方式：time, star, view, hot
  const articleSortMethod = ref('time');
  
  // 当前选中的板块ID（默认20）
  const selectedSectionId = ref(20);
  
  // 是否已挂载
  const ifMounted = ref(false);
  
  // 上次浏览的页码
  const lastPageNum = ref(null);
  
  // 是否为移动端
  const ifMobile = computed(() => {
    return getDeviceType() === 'mobile';
  });
  
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // 设备类型
  const deviceType = globalProperties.$deviceType;
  
  // 用户信息
  const userId = getCookie('userId');
  const userName = getCookie('userName');
  const userProfileUrl = getCookie('userProfileUrl');

  /**
   * 从 sessionStorage 恢复状态（已迁移到 useIndexRestore）
   * @deprecated 使用 useIndexRestore 替代
   */
  const restoreState = () => {
    try {
      const lastScanMsg = JSON.parse(selfDefinedSessionStorage.getItem('indexScanMsg'));
      if (lastScanMsg) {
        itemType.value = lastScanMsg.itemType || 'article';
        lastPageNum.value = lastScanMsg.pageNum || null;
        articleSortMethod.value = lastScanMsg.articleSortMethod || 'time';
        return {
          itemType: itemType.value,
          lastPageNum: lastPageNum.value,
          articleSortMethod: articleSortMethod.value,
          scrollPosition: lastScanMsg.scrollPosition || 0,
        };
      }
    } catch (e) {
      console.error('Failed to restore state:', e);
    }
    return null;
  };

  /**
   * 保存状态到 sessionStorage（已迁移到 useIndexRestore）
   * @deprecated 使用 useIndexRestore 替代
   * @param {Object} pageNum - 分页信息
   * @param {Number} scrollPosition - 滚动位置
   */
  const saveState = (pageNum, scrollPosition) => {
    try {
      if (!getCookie('userName')) {
        return;
      }
      const lastScanMsg = {
        itemType: itemType.value,
        pageNum: pageNum,
        scrollPosition: scrollPosition,
        articleSortMethod: articleSortMethod.value,
        timestamp: Date.now(),
      };
      selfDefinedSessionStorage.setItem('indexScanMsg', JSON.stringify(lastScanMsg));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  };

  return {
    itemType,
    articleSortMethod,
    selectedSectionId,
    ifMounted,
    lastPageNum,
    ifMobile,
    themeColor,
    deviceType,
    userId,
    userName,
    userProfileUrl,
    restoreState,
    saveState,
  };
}

