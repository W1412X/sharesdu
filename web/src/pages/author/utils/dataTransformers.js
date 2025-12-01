/**
 * AuthorPage 数据转换工具函数
 * 将 API 响应数据转换为组件所需格式
 */
import { formatRelativeTime } from '@/utils/other';

/**
 * 转换作者信息数据
 * @param {Object} response - API 返回的作者信息响应
 * @returns {Object} 转换后的作者数据
 */
export function transformAuthorData(response) {
  if (!response || !response.data) {
    return null;
  }
  
  const data = response.data;
  return {
    id: data.user_id,
    name: data.user_name,
    email: data.email,
    reputation: data.reputation,
    reputationLevel: data.reputation_level,
    master: data.master,
    superMaster: data.superMaster,
    campus: data.campus || '未知校区',
    college: data.college || '未知学院',
    major: data.major || '未知专业',
    articleNum: data.all_articles,
    postNum: data.all_posts,
    replyNum: data.all_replys,
    blockStatus: data.block_status,
    blockEndTime: data.block_end_time,
    registerTime: formatRelativeTime(data.created_at),
    registerYear: data.registration_year,
  };
}

/**
 * 转换文章列表数据（预览模式）
 * @param {Array} articles - API 返回的文章列表
 * @returns {Array} 转换后的文章列表
 */
export function transformArticlePreviewList(articles) {
  if (!Array.isArray(articles)) {
    return [];
  }
  
  return articles.map(item => ({
    type: 'article',
    id: item.id,
    title: item.title,
    summary: item.summary,
    hotScore: item.hot_score,
    replyNum: item.reply_count,
    time: formatRelativeTime(item.publish_time),
  }));
}

/**
 * 转换帖子列表数据（预览模式）
 * @param {Array} posts - API 返回的帖子列表
 * @returns {Array} 转换后的帖子列表
 */
export function transformPostPreviewList(posts) {
  if (!Array.isArray(posts)) {
    return [];
  }
  
  return posts.map(item => ({
    type: 'post',
    id: item.id,
    title: item.title,
    content: item.content_preview,
    time: formatRelativeTime(item.publish_time),
  }));
}

/**
 * 转换回复列表数据（预览模式）
 * @param {Array} replies - API 返回的回复列表
 * @returns {Array} 转换后的回复列表
 */
export function transformReplyPreviewList(replies) {
  if (!Array.isArray(replies)) {
    return [];
  }
  
  return replies.map(item => ({
    type: 'reply',
    id: item.id,
    title: item.content_preview,
    time: formatRelativeTime(item.publish_time),
    postId: item.post_id,
  }));
}

/**
 * 转换用户内容列表数据（全部模式）
 * @param {Array} results - API 返回的内容列表
 * @param {String} contentType - 内容类型（article/post/reply）
 * @returns {Array} 转换后的内容列表
 */
export function transformUserContentList(results, contentType) {
  if (!Array.isArray(results)) {
    return [];
  }
  
  switch (contentType) {
    case 'article':
      return results.map(item => ({
        type: 'article',
        id: item.id,
        title: item.title,
        summary: item.summary,
        hotScore: item.hot_score,
        replyNum: item.reply_count,
        time: formatRelativeTime(item.publish_time),
      }));
      
    case 'post':
      return results.map(item => ({
        type: 'post',
        id: item.id,
        title: item.title,
        content: item.content_preview,
        time: formatRelativeTime(item.publish_time),
      }));
      
    case 'reply':
      return results.map(item => ({
        type: 'reply',
        id: item.id,
        title: item.content_preview,
        time: formatRelativeTime(item.publish_time),
        postId: item.post_id,
      }));
      
    default:
      return [];
  }
}

