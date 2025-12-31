/**
 * EditorPage 数据转换工具函数
 * 将 API 响应数据转换为组件所需格式
 */
import { extractEditorType, getContentWithoutEditorType } from '@/utils/other';

/**
 * 转换文章详情数据
 * @param {Object} response - API 返回的文章详情响应
 * @returns {Object|null} 转换后的文章数据
 */
export function transformArticleData(response) {
  if (!response || response.status !== 200 || !response.article_detail) {
    return null;
  }

  const article = response.article_detail;
  const editorType = extractEditorType(article.article_content);
  const content = getContentWithoutEditorType(article.article_content);
  
  return {
    articleId: article.article_id,
    title: article.article_title,
    content: content,
    editorType: editorType,
    editorBarData: {
      articleSection: (article.article_section && article.article_section !== 'default') ? article.article_section : '',
      summary: article.article_summary || '',
      tags: Array.isArray(article.article_tags) ? article.article_tags : [],
      coverLink: article.cover_link || '',
    },
  };
}


