/**
 * SectionPage 加载逻辑 Composable
 */
import { getArticleDetail, getPostListByArticleId } from '@/api/modules/article';
import { getNormalErrorAlert } from '@/utils/other';
import { transformSectionData, transformPostList } from './dataTransformers';
import { addHistory } from '@/utils/history';
import { openPage } from '@/utils/other';

export function useSectionLoad(
  section,
  sectionResponse,
  postItems,
  postPageNum,
  allLoad,
  loading,
  setSection,
  addPosts,
  alert
) {
  /**
   * 加载板块详情
   * @param {String} sectionId - 板块ID（文章ID）
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadSection = async (sectionId) => {
    try {
      const response = await getArticleDetail(sectionId);
      
      if (response.status === 200) {
        sectionResponse.value = response;
        
        try {
          const sectionData = await transformSectionData(response);
          setSection(sectionData);
          
          // 添加到历史记录
          await addHistory('article', sectionData.id, sectionData.title);
          
          // 更新页面标题
          const webTitle = document.getElementById('web-title');
          if (webTitle) {
            webTitle.innerText = '板块 | ' + sectionData.title;
          }
          
          return { success: true };
        } catch (error) {
          console.error('Failed to process section:', error);
          alert(getNormalErrorAlert('板块处理失败: ' + (error.message || '未知错误')));
          openPage('router', {
            name: 'ErrorPage',
            params: { reason: '板块处理失败' },
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
      alert(getNormalErrorAlert(error.message || '加载板块失败'));
      return { success: false };
    }
  };
  
  /**
   * 加载更多帖子
   * @param {String} sectionId - 板块ID（文章ID）
   * @param {Number} targetPageNum - 目标页码（可选）
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadMorePost = async (sectionId, targetPageNum = null) => {
    if (allLoad.value.post) {
      return true;
    }
    
    if (loading.value.post) {
      return false;
    }
    
    loading.value.post = true;
    
    try {
      const pageNum = targetPageNum || postPageNum.value;
      const response = await getPostListByArticleId(sectionId, pageNum);
      
      if (response.status === 200) {
        const posts = transformPostList(response.post_list || []);
        
        if (posts.length === 0) {
          allLoad.value.post = true;
        } else {
          addPosts(posts);
          postPageNum.value = pageNum + 1;
        }
        
        loading.value.post = false;
        return true;
      } else {
        alert(getNormalErrorAlert(response.message || '加载帖子列表失败'));
        loading.value.post = false;
        return false;
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载帖子列表失败'));
      loading.value.post = false;
      return false;
    }
  };
  
  return {
    loadSection,
    loadMorePost,
  };
}

