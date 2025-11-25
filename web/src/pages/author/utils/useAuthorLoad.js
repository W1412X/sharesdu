/**
 * AuthorPage 加载逻辑 Composable
 */
import { getAuthorInfo, getUserContent, getUserPreview } from '@/api/modules/account';
import { getNormalErrorAlert, getNormalInfoAlert } from '@/utils/other';
import { acquireLock, releaseLock } from '@/utils/lock';
import { openPage } from '@/utils/other';
import {
  transformAuthorData,
  transformArticlePreviewList,
  transformPostPreviewList,
  transformReplyPreviewList,
  transformUserContentList,
} from './dataTransformers';

export function useAuthorLoad(
  authorData,
  articleList,
  postList,
  replyList,
  articlePageNum,
  postPageNum,
  replyPageNum,
  allLoad,
  loading,
  setAuthorData,
  setArticleList,
  addArticleList,
  setPostList,
  addPostList,
  setReplyList,
  addReplyList,
  alert
) {
  /**
   * 加载作者信息
   * @param {String} userId - 用户ID
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadAuthorInfo = async (userId) => {
    try {
      const response = await getAuthorInfo(userId);
      
      if (response.status === 200) {
        const transformedData = transformAuthorData(response);
        if (transformedData) {
          setAuthorData(transformedData);
          return { success: true, authorName: transformedData.name };
        }
        return { success: false };
      } else {
        alert(getNormalErrorAlert(response.message));
        openPage('router', {
          name: 'ErrorPage',
          params: { reason: '无法找到此用户' },
        });
        return { success: false };
      }
    } catch (error) {
      alert(getNormalErrorAlert('获取用户信息失败'));
      return { success: false };
    }
  };
  
  /**
   * 加载预览数据
   * @param {String} userId - 用户ID
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadPreview = async (userId) => {
    try {
      const response = await getUserPreview(userId);
      
      if (response.status === 200) {
        const articles = transformArticlePreviewList(response.articles || []);
        const posts = transformPostPreviewList(response.posts || []);
        const replies = transformReplyPreviewList(response.replies || []);
        
        setArticleList(articles);
        setPostList(posts);
        setReplyList(replies);
        
        return true;
      } else {
        alert(getNormalErrorAlert(response.message || '加载预览失败'));
        return false;
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载预览失败'));
      return false;
    }
  };
  
  /**
   * 加载更多内容
   * @param {String} userId - 用户ID
   * @param {String} contentType - 内容类型（article/post/reply）
   * @param {Number} targetPageNum - 目标页码（可选，用于恢复状态）
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadMoreContent = async (userId, contentType, targetPageNum = null) => {
    if (allLoad.value[contentType]) {
      return true;
    }
    
    await acquireLock(`author-load-${contentType}${userId}`);
    loading.value[contentType] = true;
    
    try {
      let currentPage;
      switch (contentType) {
        case 'article':
          currentPage = articlePageNum.value;
          break;
        case 'post':
          currentPage = postPageNum.value;
          break;
        case 'reply':
          currentPage = replyPageNum.value;
          break;
        default:
          return false;
      }
      
      const response = await getUserContent(contentType, userId, currentPage);
      
      if (response.status === 200) {
        const transformed = transformUserContentList(response.results || [], contentType);
        
        // 如果没有数据，说明已经加载完成
        if (transformed.length === 0) {
          allLoad.value[contentType] = true;
          return true;
        }
        
        switch (contentType) {
          case 'article':
            addArticleList(transformed);
            articlePageNum.value++;
            // 如果返回的数据少于预期，说明已经加载完成
            if (transformed.length < 10) {
              allLoad.value.article = true;
            }
            break;
          case 'post':
            addPostList(transformed);
            postPageNum.value++;
            if (transformed.length < 10) {
              allLoad.value.post = true;
            }
            break;
          case 'reply':
            addReplyList(transformed);
            replyPageNum.value++;
            if (transformed.length < 10) {
              allLoad.value.reply = true;
            }
            break;
        }
        
        // 如果指定了目标页码，继续加载直到达到目标页码
        if (targetPageNum && currentPage < targetPageNum && !allLoad.value[contentType]) {
          await loadMoreContent(userId, contentType, targetPageNum);
        }
        
        return true;
      } else {
        allLoad.value[contentType] = true;
        alert(getNormalInfoAlert(`无更多${contentType === 'article' ? '文章' : contentType === 'post' ? '帖子' : '回复'}`));
        return false;
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载失败'));
      return false;
    } finally {
      loading.value[contentType] = false;
      releaseLock(`author-load-${contentType}${userId}`);
    }
  };
  
  return {
    loadAuthorInfo,
    loadPreview,
    loadMoreContent,
  };
}

