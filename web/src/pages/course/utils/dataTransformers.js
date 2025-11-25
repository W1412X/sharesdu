/**
 * CoursePage 数据转换工具函数
 * 将 API 响应数据转换为组件所需格式
 */
import { roundNumber } from '@/utils/other';

/**
 * 转换课程详情数据
 * @param {Object} response - API 返回的课程详情响应
 * @returns {Object} 转换后的课程数据
 */
export function transformCourseData(response) {
  if (!response || !response.course_detail) {
    return null;
  }
  
  const detail = response.course_detail;
  let avgScore = 0;
  if (detail.all_people !== 0) {
    avgScore = detail.all_score / detail.all_people;
  }
  avgScore = roundNumber(avgScore, 1);
  
  return {
    id: detail.course_id,
    name: detail.course_name,
    type: detail.course_type,
    credit: detail.credits,
    teacher: detail.course_teacher,
    attendMethod: detail.course_method,
    examineMethod: detail.assessment_method,
    publishTime: detail.publish_time,
    campus: detail.campus,
    college: detail.college,
    evaluateNum: detail.all_people,
    avgScore: avgScore,
    scoreDistribution: detail.score_distribution || [],
  };
}

/**
 * 转换评论列表数据
 * @param {Array} scoreList - API 返回的评分列表
 * @param {String} currentUserId - 当前用户ID（用于过滤自己的评论）
 * @returns {Array} 转换后的评论列表
 */
export function transformCommentList(scoreList, currentUserId) {
  if (!Array.isArray(scoreList)) {
    return [];
  }
  
  return scoreList
    .filter(item => item.scorer_id !== currentUserId)
    .map(item => ({
      id: item.review_id,
      authorId: item.scorer_id,
      authorName: item.scorer_name,
      score: item.score,
      comment: item.comment,
      time: item.publish_time,
    }));
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

/**
 * 转换用户评价数据
 * @param {Object} response - API 返回的用户评价响应
 * @returns {Object|null} 转换后的用户评价数据
 */
export function transformSelfComment(response) {
  if (!response || response.status !== 200) {
    return null;
  }
  
  return {
    score: response.score,
    comment: response.comment,
  };
}

