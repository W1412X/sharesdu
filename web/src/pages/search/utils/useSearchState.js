/**
 * SearchPage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';

// 排序选项配置
export const SORT_OPTIONS = {
  '文章': [
    { value: 'publish_time', label: '最近发布', icon: 'mdi-sort-clock-ascending-outline' },
    { value: '-publish_time', label: '最早发布', icon: 'mdi-sort-clock-descending-outline' },
    { value: '-hot_score', label: '最高热度', icon: 'mdi-fire-alert' },
    { value: 'hot_score', label: '最低热度', icon: 'mdi-fire' },
    { value: '-likes_count', label: '最多点赞', icon: 'mdi-heart' },
    { value: 'likes_count', label: '最少点赞', icon: 'mdi-heart-outline' },
  ],
  '帖子': [
    { value: 'publish_time', label: '最近发布', icon: 'mdi-sort-clock-ascending-outline' },
    { value: '-publish_time', label: '最早发布', icon: 'mdi-sort-clock-descending-outline' },
    { value: '-hot_score', label: '最高热度', icon: 'mdi-fire-alert' },
    { value: 'hot_score', label: '最低热度', icon: 'mdi-fire' },
    { value: '-views', label: '最多浏览', icon: 'mdi-eye-outline' },
    { value: 'views', label: '最少浏览', icon: 'mdi-eye-off-outline' },
  ],
  '课程': [
    { value: 'publish_time', label: '最近发布', icon: 'mdi-sort-clock-ascending-outline' },
    { value: '-publish_time', label: '最早发布', icon: 'mdi-sort-clock-descending-outline' },
    { value: '-stars', label: '最多收藏', icon: 'mdi-star-check-outline' },
    { value: 'stars', label: '最少收藏', icon: 'mdi-star-outline' },
  ],
  '回复': [{ value: null }],
  '微服务': [{ value: null }],
  '全部': [{ value: null }],
};

// 排序图标字典
export const SORT_ICON_DICT = {
  'publish_time': 'mdi-sort-clock-ascending-outline',
  '-publish_time': 'mdi-sort-clock-descending-outline',
  '-hot_score': 'mdi-fire-alert',
  'hot_score': 'mdi-fire',
  '-likes_count': 'mdi-heart',
  'likes_count': 'mdi-heart-outline',
  'views': 'mdi-eye-off-outline',
  '-views': 'mdi-eye-outline',
  '-stars': 'mdi-star-check-outline',
  'stars': 'mdi-star-outline',
  null: 'mdi-circle-off-outline',
};

// 排序标签字典
export const SORT_LABEL_DICT = {
  'publish_time': '最近发布',
  '-publish_time': '最早发布',
  '-hot_score': '最高热度',
  'hot_score': '最低热度',
  '-likes_count': '最多点赞',
  'likes_count': '最少点赞',
  'views': '最少浏览',
  '-views': '最多浏览',
  '-stars': '最多收藏',
  'stars': '最少收藏',
  null: '默认排序',
};

export function useSearchState(props) {
  // 搜索类型
  const searchType = ref('全部');
  
  // 排序类型
  const sortType = ref(null);
  
  // 是否已挂载
  const ifMounted = ref(false);
  
  // 课程筛选
  const courseCollege = ref('全部');
  const courseMethod = ref('全部');
  const courseType = ref('全部');
  const ifCourseFilter = ref(false);
  
  // 文章筛选
  const filtArticleTags = ref([]);
  const editingArticleFiltTag = ref('');
  const ifArticleFilter = ref(false);
  const articleType = ref(null);
  
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // 学院列表
  const colleges = computed(() => {
    const list = Array.from(globalProperties.$colleges || []);
    list.unshift('全部');
    return list;
  });
  
  // 搜索关键词（转换为字符串）
  const queryToSubmit = computed(() => {
    if (!props.query || props.query.length === 0) {
      return '';
    }
    return props.query.join(' ');
  });
  
  // 文章筛选标签（转换为字符串）
  const filtArticleTagsToSubmit = computed(() => {
    if (filtArticleTags.value.length === 0) {
      return null;
    }
    return filtArticleTags.value.join(',');
  });
  
  // 当前排序图标
  const sortIconNow = computed(() => {
    return SORT_ICON_DICT[sortType.value] || 'mdi-circle-off-outline';
  });
  
  // 当前排序标签
  const sortTypeLabelNow = computed(() => {
    return SORT_LABEL_DICT[sortType.value] || '默认排序';
  });
  
  // 未找到文本
  const unFoundText = computed(() => {
    if (props.query && props.query.length > 0) {
      return `未找到有关 "${props.query[0]}" 的内容`;
    }
    return '未找到相关内容';
  });
  
  // 当前搜索类型的排序选项
  const sortOptionsToShow = computed(() => {
    return SORT_OPTIONS[searchType.value] || [];
  });
  
  /**
   * 设置排序类型
   * @param {String} sortValue - 排序值
   */
  const setSortType = (sortValue) => {
    sortType.value = sortValue;
  };
  
  /**
   * 添加文章筛选标签
   * @param {String} tag - 标签文本
   */
  const addArticleTag = (tag) => {
    if (!tag || tag.trim() === '') {
      return false;
    }
    if (filtArticleTags.value.includes(tag)) {
      return false;
    }
    filtArticleTags.value.push(tag);
    editingArticleFiltTag.value = '';
    return true;
  };
  
  /**
   * 删除文章筛选标签
   * @param {String} tag - 标签文本
   */
  const deleteArticleTag = (tag) => {
    filtArticleTags.value = filtArticleTags.value.filter(t => t !== tag);
  };
  
  /**
   * 转换课程类型为 API 格式
   * @returns {String|null}
   */
  const getCourseTypeForAPI = () => {
    switch (courseType.value) {
      case '必修':
        return 'compulsory';
      case '选修':
        return 'elective';
      case '限选':
        return 'restricted_elective';
      default:
        return null;
    }
  };
  
  /**
   * 转换课程教学方式为 API 格式
   * @returns {String|null}
   */
  const getCourseMethodForAPI = () => {
    switch (courseMethod.value) {
      case '线下':
        return 'offline';
      case '线上':
        return 'online';
      case '混合':
        return 'hybrid';
      default:
        return null;
    }
  };
  
  /**
   * 获取课程学院（API 格式）
   * @returns {String|null}
   */
  const getCourseCollegeForAPI = () => {
    return courseCollege.value === '全部' ? null : courseCollege.value;
  };
  
  return {
    searchType,
    sortType,
    ifMounted,
    courseCollege,
    courseMethod,
    courseType,
    ifCourseFilter,
    filtArticleTags,
    editingArticleFiltTag,
    ifArticleFilter,
    articleType,
    themeColor,
    colleges,
    queryToSubmit,
    filtArticleTagsToSubmit,
    sortIconNow,
    sortTypeLabelNow,
    unFoundText,
    sortOptionsToShow,
    setSortType,
    addArticleTag,
    deleteArticleTag,
    getCourseTypeForAPI,
    getCourseMethodForAPI,
    getCourseCollegeForAPI,
  };
}
