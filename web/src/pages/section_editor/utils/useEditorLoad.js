/**
 * EditorPage 加载和提交逻辑 Composable
 */
import { createArticle, editArticle, getArticleDetail } from '@/api/modules/article';
import { uploadArticleImage } from '@/api/modules/image';
import {
  addEditorType,
  arrToString,
  getCancelLoadMsg,
  getLoadMsg,
  getNormalErrorAlert,
  openPage,
} from '@/utils/other';
import { transformArticleData } from './dataTransformers';

export function useEditorLoad(
  articleId,
  editorData,
  editorBarData,
  htmlData,
  mdData,
  editorType,
  apiUrl,
  htmlEditorRef,
  mdEditorRef,
  sectionInfoEditorRef,
  ifSubmit,
  setArticleId,
  setTitle,
  setHtmlContent,
  setMdContent,
  setEditorBarData,
  setEditorType,
  setEditFinishCardState,
  setLoading,
  alert
) {
  /**
   * 加载文章详情（编辑模式）
   * @param {String} id - 文章ID
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadArticle = async (id) => {
    try {
      const response = await getArticleDetail(id);
      
      if (response.status === 200) {
        const transformed = transformArticleData(response);
        if (transformed) {
          setArticleId(transformed.articleId);
          setEditorType(transformed.editorType);
          
          if (transformed.editorType === 'html') {
            setHtmlContent(transformed.content);
          } else {
            setMdContent(transformed.content);
          }
          
          setEditorBarData(transformed.editorBarData);
          // 板块文章的标题等于板块名称
          const sectionName = transformed.editorBarData?.articleSection;
          if (sectionName && sectionName.trim() && sectionName !== 'default') {
            setTitle(sectionName);
          } else {
            setTitle(transformed.title || '');
          }
          
          alert({
            state: true,
            color: 'info',
            title: '加载成功',
            content: '已加载编辑器',
          });
          
          return true;
        }
      } else {
        alert(getNormalErrorAlert(response.message));
        openPage('router', {
          name: 'ErrorPage',
          params: { reason: '无法找到该文章' },
        });
        return false;
      }
    } catch (error) {
      alert(getNormalErrorAlert('表单格式化错误'));
      return false;
    }
  };
  
  /**
   * 上传文章图片
   * @param {Object} imageDict - 图片字典（本地URL -> File对象）
   * @param {String} content - 当前编辑器内容
   * @param {String} type - 编辑器类型（html/md）
   * @returns {Promise<Object>} { success: boolean, updatedContent: string }
   */
  // eslint-disable-next-line no-unused-vars
  const uploadArticleImages = async (imageDict, content, type) => {
    if (!imageDict || Object.keys(imageDict).length === 0) {
      return { success: true, updatedContent: content };
    }
    
    const oriLocalUrls = JSON.parse(JSON.stringify(Object.keys(imageDict)));
    const validLocalUrls = oriLocalUrls.filter((url) => content.includes(url));
    
    if (validLocalUrls.length === 0) {
      return { success: true, updatedContent: content };
    }
    
    let updatedContent = content;
    setLoading(getLoadMsg(`正在上传图片 0/${validLocalUrls.length}`));
    
    try {
      for (let i = 0; i < validLocalUrls.length; i++) {
        setLoading(getLoadMsg(`正在上传图片 ${i + 1}/${validLocalUrls.length}`));
        
        const response = await uploadArticleImage(imageDict[validLocalUrls[i]]);
        
        if (response.status === 200 || response.status === 201) {
          updatedContent = updatedContent.replaceAll(
            validLocalUrls[i],
            apiUrl + response.data.image_url
          );
        } else {
          setLoading(getCancelLoadMsg());
          alert(getNormalErrorAlert('文章图片上传失败'));
          return { success: false, updatedContent: content };
        }
      }
      
      // 清理本地 URL
      try {
        for (let i = 0; i < oriLocalUrls.length; i++) {
          URL.revokeObjectURL(oriLocalUrls[i]);
        }
      } catch (e) {
        // 忽略清理错误
      }
      
      setLoading(getCancelLoadMsg());
      return { success: true, updatedContent };
    } catch (error) {
      setLoading(getCancelLoadMsg());
      alert(getNormalErrorAlert('图片上传失败'));
      return { success: false, updatedContent: content };
    }
  };
  
  /**
   * 上传封面图片
   * @returns {Promise<String|null>} 封面图片URL或null
   */
  const uploadCoverImage = async () => {
    if (!sectionInfoEditorRef.value) {
      return editorBarData.value.coverLink || null;
    }
    
    const uploadData = await sectionInfoEditorRef.value.getDataForUpload();
    if (!uploadData || !uploadData.tmpCoverImage) {
      return editorBarData.value.coverLink || null;
    }
    
    const coverImage = uploadData.tmpCoverImage;
    setLoading(getLoadMsg('封面图片上传中...'));
    
    try {
      const response = await uploadArticleImage(coverImage);
      setLoading(getCancelLoadMsg());
      
      if (response.status === 200 || response.status === 201) {
        const coverUrl = apiUrl + response.data.image_url;
        
          // 清理临时图片
        if (uploadData.tmpCoverImage) {
            URL.revokeObjectURL(coverImage);
        }
        
        return coverUrl;
      } else {
        alert(getNormalErrorAlert('封面图片上传失败'));
        return null;
      }
    } catch (error) {
      setLoading(getCancelLoadMsg());
      alert(getNormalErrorAlert('封面图片上传失败'));
      return null;
    }
  };
  
  /**
   * 提交文章
   * @param {String} routeId - 路由参数中的文章ID（用于判断是编辑还是创建）
   * @returns {Promise<Boolean>} 是否提交成功
   */
  const submitArticle = async (routeId) => {
    try {
      // 1. 上传文章中的图片
      let imageDict = null;
      let currentContent = '';
      
      if (editorType.value === 'html' && htmlEditorRef.value) {
        imageDict = htmlEditorRef.value.imageDict || {};
        currentContent = htmlEditorRef.value.$data?.data?.content || htmlData.value.content;
      } else if (editorType.value === 'md' && mdEditorRef.value) {
        imageDict = mdEditorRef.value.$data?.imageDict || {};
        currentContent = mdEditorRef.value.$data?.data?.content || mdData.value.content;
      }
      
      const imageResult = await uploadArticleImages(imageDict, currentContent, editorType.value);
      if (!imageResult.success) {
        return false;
      }
      
      // 更新编辑器内容
      if (editorType.value === 'html' && htmlEditorRef.value?.$data?.data) {
        htmlEditorRef.value.$data.data.content = imageResult.updatedContent;
      } else if (editorType.value === 'md' && mdEditorRef.value?.$data?.data) {
        mdEditorRef.value.$data.data.content = imageResult.updatedContent;
      }
      
      // 2. 上传封面图片
      const coverUrl = await uploadCoverImage();
      const uploadData = sectionInfoEditorRef.value ? await sectionInfoEditorRef.value.getDataForUpload() : null;
      if (coverUrl === null && uploadData?.tmpCoverImage) {
        // 上传失败但用户选择了封面图，返回false
        return false;
      }
      
      // 3. 准备表单数据
      setLoading(getLoadMsg('正在创建文章...'));
      
      // 获取板块信息数据（如果之前没有获取）
      const barData = uploadData?.data || editorBarData.value;
      
      // 验证板块名称
      const sectionName = (barData.articleSection || '').trim();
      if (!sectionName) {
        alert(getNormalErrorAlert('板块名称不能为空'));
        setLoading(getCancelLoadMsg());
        return false;
      }
      if (sectionName === 'default') {
        alert(getNormalErrorAlert('板块名称不能为 "default"'));
        setLoading(getCancelLoadMsg());
        return false;
      }
      if (sectionName.length < 2) {
        alert(getNormalErrorAlert('板块名称至少需要2个字符'));
        setLoading(getCancelLoadMsg());
        return false;
      }
      if (sectionName.length > 50) {
        alert(getNormalErrorAlert('板块名称不能超过50个字符'));
        setLoading(getCancelLoadMsg());
        return false;
      }
      
      const form = {};
      // 板块文章的标题等于板块名称
      form.article_title = sectionName;
      form.content = addEditorType(
        imageResult.updatedContent,
        editorType.value
      );
      
      form.article_section = sectionName;
      form.tags = arrToString(barData.tags || []);
      form.article_summary = barData.summary || '';
      form.article_type = 'original'; // 板块文章默认原创
      form.origin_link = '';
      form.cover_link = coverUrl || barData.coverLink || '';
      form.source_url = '';
      
      let response;
      
      // 4. 创建或编辑文章
      if (routeId) {
        // 编辑模式
        form.article_id = routeId;
        response = await editArticle(form);
        
        if (response.status === 200) {
          alert({
            state: true,
            color: 'success',
            title: '创建成功',
            content: response.message,
          });
          ifSubmit.value = true;
          setEditFinishCardState(true);
          setLoading(getCancelLoadMsg());
          return true;
        } else {
          alert(getNormalErrorAlert(response.message));
          setLoading(getCancelLoadMsg());
          return false;
        }
      } else {
        // 创建模式
        response = await createArticle(form);
        
        if (response.status === 200) {
          setArticleId(response.article_id);
          
          ifSubmit.value = true;
          setEditFinishCardState(true);
          setLoading(getCancelLoadMsg());
          return true;
        } else {
          alert(getNormalErrorAlert(response.message));
          setLoading(getCancelLoadMsg());
          return false;
        }
      }
    } catch (error) {
      setLoading(getCancelLoadMsg());
      alert(getNormalErrorAlert('未知错误，请查看控制台'));
      console.error(error);
      return false;
    }
  };
  
  /**
   * 切换编辑器类型
   */
  const shiftEditorType = () => {
    if (editorType.value === 'html') {
      // 保存 HTML 内容
      if (htmlEditorRef.value?.$data?.data) {
        htmlData.value.content = htmlEditorRef.value.$data.data.content;
      }
      setEditorType('md');
    } else {
      // 保存 Markdown 内容
      if (mdEditorRef.value?.$data?.data) {
        mdData.value.content = mdEditorRef.value.$data.data.content;
      }
      setEditorType('html');
    }
  };
  
  return {
    loadArticle,
    submitArticle,
    shiftEditorType,
  };
}


