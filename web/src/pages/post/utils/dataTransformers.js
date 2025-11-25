/**
 * PostPage 数据转换工具函数
 * 将 API 响应数据转换为组件所需格式
 */
import { extractImageLinksInBrackets, getLinkInPost } from '@/utils/other';

/**
 * 转换帖子详情数据
 * @param {Object} response - API 返回的帖子详情响应
 * @returns {Object|null} 转换后的帖子数据
 */
export function transformPostData(response) {
  if (!response || response.status !== 200 || !response.post_detail) {
    return null;
  }

  const detail = response.post_detail;
  const content = detail.post_content || '';
  
  return {
    id: detail.post_id,
    title: detail.post_title,
    content: content,
    authorId: detail.poster_id,
    authorName: detail.poster_name,
    likeNum: detail.like_count,
    replyNum: detail.reply_count,
    viewNum: detail.view_count,
    publishTime: detail.publish_time,
    ifLike: detail.if_like,
    ifStar: detail.if_star,
    imgList: extractImageLinksInBrackets(content),
    relativeLink: getLinkInPost(content),
  };
}

/**
 * 转换回复列表数据
 * @param {Object} response - API 返回的回复列表响应
 * @returns {Array} 转换后的回复列表
 */
export function transformReplyList(response) {
  if (!response || response.status !== 200 || !Array.isArray(response.reply_list)) {
    return [];
  }

  return response.reply_list.map(item => ({
    id: item.reply_id,
    content: item.reply_content,
    authorName: item.replier_name,
    authorId: item.replier_id,
    likeNum: item.like_count,
    publishTime: item.reply_time,
    ifLike: item.if_like || false,
  }));
}

/**
 * 转换回复详情数据
 * @param {Object} response - API 返回的回复详情响应
 * @returns {Object|null} 转换后的回复数据
 */
export function transformReplyDetail(response) {
  if (!response || (response.status !== 200 && response.status !== 201) || !response.reply_detail) {
    return null;
  }

  const detail = response.reply_detail;
  return {
    id: detail.reply_id,
    content: detail.reply_content,
    authorName: detail.replier_name,
    authorId: detail.replier_id,
    likeNum: detail.like_count,
    publishTime: detail.reply_time,
    ifLike: detail.if_like || false,
  };
}


