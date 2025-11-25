/**
 * EditorPage 数据管理 Composable
 */
import { ref } from 'vue';

export function useEditorData() {
  // 文章ID
  const articleId = ref('');
  
  // 编辑器数据
  const editorData = ref({
    title: '',
    content: '',
  });
  
  // 编辑器工具栏数据
  const editorBarData = ref({
    summary: '',
    type: '',
    tags: [],
    originLink: '',
    coverLink: '',
    sourceUrl: '',
  });
  
  // HTML 编辑器数据
  const htmlData = ref({
    content: '',
  });
  
  // Markdown 编辑器数据
  const mdData = ref({
    content: '',
  });
  
  /**
   * 设置文章ID
   * @param {String} id - 文章ID
   */
  const setArticleId = (id) => {
    articleId.value = id || '';
  };
  
  /**
   * 设置编辑器标题
   * @param {String} title - 标题
   */
  const setTitle = (title) => {
    editorData.value.title = title || '';
  };
  
  /**
   * 设置编辑器内容
   * @param {String} content - 内容
   */
  const setContent = (content) => {
    editorData.value.content = content || '';
  };
  
  /**
   * 设置HTML编辑器内容
   * @param {String} content - HTML内容
   */
  const setHtmlContent = (content) => {
    htmlData.value.content = content || '';
  };
  
  /**
   * 设置Markdown编辑器内容
   * @param {String} content - Markdown内容
   */
  const setMdContent = (content) => {
    mdData.value.content = content || '';
  };
  
  /**
   * 设置编辑器工具栏数据
   * @param {Object} data - 工具栏数据
   */
  const setEditorBarData = (data) => {
    editorBarData.value = {
      summary: data.summary || '',
      type: data.type || '',
      tags: Array.isArray(data.tags) ? [...data.tags] : [],
      originLink: data.originLink || '',
      coverLink: data.coverLink || '',
      sourceUrl: data.sourceUrl || '',
    };
  };
  
  /**
   * 获取当前编辑器内容
   * @param {String} type - 编辑器类型（html/md）
   * @returns {String} 内容
   */
  const getCurrentContent = (type) => {
    if (type === 'md') {
      return mdData.value.content;
    }
    return htmlData.value.content;
  };
  
  return {
    articleId,
    editorData,
    editorBarData,
    htmlData,
    mdData,
    setArticleId,
    setTitle,
    setContent,
    setHtmlContent,
    setMdContent,
    setEditorBarData,
    getCurrentContent,
  };
}


