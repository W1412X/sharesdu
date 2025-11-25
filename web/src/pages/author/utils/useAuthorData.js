/**
 * AuthorPage 数据管理 Composable
 */
import { ref } from 'vue';

export function useAuthorData() {
  // 作者信息
  const authorData = ref({
    id: '',
    name: '',
    email: '',
    reputation: 0,
    reputationLevel: '',
    master: false,
    superMaster: false,
    campus: '',
    college: '',
    major: '',
    articleNum: 0,
    postNum: 0,
    replyNum: 0,
    blockStatus: false,
    blockEndTime: '',
    registerTime: '',
    registerYear: null,
  });
  
  // 内容列表
  const articleList = ref([]);
  const postList = ref([]);
  const replyList = ref([]);
  
  // 分页信息
  const articlePageNum = ref(1);
  const postPageNum = ref(1);
  const replyPageNum = ref(1);
  
  // 加载状态
  const loading = ref({
    article: false,
    post: false,
    reply: false,
  });
  
  // 是否全部加载完成
  const allLoad = ref({
    article: false,
    post: false,
    reply: false,
  });
  
  /**
   * 设置作者数据
   * @param {Object} data - 作者数据
   */
  const setAuthorData = (data) => {
    authorData.value = { ...data };
  };
  
  /**
   * 设置文章列表
   * @param {Array} articles - 文章列表
   */
  const setArticleList = (articles) => {
    articleList.value = [...articles];
  };
  
  /**
   * 添加文章列表
   * @param {Array} articles - 文章列表
   */
  const addArticleList = (articles) => {
    articleList.value.push(...articles);
  };
  
  /**
   * 设置帖子列表
   * @param {Array} posts - 帖子列表
   */
  const setPostList = (posts) => {
    postList.value = [...posts];
  };
  
  /**
   * 添加帖子列表
   * @param {Array} posts - 帖子列表
   */
  const addPostList = (posts) => {
    postList.value.push(...posts);
  };
  
  /**
   * 设置回复列表
   * @param {Array} replies - 回复列表
   */
  const setReplyList = (replies) => {
    replyList.value = [...replies];
  };
  
  /**
   * 添加回复列表
   * @param {Array} replies - 回复列表
   */
  const addReplyList = (replies) => {
    replyList.value.push(...replies);
  };
  
  /**
   * 重置内容列表
   * @param {String} type - 内容类型
   */
  const resetContentList = (type) => {
    switch (type) {
      case 'article':
        articleList.value = [];
        articlePageNum.value = 1;
        allLoad.value.article = false;
        break;
      case 'post':
        postList.value = [];
        postPageNum.value = 1;
        allLoad.value.post = false;
        break;
      case 'reply':
        replyList.value = [];
        replyPageNum.value = 1;
        allLoad.value.reply = false;
        break;
    }
  };
  
  /**
   * 获取当前内容列表
   * @param {String} type - 内容类型
   * @returns {Array} 当前内容列表
   */
  const getCurrentList = (type) => {
    switch (type) {
      case 'article':
        return articleList.value;
      case 'post':
        return postList.value;
      case 'reply':
        return replyList.value;
      default:
        return [];
    }
  };
  
  return {
    authorData,
    articleList,
    postList,
    replyList,
    articlePageNum,
    postPageNum,
    replyPageNum,
    loading,
    allLoad,
    setAuthorData,
    setArticleList,
    addArticleList,
    setPostList,
    addPostList,
    setReplyList,
    addReplyList,
    resetContentList,
    getCurrentList,
  };
}

