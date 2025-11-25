/**
 * CoursePage 数据管理 Composable
 */
import { ref } from 'vue';

export function useCourseData() {
  // 课程数据
  const course = ref({
    id: null,
    name: null,
    type: null,
    campus: null,
    college: null,
    teacher: null,
    credit: null,
    examineMethod: null,
    attendMethod: null,
    evaluateNum: 0,
    avgScore: 0,
    scoreDistribution: [],
    publishTime: null,
  });
  
  // 用户自己的评价
  const selfComment = ref({
    score: null,
    comment: null,
  });
  
  // 原始评价（用于取消编辑时恢复）
  const oriSelfComment = ref({
    score: null,
    comment: null,
  });
  
  // 是否已评价
  const ifRated = ref(false);
  
  // 评论列表
  const commentList = ref([]);
  const commentPageNum = ref(1);
  
  // 帖子列表
  const postItems = ref([]);
  const postPageNum = ref(1);
  
  // 加载状态
  const loading = ref({
    loadEvaluation: false,
    post: false,
    submitEvaluation: false,
  });
  
  // 是否全部加载完成
  const allLoad = ref({
    comment: false,
    post: false,
  });
  
  // 加载状态
  const loadState = ref({
    course: false,
    selfComment: false,
  });
  
  // 海报图片URL
  const posterImageUrl = ref('');
  
  /**
   * 设置课程数据
   * @param {Object} courseData - 课程数据
   */
  const setCourse = (courseData) => {
    course.value = { ...courseData };
  };
  
  /**
   * 设置用户评价
   * @param {Object} comment - 评价数据
   */
  const setSelfComment = (comment) => {
    selfComment.value = { ...comment };
    oriSelfComment.value = { ...comment };
  };
  
  /**
   * 更新用户评价
   * @param {Object} comment - 评价数据
   */
  const updateSelfComment = (comment) => {
    selfComment.value = { ...comment };
  };
  
  /**
   * 恢复原始评价
   */
  const resetSelfComment = () => {
    selfComment.value = { ...oriSelfComment.value };
  };
  
  /**
   * 设置已评价状态
   * @param {Boolean} rated - 是否已评价
   */
  const setIfRated = (rated) => {
    ifRated.value = rated;
  };
  
  /**
   * 添加评论到列表
   * @param {Array} comments - 评论列表
   */
  const addComments = (comments) => {
    commentList.value.push(...comments);
  };
  
  /**
   * 设置评论列表
   * @param {Array} comments - 评论列表
   */
  const setComments = (comments) => {
    commentList.value = [...comments];
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
    const index = postItems.value.findIndex(item => item.id === msg.id);
    if (index === -1) return;
    
    const post = { ...postItems.value[index] };
    post.ifTop = msg.top;
    
    postItems.value.splice(index, 1);
    
    if (msg.top) {
      // 置顶：放到最前面
      postItems.value.unshift(post);
    } else {
      // 取消置顶：放到第一个非置顶帖子之前
      const firstNonTopIndex = postItems.value.findIndex(item => !item.ifTop);
      if (firstNonTopIndex === -1) {
        postItems.value.push(post);
      } else {
        postItems.value.splice(firstNonTopIndex, 0, post);
      }
    }
  };
  
  return {
    course,
    selfComment,
    oriSelfComment,
    ifRated,
    commentList,
    commentPageNum,
    postItems,
    postPageNum,
    loading,
    allLoad,
    loadState,
    posterImageUrl,
    setCourse,
    setSelfComment,
    updateSelfComment,
    resetSelfComment,
    setIfRated,
    addComments,
    setComments,
    addPost,
    addPosts,
    setPosts,
    setPostTop,
  };
}

