/**
 * 帖子列表轮询 Composable
 * 用于在 IndexPage 和 SectionPage 中轮询新帖子
 */
import { ref } from 'vue';
import { getNormalInfoAlert } from '@/utils/other';

/**
 * 帖子轮询 Composable
 * @param {Function} fetchFn - 获取帖子列表的函数，应返回 Promise，resolve 的值为 { status, post_list }
 * @param {Function} getPostList - 获取当前帖子列表的函数
 * @param {Function} setPostList - 设置帖子列表的函数，接收 (newPosts) => void，用于在列表顶部插入新帖子
 * @param {Function} alert - 消息提示函数
 * @param {Object} options - 配置选项
 * @param {Number} options.interval - 轮询间隔（毫秒），默认 60000（1分钟）
 * @returns {Object} 返回控制函数 { startPolling, stopPolling, resetBaseline, isPolling }
 */
export function usePostPolling(fetchFn, getPostList, setPostList, alert, options = {}) {
  const {
    interval = 60000, // 默认 1 分钟
  } = options;

  const pollingTimer = ref(null);
  const isPolling = ref(false);
  const lastFirstPostId = ref(null); // 记录当前列表第一个帖子的 ID

  /**
   * 转换 API 响应中的帖子数据为标准格式
   * @param {Object} postItem - API 返回的帖子项
   * @returns {Object} 标准格式的帖子项
   */
  const transformPostItem = (postItem) => {
    return {
      id: postItem.post_id,
      title: postItem.post_title,
      content: postItem.post_content,
      authorId: postItem.poster_id,
      authorName: postItem.poster_name,
      viewNum: postItem.view_count,
      likeNum: postItem.like_count,
      replyNum: postItem.reply_count,
      publishTime: postItem.publish_time,
      ifLike: postItem.if_like,
      ifStar: postItem.if_star,
      ifTop: postItem.if_top,
    };
  };

  /**
   * 执行轮询，获取新帖子
   */
  const pollForNewPosts = async () => {
    if (isPolling.value) {
      console.log('[PostPolling] 轮询进行中，跳过本次执行');
      return; // 防止重复轮询
    }

    try {
      console.log('[PostPolling] 开始轮询新帖子...');
      isPolling.value = true;
      
      // 获取第一页帖子列表（不使用缓存）
      const response = await fetchFn(1, false);
      console.log('[PostPolling] 获取帖子列表响应:', response.status, response.post_list?.length || 0, '条');
      
      if (response.status !== 200) {
        console.log('[PostPolling] 请求失败，状态码:', response.status);
        // 如果请求失败，静默处理，不干扰用户
        return;
      }

      if (!response.post_list || response.post_list.length === 0) {
        // 如果没有帖子，更新基准 ID 为 null
        lastFirstPostId.value = null;
        return;
      }

      // 转换帖子数据
      const newPosts = response.post_list.map(transformPostItem);

      // 获取当前帖子列表
      const currentPostList = getPostList();

      // 如果还没有基准 ID，设置第一个帖子的 ID 作为基准
      if (lastFirstPostId.value === null && currentPostList.length > 0) {
        lastFirstPostId.value = currentPostList[0].id;
      }

      // 如果基准 ID 为 null 且当前列表为空，只更新基准，不插入新帖子
      if (lastFirstPostId.value === null) {
        lastFirstPostId.value = newPosts[0].id;
        return;
      }

      // 找出新帖子（ID 不在当前列表中的帖子，或者 ID 等于基准 ID 之前的帖子）
      const existingIds = new Set(currentPostList.map(post => post.id));
      const newPostItems = [];
      
      for (let i = 0; i < newPosts.length; i++) {
        const post = newPosts[i];
        
        // 如果遇到基准 ID，说明后面的帖子都是旧的，停止查找
        if (post.id === lastFirstPostId.value) {
          break;
        }
        
        // 如果这个帖子不在现有列表中，说明是新帖子
        if (!existingIds.has(post.id)) {
          newPostItems.push(post);
        }
      }

      // 如果有新帖子，插入到列表顶部并提示用户
      if (newPostItems.length > 0) {
        console.log('[PostPolling] 发现', newPostItems.length, '条新帖子，ID:', newPostItems.map(p => p.id));
        // 将新帖子插入到列表顶部
        setPostList(newPostItems);
        
        // 获取更新后的列表，更新基准 ID
        const updatedList = getPostList();
        if (updatedList.length > 0) {
          lastFirstPostId.value = updatedList[0].id;
          console.log('[PostPolling] 更新基准 ID:', lastFirstPostId.value);
        }
        
        // 提示用户
        const message = `发现 ${newPostItems.length} 条新帖子`;
        alert(getNormalInfoAlert(message));
      } else {
        console.log('[PostPolling] 没有新帖子');
        // 即使没有新帖子，也要更新基准 ID（防止基准 ID 过期）
        if (newPosts.length > 0) {
          lastFirstPostId.value = newPosts[0].id;
          console.log('[PostPolling] 更新基准 ID:', lastFirstPostId.value);
        }
      }
    } catch (error) {
      // 错误静默处理，不干扰用户
      console.error('[PostPolling] 轮询帖子列表失败:', error);
    } finally {
      isPolling.value = false;
    }
  };

  /**
   * 启动轮询
   */
  const startPolling = () => {
    console.log('[PostPolling] 启动轮询，间隔:', interval, 'ms');
    
    // 如果已经有定时器在运行，先停止
    if (pollingTimer.value) {
      console.log('[PostPolling] 检测到已有定时器，先停止');
      stopPolling();
    }
    
    // 如果列表已有数据，设置基准 ID
    const currentList = getPostList();
    console.log('[PostPolling] 当前帖子列表长度:', currentList.length);
    if (currentList.length > 0) {
      lastFirstPostId.value = currentList[0].id;
      console.log('[PostPolling] 设置基准 ID:', lastFirstPostId.value);
    } else {
      console.log('[PostPolling] 当前列表为空，基准 ID 将在首次轮询后设置');
    }

    // 立即执行一次轮询
    console.log('[PostPolling] 立即执行首次轮询');
    pollForNewPosts();

    // 设置定时器，每隔指定时间轮询一次
    pollingTimer.value = setInterval(() => {
      console.log('[PostPolling] 定时轮询执行');
      pollForNewPosts();
    }, interval);
    
    console.log('[PostPolling] 定时器已设置，pollingTimer:', pollingTimer.value);
  };

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    console.log('[PostPolling] 停止轮询，pollingTimer:', pollingTimer.value);
    if (pollingTimer.value) {
      clearInterval(pollingTimer.value);
      pollingTimer.value = null;
      console.log('[PostPolling] 定时器已清除');
    }
    isPolling.value = false;
  };

  /**
   * 重置基准 ID（用于列表刷新后）
   */
  const resetBaseline = () => {
    const currentList = getPostList();
    if (currentList.length > 0) {
      lastFirstPostId.value = currentList[0].id;
    } else {
      lastFirstPostId.value = null;
    }
  };

  return {
    startPolling,
    stopPolling,
    resetBaseline,
    isPolling,
  };
}

