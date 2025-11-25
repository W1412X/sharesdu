/**
 * ArticlePage 数据管理 Composable
 */
// eslint-disable-next-line no-unused-vars
import { ref, computed } from 'vue';

export function useArticleData() {
  // 文章数据
  const article = ref({
    id: '',
    title: '',
    content: '',
    summary: '',
    coverLink: '',
    originLink: '',
    tags: [],
    type: '',
    authorName: '',
    authorId: '',
    likeCount: 0,
    starCount: 0,
    viewCount: 0,
    replyCount: 0,
    hotScore: 0,
    sourceUrl: '',
    publishTime: '',
    ifLike: false,
    ifStar: false,
    ifTop: false,
  });
  
  // 文章响应原始数据
  const articleResponse = ref(null);
  
  // 帖子列表
  const postItems = ref([]);
  
  // 分页信息
  const postPageNum = ref(1);
  
  // 加载状态
  const loading = ref({
    post: false,
    top: false,
  });
  
  // 是否全部加载完成
  const allLoad = ref({
    post: false,
  });
  
  /**
   * 设置文章数据
   * @param {Object} articleData - 文章数据
   */
  const setArticle = (articleData) => {
    article.value = { ...articleData };
  };
  
  /**
   * 添加帖子到列表
   * @param {Object} post - 帖子数据
   */
  const addPost = (post) => {
    postItems.value.unshift(post);
  };
  
  /**
   * 添加帖子列表
   * @param {Array} posts - 帖子列表
   */
  const addPosts = (posts) => {
    postItems.value.push(...posts);
  };
  
  /**
   * 设置帖子列表
   * @param {Array} posts - 帖子列表
   */
  const setPosts = (posts) => {
    postItems.value = [...posts];
  };
  
  /**
   * 更新帖子置顶状态
   * @param {Object} msg - {id, top}
   */
  const setPostTop = (msg) => {
    const index = postItems.value.findIndex(p => p.id === msg.id);
    if (index === -1) return;
    
    const post = { ...postItems.value[index] };
    post.ifTop = msg.top;
    
    postItems.value.splice(index, 1);
    
    if (msg.top) {
      // 置顶：放到最前面
      postItems.value.unshift(post);
    } else {
      // 取消置顶：放到第一个非置顶帖子后面
      const firstNonTopIndex = postItems.value.findIndex(p => !p.ifTop);
      if (firstNonTopIndex === -1) {
        postItems.value.push(post);
      } else {
        postItems.value.splice(firstNonTopIndex, 0, post);
      }
    }
  };
  
  /**
   * 重置帖子列表
   */
  const resetPosts = () => {
    postItems.value = [];
    postPageNum.value = 1;
    allLoad.value.post = false;
  };
  
  return {
    article,
    articleResponse,
    postItems,
    postPageNum,
    loading,
    allLoad,
    setArticle,
    addPost,
    addPosts,
    setPosts,
    setPostTop,
    resetPosts,
  };
}

