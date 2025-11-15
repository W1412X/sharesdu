/**
 * 搜索功能 Composable
 */
import { ref, computed } from 'vue';
import { getNormalInfoAlert } from '@/utils/other';
import { openPage } from '@/utils/navigation';
import { createEventBus, getEventBus } from '@/utils/eventBus';

export function useSearch(ifMobile, mobileIfShowSearchInput, alert) {
  const searchContent = ref("");
  const searchType = ref("全部");
  
  const searchLabel = computed(() => {
    return "搜索" + searchType.value;
  });
  
  const searchInputEventBus = getEventBus("global-search-input") 
    ? getEventBus("global-search-input") 
    : createEventBus("global-search-input");
  
  const handleSearchTypeChanged = (type) => {
    searchType.value = type;
  };
  
  const search = () => {
    if (ifMobile.value && !mobileIfShowSearchInput.value) {
      openPage("url", { url: "#/search_mobile" });
      return;
    }
    
    let dealedString = searchContent.value.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
    
    if (dealedString.length == 0) {
      alert(getNormalInfoAlert("关键词无效，换一个试试吧 >_<"));
      searchContent.value = "";
      return;
    }
    
    if (dealedString.length >= 25) {
      alert(getNormalInfoAlert("搜索内容不得超过25字"));
      searchContent.value = "";
      return;
    }
    
    let type = null;
    switch (searchType.value) {
      case '文章':
        type = 'article';
        break;
      case '帖子':
        type = 'post';
        break;
      case '课程':
        type = 'course';
        break;
      case '全部':
        type = 'all';
        break;
      case '回复':
        type = 'reply';
        break;
      default:
        type = 'all';
    }
    
    openPage("router", {
      path: '/search',
      name: 'SearchPage',
      query: {
        type: type,
        query: dealedString
      }
    });
  };
  
  return {
    searchContent,
    searchType,
    searchLabel,
    searchInputEventBus,
    handleSearchTypeChanged,
    search,
  };
}

