/**
 * SearchPage 加载逻辑 Composable
 */
import {
  searchArticles,
  searchPosts,
  searchCourses,
  searchReplies,
  globalSearch,
} from '@/api/modules/search';
import { getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import { acquireLock, releaseLock } from '@/utils/lock';

export function useSearchLoad(
  searchType,
  sortType,
  queryToSubmit,
  searchList,
  searchPage,
  allLoad,
  searchResultNum,
  loading,
  filtArticleTagsToSubmit,
  articleType,
  getCourseTypeForAPI,
  getCourseMethodForAPI,
  getCourseCollegeForAPI,
  setArticleResults,
  addArticleResults,
  setPostResults,
  addPostResults,
  setCourseResults,
  addCourseResults,
  setReplyResults,
  addReplyResults,
  setGlobalResults,
  addGlobalResults,
  setMicroserviceResults,
  addMicroserviceResults,
  alert
) {
  /**
   * 生成锁的 key
   */
  const getLockKey = () => {
    return `search${searchType.value}${sortType.value}${queryToSubmit.value}`;
  };
  
  /**
   * 加载文章搜索结果
   * @param {Boolean} isFirstPage - 是否是第一页
   */
  const loadArticle = async (isFirstPage = false) => {
    await acquireLock(getLockKey());
    loading.value.item = true;
    
    try {
      const response = await searchArticles(
        queryToSubmit.value,
        filtArticleTagsToSubmit.value,
        articleType.value,
        sortType.value,
        searchPage.value['文章'][sortType.value]
      );
      
      if (response.status === 200) {
        searchResultNum.value[searchType.value][sortType.value] = response.count;
        
        if (isFirstPage) {
          setArticleResults(sortType.value, response.results || []);
        } else {
          addArticleResults(sortType.value, response.results || []);
        }
        
        searchPage.value['文章'][sortType.value]++;
        
        if (response.results.length === 0) {
          allLoad.value[searchType.value][sortType.value] = true;
        }
        
        alert(getNormalSuccessAlert(response.message || '加载成功'));
      } else {
        alert(getNormalErrorAlert(response.message));
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载失败'));
    } finally {
      loading.value.item = false;
      releaseLock(getLockKey());
    }
  };
  
  /**
   * 加载帖子搜索结果
   * @param {Boolean} isFirstPage - 是否是第一页
   */
  const loadPost = async (isFirstPage = false) => {
    await acquireLock(getLockKey());
    loading.value.item = true;
    
    try {
      const response = await searchPosts(
        queryToSubmit.value,
        sortType.value,
        searchPage.value['帖子'][sortType.value]
      );
      
      if (response.status === 200) {
        searchResultNum.value[searchType.value][sortType.value] = response.count;
        
        if (isFirstPage) {
          setPostResults(sortType.value, response.results || []);
        } else {
          addPostResults(sortType.value, response.results || []);
        }
        
        searchPage.value['帖子'][sortType.value]++;
        
        if (response.results.length === 0) {
          allLoad.value[searchType.value][sortType.value] = true;
        }
        
        alert(getNormalSuccessAlert(response.message || '加载成功'));
      } else {
        alert(getNormalErrorAlert(response.message));
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载失败'));
    } finally {
      loading.value.item = false;
      releaseLock(getLockKey());
    }
  };
  
  /**
   * 加载课程搜索结果
   * @param {Boolean} isFirstPage - 是否是第一页
   */
  const loadCourse = async (isFirstPage = false) => {
    await acquireLock(getLockKey());
    loading.value.item = true;
    
    try {
      const response = await searchCourses(
        queryToSubmit.value,
        getCourseTypeForAPI(),
        getCourseCollegeForAPI(),
        getCourseMethodForAPI(),
        sortType.value,
        searchPage.value['课程'][sortType.value]
      );
      
      if (response.status === 200) {
        searchResultNum.value[searchType.value][sortType.value] = response.count;
        
        if (isFirstPage) {
          setCourseResults(sortType.value, response.results || []);
        } else {
          addCourseResults(sortType.value, response.results || []);
        }
        
        searchPage.value['课程'][sortType.value]++;
        
        if (response.results.length === 0) {
          allLoad.value[searchType.value][sortType.value] = true;
        }
        
        alert(getNormalSuccessAlert(response.message || '加载成功'));
      } else {
        alert(getNormalErrorAlert(response.message));
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载失败'));
    } finally {
      loading.value.item = false;
      releaseLock(getLockKey());
    }
  };
  
  /**
   * 加载回复搜索结果
   * @param {Boolean} isFirstPage - 是否是第一页
   */
  const loadReply = async (isFirstPage = false) => {
    await acquireLock(getLockKey());
    loading.value.item = true;
    
    try {
      const response = await searchReplies(
        queryToSubmit.value,
        searchPage.value['回复'][null]
      );
      
      if (response.status === 200) {
        searchResultNum.value['回复'][null] = response.count;
        
        if (isFirstPage) {
          setReplyResults(response.results || []);
        } else {
          addReplyResults(response.results || []);
        }
        
        searchPage.value['回复'][null]++;
        
        if (response.results.length === 0) {
          allLoad.value['回复'][null] = true;
        }
        
        alert(getNormalSuccessAlert(response.message || '加载成功'));
      } else {
        alert(getNormalErrorAlert(response.message));
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载失败'));
    } finally {
      loading.value.item = false;
      releaseLock(getLockKey());
    }
  };
  
  /**
   * 加载全局搜索结果
   * @param {Boolean} isFirstPage - 是否是第一页
   */
  const loadAll = async (isFirstPage = false) => {
    await acquireLock(getLockKey());
    loading.value.item = true;
    
    try {
      const response = await globalSearch(
        queryToSubmit.value,
        searchPage.value['全部'][null]
      );
      
      if (response.status === 200 || response.results) {
        searchResultNum.value['全部'][null] = response.count || 0;
        
        if (isFirstPage) {
          setGlobalResults(response.results || []);
        } else {
          addGlobalResults(response.results || []);
        }
        
        searchPage.value['全部'][null]++;
        
        if (response.results.length === 0) {
          allLoad.value['全部'][null] = true;
        }
        
        alert(getNormalSuccessAlert(response.message || '加载成功'));
      } else {
        alert(getNormalErrorAlert(response.message));
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载失败'));
    } finally {
      loading.value.item = false;
      releaseLock(getLockKey());
    }
  };
  
  /**
   * 加载微服务搜索结果
   * @param {Boolean} isFirstPage - 是否是第一页
   */
  const loadMicroservice = async (isFirstPage = false) => {
    await acquireLock(getLockKey());
    loading.value.item = true;
    
    try {
      // 微服务搜索暂时使用全局搜索
      const response = await globalSearch(
        queryToSubmit.value,
        searchPage.value['微服务'][null]
      );
      
      if (response.status === 200 || response.results) {
        searchResultNum.value['微服务'][null] = response.count || 0;
        
        if (isFirstPage) {
          setMicroserviceResults(response.results || []);
        } else {
          addMicroserviceResults(response.results || []);
        }
        
        searchPage.value['微服务'][null]++;
        
        if (response.results.length === 0) {
          allLoad.value['微服务'][null] = true;
        }
        
        alert(getNormalSuccessAlert(response.message || '加载成功'));
      } else {
        alert(getNormalErrorAlert(response.message));
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载失败'));
    } finally {
      loading.value.item = false;
      releaseLock(getLockKey());
    }
  };
  
  /**
   * 根据搜索类型加载数据
   * @param {Boolean} isFirstPage - 是否是第一页
   */
  const load = async (isFirstPage = false) => {
    if (allLoad.value[searchType.value][sortType.value]) {
      return;
    }
    
    switch (searchType.value) {
      case '文章':
        await loadArticle(isFirstPage);
        break;
      case '帖子':
        await loadPost(isFirstPage);
        break;
      case '课程':
        await loadCourse(isFirstPage);
        break;
      case '回复':
        await loadReply(isFirstPage);
        break;
      case '全部':
        await loadAll(isFirstPage);
        break;
      case '微服务':
        await loadMicroservice(isFirstPage);
        break;
      default:
        alert(getNormalErrorAlert('未知的搜索类型'));
    }
  };
  
  /**
   * 刷新数据（重置并加载第一页）
   */
  const refresh = async () => {
    searchPage.value[searchType.value][sortType.value] = 1;
    allLoad.value[searchType.value][sortType.value] = false;
    await load(true);
  };
  
  return {
    load,
    refresh,
    loadArticle,
    loadPost,
    loadCourse,
    loadReply,
    loadAll,
    loadMicroservice,
  };
}

