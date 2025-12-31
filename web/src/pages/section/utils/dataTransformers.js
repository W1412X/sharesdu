/**
 * SectionPage 数据转换工具函数
 * 将 API 响应数据转换为组件所需格式
 */
import { responseToArticle } from '@/utils/other';

/**
 * 转换板块详情数据（板块就是文章）
 * @param {Object} response - API 返回的文章详情响应
 * @returns {Promise<Object>} 板块数据
 */
export async function transformSectionData(response) {
  const [articleData, editorType] = await responseToArticle(response);
  
  // 返回板块数据，包含content和editorType用于详情显示
  return {
    id: articleData.id,
    title: articleData.title,
    summary: articleData.summary || '',
    coverLink: articleData.coverLink || '',
    tags: articleData.tags || [],
    authorName: articleData.authorName,
    authorId: articleData.authorId,
    likeCount: articleData.likeCount,
    starCount: articleData.starCount,
    viewCount: articleData.viewCount,
    replyCount: articleData.replyCount,
    publishTime: articleData.publishTime,
    ifLike: articleData.ifLike,
    ifStar: articleData.ifStar,
    ifTop: articleData.ifTop,
    content: articleData.content, // 用于详情显示
    editorType: editorType, // 用于详情显示
    sectionName: articleData.section || '', // 板块名称（从 articleData.section 获取）
  };
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
