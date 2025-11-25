/**
 * PostPage 加载逻辑 Composable
 */
import {
  getPostDetailById,
  getReplyListByPostId,
  createReplyUnderPost,
  getReplyDetailById,
} from '@/api/modules/post';
import {
  getNormalErrorAlert,
  getNormalSuccessAlert,
  getNormalWarnAlert,
  getNormalInfoAlert,
  openPage,
  isElementAtBottom,
} from '@/utils/other';
import { acquireLock, releaseLock, getLock } from '@/utils/lock';
import { addHistory } from '@/utils/history';
import { getCookie } from '@/utils/cookie';
import { getCancelLoadMsg, getLoadMsg } from '@/utils/other';
import {
  transformPostData,
  transformReplyList,
  transformReplyDetail,
} from './dataTransformers';

export function usePostLoad(
  post,
  replyList,
  replyPageNum,
  allLoad,
  loading,
  loadState,
  parentReply,
  inputingComment,
  setPost,
  addReply,
  addReplies,
  setParentReply,
  resetComment,
  setLoading,
  alert
) {
  /**
   * 加载帖子详情
   * @param {String} postId - 帖子ID
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadPost = async (postId) => {
    loadState.value.post = false;
    try {
      const response = await getPostDetailById(postId);
      loadState.value.post = true;
      
      if (response.status === 200) {
        const transformedData = transformPostData(response);
        if (transformedData) {
          setPost(transformedData);
          
          // 添加到历史记录
          await addHistory('post', transformedData.id, transformedData.title);
          
          // 更新页面标题
          if (document.getElementById('web-title')) {
            document.getElementById('web-title').innerText = '帖子 | ' + transformedData.title;
          }
          
          return true;
        }
      } else {
        alert(getNormalErrorAlert(response.message));
        openPage('router', {
          name: 'ErrorPage',
          params: { reason: response.message },
        });
        return false;
      }
    } catch (error) {
      loadState.value.post = true;
      alert(getNormalErrorAlert(error.message || '获取帖子信息失败'));
      return false;
    }
  };
  
  /**
   * 加载更多回复
   * @param {String} postId - 帖子ID
   * @param {Number} targetPageNum - 目标页码（可选，用于恢复状态）
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadMoreReply = async (postId, targetPageNum = null) => {
    if (allLoad.value.reply) {
      return true;
    }
    
    await acquireLock(`post-load-reply${postId}`);
    loading.value.loadReply = true;
    
    try {
      const response = await getReplyListByPostId(postId, replyPageNum.value);
      
      if (response.status === 200) {
        const transformed = transformReplyList(response);
        addReplies(transformed);
        
        if (response.reply_list && response.reply_list.length === 0) {
          if (replyPageNum.value === 1) {
            // 第一页就没有数据，提示没有回复
          } else {
            alert(getNormalInfoAlert('没有更多回复了'));
          }
        } else {
          replyPageNum.value++;
        }
        
        if (response.total_pages <= response.current_page) {
          allLoad.value.reply = true;
        }
        
        // 如果指定了目标页码，继续加载直到达到目标页码
        if (targetPageNum && replyPageNum.value < targetPageNum && !allLoad.value.reply) {
          await loadMoreReply(postId, targetPageNum);
        }
        
        return true;
      } else {
        alert(getNormalErrorAlert(response.message));
        return false;
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载回复失败'));
      return false;
    } finally {
      loading.value.loadReply = false;
      releaseLock(`post-load-reply${postId}`);
    }
  };
  
  /**
   * 提交评论
   * @param {String} postId - 帖子ID
   * @returns {Promise<Boolean>} 是否提交成功
   */
  const submitReply = async (postId) => {
    if (!inputingComment.value || inputingComment.value.trim() === '') {
      alert(getNormalWarnAlert('评论内容不能为空'));
      return false;
    }
    
    loading.value.submitReply = true;
    
    try {
      const response = await createReplyUnderPost(postId, inputingComment.value);
      
      if (response.status === 200 || response.status === 201) {
        alert(getNormalSuccessAlert('评论成功'));
        
        // 添加新回复到列表
        addReply({
          id: response.reply_id,
          content: inputingComment.value,
          authorName: getCookie('userName'),
          authorId: getCookie('userId'),
          likeNum: 0,
          publishTime: new Date().toLocaleString(),
          ifLike: false,
        });
        
        // 更新回复数量
        post.value.replyNum = (post.value.replyNum || 0) + 1;
        
        resetComment();
        return true;
      } else {
        alert(getNormalErrorAlert(response.message));
        return false;
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '提交失败'));
      return false;
    } finally {
      loading.value.submitReply = false;
    }
  };
  
  /**
   * 加载父级回复
   * @param {String} replyId - 回复ID
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadParentReply = async (replyId) => {
    if (!replyId) {
      alert(getNormalErrorAlert('无父级回复'));
      return false;
    }
    
    setLoading(getLoadMsg('正在加载...'));
    
    try {
      const response = await getReplyDetailById(replyId);
      setLoading(getCancelLoadMsg());
      
      if (response.status === 200 || response.status === 201) {
        const transformed = transformReplyDetail(response);
        if (transformed) {
          setParentReply(transformed);
          alert(getNormalSuccessAlert('加载成功'));
          return true;
        }
      } else {
        alert(getNormalErrorAlert(response.message));
        return false;
      }
    } catch (error) {
      setLoading(getCancelLoadMsg());
      alert(getNormalErrorAlert(error.message || '加载失败'));
      return false;
    }
  };
  
  /**
   * 滚动加载回复
   * @param {String} postId - 帖子ID
   */
  const glideLoad = async (postId) => {
    // 防止在其他加载未完成时加载
    if (getLock(`post-load-reply${postId}`)) {
      return;
    }
    
    const container = document.getElementById('comments-container');
    if (container && isElementAtBottom(container)) {
      await loadMoreReply(postId);
    }
  };
  
  return {
    loadPost,
    loadMoreReply,
    submitReply,
    loadParentReply,
    glideLoad,
  };
}


