/**
 * 数据转换工具函数
 * 将 API 响应数据转换为组件所需格式
 */

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
    sectionName: item.article_section || item.article_title || '未命名板块',
    coverLink: item.cover_link || null,
    publishTime: item.publish_time || '',
    postCount: item.post_count || 0,
    description: item.article_summary || '',
  }));
}

