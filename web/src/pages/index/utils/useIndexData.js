/**
 * IndexPage 数据管理 Composable
 */
import { ref, shallowRef } from 'vue';
import { transformArticleList, transformPostList, transformCourseList } from './dataTransformers';

export function useIndexData() {
  // 文章列表（按排序方式分类）
  const articleList = shallowRef({
    time: [],
    star: [],
    view: [],
    hot: [],
  });

  // 帖子列表
  const postList = ref([]);

  // 课程列表
  const courseList = ref([]);

  // 分页信息
  const articlePageNum = ref({
    time: 1,
    star: 1,
    view: 1,
    hot: 1,
  });

  const postPageNum = ref(1);
  const coursePageNum = ref(1);

  // 加载状态
  const loading = ref({
    article: false,
    course: false,
    post: false,
  });

  // 是否全部加载完成
  const allLoad = ref({
    article: {
      time: false,
      star: false,
      view: false,
      hot: false,
    },
    course: false,
    post: false,
  });

  /**
   * 添加文章到列表
   * @param {String} sortMethod - 排序方式
   * @param {Array} articles - 文章数组
   */
  const addArticles = (sortMethod, articles) => {
    const transformed = transformArticleList(articles);
    articleList.value[sortMethod].push(...transformed);
  };

  /**
   * 设置文章列表
   * @param {String} sortMethod - 排序方式
   * @param {Array} articles - 文章数组
   */
  const setArticles = (sortMethod, articles) => {
    articleList.value[sortMethod] = transformArticleList(articles);
  };

  /**
   * 添加帖子到列表
   * @param {Array} posts - 帖子数组
   */
  const addPosts = (posts) => {
    const transformed = transformPostList(posts);
    postList.value.push(...transformed);
  };

  /**
   * 设置帖子列表
   * @param {Array} posts - 帖子数组
   */
  const setPosts = (posts) => {
    postList.value = transformPostList(posts);
  };

  /**
   * 添加课程到列表
   * @param {Array} courses - 课程数组
   */
  const addCourses = (courses) => {
    const transformed = transformCourseList(courses);
    courseList.value.push(...transformed);
  };

  /**
   * 设置课程列表
   * @param {Array} courses - 课程数组
   */
  const setCourses = (courses) => {
    courseList.value = transformCourseList(courses);
  };

  /**
   * 添加新帖子（用于编辑器添加后）
   * @param {Object} post - 帖子对象
   */
  const addPost = (post) => {
    postList.value.unshift(post);
  };

  return {
    articleList,
    postList,
    courseList,
    articlePageNum,
    postPageNum,
    coursePageNum,
    loading,
    allLoad,
    addArticles,
    setArticles,
    addPosts,
    setPosts,
    addCourses,
    setCourses,
    addPost,
  };
}


