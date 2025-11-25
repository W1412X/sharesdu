/**
 * ArticlePage 加载逻辑 Composable
 */
import { getArticleDetail, getPostListByArticleId } from '@/api/modules/article';
// eslint-disable-next-line no-unused-vars
import { getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import { acquireLock, releaseLock } from '@/utils/lock';
import { transformArticleData, transformPostList } from './dataTransformers';
import { addHistory } from '@/utils/history';
import { openPage } from '@/utils/other';

export function useArticleLoad(
  article,
  articleResponse,
  postItems,
  postPageNum,
  allLoad,
  loading,
  setArticle,
  addPosts,
  alert
) {
  /**
   * 加载文章详情
   * @param {String} articleId - 文章ID
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadArticle = async (articleId) => {
    try {
      const response = await getArticleDetail(articleId);
      
      if (response.status === 200) {
        articleResponse.value = response;
        
        try {
          const [articleData, editorTypeValue] = await transformArticleData(response);
          setArticle(articleData);
          
          // 添加到历史记录
          await addHistory('article', articleData.id, articleData.title);
          
          // 更新页面标题
          const webTitle = document.getElementById('web-title');
          if (webTitle) {
            webTitle.innerText = '文章 | ' + articleData.title;
          }
          
          return { success: true, editorType: editorTypeValue };
        } catch (error) {
          console.error('Failed to process article:', error);
          alert(getNormalErrorAlert('文章处理失败: ' + (error.message || '未知错误')));
          openPage('router', {
            name: 'ErrorPage',
            params: { reason: '文章处理失败' },
          });
          return { success: false };
        }
      } else {
        alert(getNormalErrorAlert(response.message));
        openPage('router', {
          name: 'ErrorPage',
          params: { reason: response.message },
        });
        return { success: false };
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载文章失败'));
      return { success: false };
    }
  };
  
  /**
   * 加载更多帖子
   * @param {String} articleId - 文章ID
   * @param {Number} targetPageNum - 目标页码（可选，用于恢复状态）
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadMorePost = async (articleId, targetPageNum = null) => {
    if (allLoad.value.post) {
      return true;
    }
    
    await acquireLock(`article-load-post${articleId}`);
    loading.value.post = true;
    
    try {
      const response = await getPostListByArticleId(articleId, postPageNum.value);
      
      if (response.status === 200) {
        const transformedPosts = transformPostList(response.post_list || []);
        addPosts(transformedPosts);
        
        postPageNum.value++;
        
        if (response.total_pages <= response.current_page) {
          allLoad.value.post = true;
        }
        
        // 如果指定了目标页码，继续加载直到达到目标页码
        if (targetPageNum && postPageNum.value < targetPageNum && !allLoad.value.post) {
          await loadMorePost(articleId, targetPageNum);
        }
        
        return true;
      } else {
        alert(getNormalErrorAlert(response.message));
        return false;
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载帖子失败'));
      return false;
    } finally {
      loading.value.post = false;
      releaseLock(`article-load-post${articleId}`);
    }
  };
  
  return {
    loadArticle,
    loadMorePost,
  };
}

