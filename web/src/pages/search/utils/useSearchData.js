/**
 * SearchPage 数据管理 Composable
 */
import { ref } from 'vue';
import {
  transformArticleResults,
  transformPostResults,
  transformCourseResults,
  transformReplyResults,
  transformGlobalResults,
} from './dataTransformers';

// 初始化搜索列表结构
function initSearchList() {
  return {
    '文章': {
      'publish_time': [],
      '-publish_time': [],
      'hot_score': [],
      '-hot_score': [],
      'likes_count': [],
      '-likes_count': [],
    },
    '帖子': {
      'publish_time': [],
      '-publish_time': [],
      'hot_score': [],
      '-hot_score': [],
      'views': [],
      '-views': [],
    },
    '课程': {
      'publish_time': [],
      '-publish_time': [],
      'stars': [],
      '-stars': [],
    },
    '全部': {
      null: [],
    },
    '微服务': {
      null: [],
    },
    '回复': {
      null: [],
    },
  };
}

// 初始化分页结构
function initSearchPage() {
  return {
    '文章': {
      'publish_time': 1,
      '-publish_time': 1,
      'hot_score': 1,
      '-hot_score': 1,
      'likes_count': 1,
      '-likes_count': 1,
    },
    '帖子': {
      'publish_time': 1,
      '-publish_time': 1,
      'hot_score': 1,
      '-hot_score': 1,
      'views': 1,
      '-views': 1,
    },
    '课程': {
      'publish_time': 1,
      '-publish_time': 1,
      'stars': 1,
      '-stars': 1,
    },
    '全部': {
      null: 1,
    },
    '微服务': {
      null: 1,
    },
    '回复': {
      null: 1,
    },
  };
}

// 初始化加载完成状态
function initAllLoad() {
  return {
    '文章': {
      'publish_time': false,
      '-publish_time': false,
      'hot_score': false,
      '-hot_score': false,
      'likes_count': false,
      '-likes_count': false,
    },
    '帖子': {
      'publish_time': false,
      '-publish_time': false,
      'hot_score': false,
      '-hot_score': false,
      'views': false,
      '-views': false,
    },
    '课程': {
      'publish_time': false,
      '-publish_time': false,
      'stars': false,
      '-stars': false,
    },
    '全部': {
      null: false,
    },
    '微服务': {
      null: false,
    },
    '回复': {
      null: false,
    },
  };
}

// 初始化搜索结果数量
function initSearchResultNum() {
  return {
    '文章': {
      'publish_time': 0,
      '-publish_time': 0,
      'hot_score': 0,
      '-hot_score': 0,
      'likes_count': 0,
      '-likes_count': 0,
    },
    '帖子': {
      'publish_time': 0,
      '-publish_time': 0,
      'hot_score': 0,
      '-hot_score': 0,
      'views': 0,
      '-views': 0,
    },
    '课程': {
      'publish_time': 0,
      '-publish_time': 0,
      'stars': 0,
      '-stars': 0,
    },
    '微服务': {
      null: 0,
    },
    '全部': {
      null: 0,
    },
    '回复': {
      null: 0,
    },
  };
}

export function useSearchData() {
  // 搜索结果列表
  // 使用 ref 而不是 shallowRef，因为需要深度响应式来监听嵌套属性的变化
  const searchList = ref(initSearchList());
  
  // 分页信息
  const searchPage = ref(initSearchPage());
  
  // 是否全部加载完成
  const allLoad = ref(initAllLoad());
  
  // 搜索结果数量
  const searchResultNum = ref(initSearchResultNum());
  
  // 加载状态
  const loading = ref({
    item: false,
  });
  
  /**
   * 添加文章搜索结果
   * @param {String} sortType - 排序类型
   * @param {Array} results - 结果数组
   */
  const addArticleResults = (sortType, results) => {
    const transformed = transformArticleResults(results);
    searchList.value['文章'][sortType].push(...transformed);
  };
  
  /**
   * 设置文章搜索结果
   * @param {String} sortType - 排序类型
   * @param {Array} results - 结果数组
   */
  const setArticleResults = (sortType, results) => {
    searchList.value['文章'][sortType] = transformArticleResults(results);
  };
  
  /**
   * 添加帖子搜索结果
   * @param {String} sortType - 排序类型
   * @param {Array} results - 结果数组
   */
  const addPostResults = (sortType, results) => {
    const transformed = transformPostResults(results);
    searchList.value['帖子'][sortType].push(...transformed);
  };
  
  /**
   * 设置帖子搜索结果
   * @param {String} sortType - 排序类型
   * @param {Array} results - 结果数组
   */
  const setPostResults = (sortType, results) => {
    searchList.value['帖子'][sortType] = transformPostResults(results);
  };
  
  /**
   * 添加课程搜索结果
   * @param {String} sortType - 排序类型
   * @param {Array} results - 结果数组
   */
  const addCourseResults = (sortType, results) => {
    const transformed = transformCourseResults(results);
    searchList.value['课程'][sortType].push(...transformed);
  };
  
  /**
   * 设置课程搜索结果
   * @param {String} sortType - 排序类型
   * @param {Array} results - 结果数组
   */
  const setCourseResults = (sortType, results) => {
    searchList.value['课程'][sortType] = transformCourseResults(results);
  };
  
  /**
   * 添加回复搜索结果
   * @param {Array} results - 结果数组
   */
  const addReplyResults = (results) => {
    const transformed = transformReplyResults(results);
    searchList.value['回复'][null].push(...transformed);
  };
  
  /**
   * 设置回复搜索结果
   * @param {Array} results - 结果数组
   */
  const setReplyResults = (results) => {
    searchList.value['回复'][null] = transformReplyResults(results);
  };
  
  /**
   * 添加全局搜索结果
   * @param {Array} results - 结果数组
   */
  const addGlobalResults = (results) => {
    const transformed = transformGlobalResults(results);
    searchList.value['全部'][null].push(...transformed);
  };
  
  /**
   * 设置全局搜索结果
   * @param {Array} results - 结果数组
   */
  const setGlobalResults = (results) => {
    searchList.value['全部'][null] = transformGlobalResults(results);
  };
  
  /**
   * 添加微服务搜索结果
   * @param {Array} results - 结果数组
   */
  const addMicroserviceResults = (results) => {
    const transformed = transformGlobalResults(results);
    searchList.value['微服务'][null].push(...transformed);
  };
  
  /**
   * 设置微服务搜索结果
   * @param {Array} results - 结果数组
   */
  const setMicroserviceResults = (results) => {
    searchList.value['微服务'][null] = transformGlobalResults(results);
  };
  
  /**
   * 重置某个搜索类型和排序的结果
   * @param {String} searchType - 搜索类型
   * @param {String} sortType - 排序类型
   */
  const resetResults = (searchType, sortType) => {
    searchList.value[searchType][sortType] = [];
    searchPage.value[searchType][sortType] = 1;
    allLoad.value[searchType][sortType] = false;
  };
  
  return {
    searchList,
    searchPage,
    allLoad,
    searchResultNum,
    loading,
    addArticleResults,
    setArticleResults,
    addPostResults,
    setPostResults,
    addCourseResults,
    setCourseResults,
    addReplyResults,
    setReplyResults,
    addGlobalResults,
    setGlobalResults,
    addMicroserviceResults,
    setMicroserviceResults,
    resetResults,
  };
}

