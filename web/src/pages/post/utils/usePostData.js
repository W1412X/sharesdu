/**
 * PostPage 数据管理 Composable
 */
import { ref } from 'vue';

export function usePostData() {
  // 帖子数据
  const post = ref({
    id: null,
    title: null,
    content: null,
    authorName: null,
    authorId: null,
    likeNum: 0,
    replyNum: 0,
    viewNum: 0,
    publishTime: null,
    ifLike: false,
    ifStar: false,
    imgList: [],
    relativeLink: null,
  });
  
  // 回复列表
  const replyList = ref([]);
  const replyPageNum = ref(1);
  
  // 父级回复（用于对话框显示）
  const parentReply = ref(null);
  
  // 评论输入内容
  const inputingComment = ref('');
  
  // 加载状态
  const loading = ref({
    loadReply: false,
    submitReply: false,
  });
  
  // 是否全部加载完成
  const allLoad = ref({
    reply: false,
  });
  
  // 加载状态
  const loadState = ref({
    post: false,
  });
  
  /**
   * 设置帖子数据
   * @param {Object} postData - 帖子数据
   */
  const setPost = (postData) => {
    post.value = { ...postData };
  };
  
  /**
   * 添加回复到列表
   * @param {Object} reply - 回复数据
   */
  const addReply = (reply) => {
    replyList.value.unshift(reply);
  };
  
  /**
   * 添加回复列表
   * @param {Array} replies - 回复列表
   */
  const addReplies = (replies) => {
    replyList.value.push(...replies);
  };
  
  /**
   * 设置回复列表
   * @param {Array} replies - 回复列表
   */
  const setReplies = (replies) => {
    replyList.value = [...replies];
  };
  
  /**
   * 设置父级回复
   * @param {Object} reply - 回复数据
   */
  const setParentReply = (reply) => {
    parentReply.value = reply ? { ...reply } : null;
  };
  
  /**
   * 重置评论输入
   */
  const resetComment = () => {
    inputingComment.value = '';
  };
  
  /**
   * 设置评论输入
   * @param {String} comment - 评论内容
   */
  const setComment = (comment) => {
    inputingComment.value = comment || '';
  };
  
  return {
    post,
    replyList,
    replyPageNum,
    parentReply,
    inputingComment,
    loading,
    allLoad,
    loadState,
    setPost,
    addReply,
    addReplies,
    setReplies,
    setParentReply,
    resetComment,
    setComment,
  };
}


