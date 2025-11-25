/**
 * ArticlePage 数据转换工具函数
 * 将 API 响应数据转换为组件所需格式
 */
import { responseToArticle } from '@/utils/other';

/**
 * 转换文章详情数据
 * @param {Object} response - API 返回的文章详情响应
 * @returns {Promise<Array>} [article, editorType]
 */
export async function transformArticleData(response) {
  return await responseToArticle(response);
}

/**
 * 转换帖子列表数据
 * @param {Array} postList - API 返回的帖子列表
 * @returns {Array} 转换后的帖子列表
 */
export function transformPostList(postList) {
  if (!Array.isArray(postList)) {
    return [];
  }
  
  return postList.map(item => ({
    id: item.post_id,
    title: item.post_title,
    content: item.post_content,
    authorId: item.poster_id,
    authorName: item.poster_name,
    viewNum: item.view_count,
    likeNum: item.like_count,
    replyNum: item.reply_count,
    publishTime: item.publish_time,
    ifLike: item.if_like,
    ifStar: item.if_star,
    ifTop: item.if_top,
  }));
}

