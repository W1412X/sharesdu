/**
 * 搜索数据转换工具函数
 * 将 API 响应数据转换为组件所需格式
 */
import { formatRelativeTime } from '@/utils/other';

/**
 * 转换文章搜索结果
 * @param {Array} results - API 返回的文章列表
 * @returns {Array} 转换后的文章列表
 */
export function transformArticleResults(results) {
  if (!Array.isArray(results)) {
    return [];
  }
  
  return results.map(item => ({
    itemType: 'article',
    id: item.article_id,
    title: item.article_title,
    summary: item.article_summary,
    starNum: item.star_count,
    viewNum: item.view_count,
    likeNum: item.likes_count,
    publishTime: item.publish_time,
    tags: item.article_tags,
    authorName: item.author_name,
    authorId: item.author_id,
    coverLink: item.cover_link,
    type: item.article_type,
    hotScore: item.hot_score,
  }));
}

/**
 * 转换帖子搜索结果
 * @param {Array} results - API 返回的帖子列表
 * @returns {Array} 转换后的帖子列表
 */
export function transformPostResults(results) {
  if (!Array.isArray(results)) {
    return [];
  }
  
  return results.map(item => ({
    itemType: 'post',
    id: item.post_id,
    title: item.post_title,
    content: item.post_content,
    authorId: item.poster_id,
    authorName: item.poster_name,
    viewNum: item.view_count,
    likeNum: item.likes_count,
    replyNum: item.reply_count,
    publishTime: item.publish_time,
    ifLike: item.if_like,
    ifStar: item.if_star,
  }));
}

/**
 * 转换课程搜索结果
 * @param {Array} results - API 返回的课程列表
 * @returns {Array} 转换后的课程列表
 */
export function transformCourseResults(results) {
  if (!Array.isArray(results)) {
    return [];
  }
  
  return results.map(item => {
    let tmpType = '';
    switch (item.course_type) {
      case 'compulsory':
        tmpType = '必修';
        break;
      case 'elective':
        tmpType = '选修';
        break;
      case 'restricted_elective':
        tmpType = '限选';
        break;
    }
    
    let tmpMethod = '';
    switch (item.course_method) {
      case 'online':
        tmpMethod = '线上';
        break;
      case 'offline':
        tmpMethod = '线下';
        break;
      case 'hybrid':
        tmpMethod = '混合';
        break;
    }
    
    return {
      itemType: 'course',
      id: item.course_id,
      name: item.course_name,
      type: tmpType,
      college: item.college,
      credit: item.credits,
      campus: item.campus,
      teacher: item.teacher,
      attendMethod: tmpMethod,
      examineMethod: item.assessment_method,
      score: item.score,
      scoreSum: item.all_score,
      evaluateNum: item.all_people,
      publishTime: item.publish_time,
    };
  });
}

/**
 * 转换回复搜索结果
 * @param {Array} results - API 返回的回复列表
 * @returns {Array} 转换后的回复列表
 */
export function transformReplyResults(results) {
  if (!Array.isArray(results)) {
    return [];
  }
  
  return results.map(item => ({
    itemType: 'reply',
    id: item.reply_id,
    content: item.reply_content,
    postId: item.post_id,
    postTitle: item.post_title,
    authorName: item.replier_name,
    authorId: item.replier_id,
    publishTime: formatRelativeTime(item.reply_time),
  }));
}

/**
 * 转换全局搜索结果
 * @param {Array} results - API 返回的全局搜索结果
 * @returns {Array} 转换后的结果列表
 */
export function transformGlobalResults(results) {
  if (!Array.isArray(results)) {
    return [];
  }
  
  return results.map(item => {
    const tmp = {
      type: item.type,
      id: item.id,
    };
    
    switch (item.type) {
      case 'article':
        tmp.articleTitle = item.title;
        tmp.articleSummary = item.summary;
        tmp.articleAuthor = item.author;
        break;
      case 'post':
        tmp.postTitle = item.title;
        tmp.postContent = item.content;
        tmp.postAuthor = item.author;
        break;
      case 'reply':
        tmp.replyContent = item.content;
        tmp.replyPostId = item.post_id;
        tmp.replyPostTitle = item.post_title;
        break;
      case 'course':
        tmp.courseName = item.name;
        tmp.courseCollege = item.college;
        tmp.courseTeacher = item.teacher;
        break;
    }
    
    return tmp;
  });
}
