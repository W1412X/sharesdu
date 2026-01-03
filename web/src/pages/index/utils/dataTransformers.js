/**
 * 数据转换工具函数
 * 将 API 响应数据转换为组件所需格式
 */

/**
 * 转换文章列表数据
 * @param {Array} articleList - API 返回的文章列表
 * @returns {Array} 转换后的文章列表
 */
export function transformArticleList(articleList) {
  if (!Array.isArray(articleList)) {
    return [];
  }
  
  return articleList.map(item => ({
    id: item.article_id,
    title: item.article_title,
    summary: item.article_summary,
    starNum: item.star_count,
    viewNum: item.view_count,
    likeNum: item.like_count,
    publishTime: item.publish_time,
    tags: item.article_tags,
    authorName: item.author_name,
    authorId: item.author_id,
    coverLink: item.cover_link,
    type: item.article_type,
    hotScore: item.hot_score,
    ifTop: item.if_top,
    section: item.article_section,
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
  }));
}

/**
 * 转换课程列表数据
 * @param {Array} courseList - API 返回的课程列表
 * @returns {Array} 转换后的课程列表
 */
export function transformCourseList(courseList) {
  if (!Array.isArray(courseList)) {
    return [];
  }
  
  return courseList.map(item => ({
    id: item.course_id,
    name: item.course_name,
    type: item.course_type,
    college: item.college,
    credit: item.credits,
    campus: item.campus,
    teacher: item.teacher,
    attendMethod: item.course_method,
    examineMethod: item.assessment_method,
    score: item.score,
    scoreSum: item.all_score,
    evaluateNum: item.all_people,
    publishTime: item.publish_time,
  }));
}

/**
 * 转换板块列表数据
 * @param {Array} sectionList - API 返回的板块列表
 * @returns {Array} 转换后的板块列表
 */
export function transformSectionList(sectionList) {
  if (!Array.isArray(sectionList)) {
    return [];
  }
  
  return sectionList.map(item => ({
    id: item.article_id,
    title: item.article_title || '未命名板块',
    summary: item.article_summary || '暂无简介',
    coverLink: item.cover_link || null,
    publishTime: item.publish_time || '',
    sectionName: item.article_section || 'default',
    ifTop: item.if_top || false,
    postCount: 0, // 暂时设为0，如果API返回则使用实际值
  }));
}


