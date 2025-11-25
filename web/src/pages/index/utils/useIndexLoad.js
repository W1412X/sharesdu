/**
 * IndexPage 加载逻辑 Composable
 */
import { getArticleList, getPostListByArticleId } from '@/api/modules/article';
import { getCourseList } from '@/api/modules/course';
import { getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import { acquireLock, getLock, releaseLock } from '@/utils/lock';

export function useIndexLoad(
  itemType,
  articleSortMethod,
  articleList,
  postList,
  courseList,
  articlePageNum,
  postPageNum,
  coursePageNum,
  loading,
  allLoad,
  setArticles,
  addArticles,
  setPosts,
  addPosts,
  setCourses,
  addCourses,
  alert
) {
  /**
   * 刷新数据
   * @param {String} type - 内容类型
   * @returns {Promise} 刷新完成
   */
  const refresh = async (type) => {
    let response = null;
    
    switch (type) {
      case 'article':
        response = await getArticleList(articleSortMethod.value, null, 1, false);
        if (response.status === 200) {
          articlePageNum.value[articleSortMethod.value] = 2;
          setArticles(articleSortMethod.value, response.article_list || []);
          allLoad.value.article[articleSortMethod.value] = false;
        } else {
          alert(getNormalErrorAlert(response.message));
        }
        break;
        
      case 'post':
        response = await getPostListByArticleId(20, 1, false);
        if (response.status === 200) {
          postPageNum.value = 2;
          setPosts(response.post_list || []);
          allLoad.value.post = false;
        } else {
          alert(getNormalErrorAlert(response.message));
        }
        break;
        
      case 'course':
        response = await getCourseList(1, false);
        if (response.status === 200) {
          coursePageNum.value = 2;
          setCourses(response.course_list || []);
          allLoad.value.course = false;
        } else {
          alert(getNormalErrorAlert(response.message));
        }
        break;
    }
    
    return response;
  };

  /**
   * 加载更多数据
   * @param {String} type - 内容类型
   */
  const loadMore = async (type) => {
    // 基于用户体验，设置所有的视图加载
    loading.value.article = true;
    loading.value.post = true;
    loading.value.course = true;
    //获取锁，防止由于快速滚动导致重复加载
    await acquireLock('index-load-more');
    try {
      if (type === 'article') {
        if (allLoad.value.article[articleSortMethod.value]) {
          return;
        }
        const response = await getArticleList(
          articleSortMethod.value,
          null,
          articlePageNum.value[articleSortMethod.value]
        );
        if (response.status === 200) {
          addArticles(articleSortMethod.value, response.article_list || []);
          articlePageNum.value[articleSortMethod.value]++;
          alert(getNormalSuccessAlert(response.message));
          
          if (response.total_pages <= response.current_page) {
            allLoad.value.article[articleSortMethod.value] = true;
          }
        } else {
          alert(getNormalErrorAlert(response.message));
        }
      } else if (type === 'course') {
        if (allLoad.value.course) {
          return;
        }
        const response = await getCourseList(coursePageNum.value);        
        if (response.status === 200) {
          addCourses(response.course_list || []);
          coursePageNum.value++;
          alert(getNormalSuccessAlert('加载成功'));
          
          if (response.total_pages <= response.current_page) {
            allLoad.value.course = true;
          }
        } else {
          alert(getNormalErrorAlert(response.message));
        }
      } else if (type === 'post') {
        if (allLoad.value.post) {
          return;
        }
        const response = await getPostListByArticleId(20, postPageNum.value);
        
        if (response.status === 200) {
          addPosts(response.post_list || []);
          postPageNum.value++;
          alert(getNormalSuccessAlert(response.message));
          
          if (response.total_pages <= response.current_page) {
            allLoad.value.post = true;
          }
        } else {
          alert(getNormalErrorAlert(response.message));
        }
      }
    } finally {
      releaseLock('index-load-more');
      // 基于用户体验，设置所有的视图取消加载
      loading.value.article = false;
      loading.value.post = false;
      loading.value.course = false;
    }
  };

  /**
   * 恢复滚动位置并加载到指定页码（优化版）
   * @param {String} type - 内容类型
   * @param {Object} targetPageNum - 目标页码对象
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Boolean>} 是否成功恢复
   */
  const restoreScrollAndLoad = async (type, targetPageNum, onProgress = null) => {
    if (!targetPageNum) {
      return false;
    }

    let targetPage = 1;
    
    switch (type) {
      case 'article':
        targetPage = targetPageNum.article?.[articleSortMethod.value] || 1;
        if (targetPage <= articlePageNum.value[articleSortMethod.value]) {
          return true; // 已经加载到目标页码
        }
        // 批量加载到目标页码
        while (articlePageNum.value[articleSortMethod.value] < targetPage) {
          if (onProgress) {
            onProgress({
              current: articlePageNum.value[articleSortMethod.value],
              target: targetPage,
              type: 'article',
            });
          }
          await loadMore(type);
          // 防止无限循环
          if (allLoad.value.article[articleSortMethod.value]) {
            break;
          }
        }
        break;
        
      case 'post':
        targetPage = targetPageNum.post || 1;
        if (targetPage <= postPageNum.value) {
          return true;
        }
        while (postPageNum.value < targetPage) {
          if (onProgress) {
            onProgress({
              current: postPageNum.value,
              target: targetPage,
              type: 'post',
            });
          }
          await loadMore(type);
          if (allLoad.value.post) {
            break;
          }
        }
        break;
        
      case 'course':
        targetPage = targetPageNum.course || 1;
        if (targetPage <= coursePageNum.value) {
          return true;
        }
        while (coursePageNum.value < targetPage) {
          if (onProgress) {
            onProgress({
              current: coursePageNum.value,
              target: targetPage,
              type: 'course',
            });
          }
          await loadMore(type);
          if (allLoad.value.course) {
            break;
          }
        }
        break;
    }
    
    return true;
  };

  /**
   * 检查是否可以加载更多（滚动到底部时）
   * @returns {Boolean}
   */
  const canLoadMore = () => {
    return !getLock('index-load-more');
  };

  return {
    refresh,
    loadMore,
    restoreScrollAndLoad,
    canLoadMore,
  };
}

