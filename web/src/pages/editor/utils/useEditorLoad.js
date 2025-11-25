/**
 * EditorPage 加载和提交逻辑 Composable
 */
import { createArticle, editArticle, getArticleDetail } from '@/api/modules/article';
import { uploadArticleImage } from '@/api/modules/image';
import { uploadResource } from '@/api/modules/resource';
import {
  addEditorType,
  arrToString,
  getCancelLoadMsg,
  getLoadMsg,
  getNormalErrorAlert,
  getNormalSuccessAlert,
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
  editorBarRef,
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
          setTitle(transformed.title);
          setEditorType(transformed.editorType);
          
          if (transformed.editorType === 'html') {
            setHtmlContent(transformed.content);
          } else {
            setMdContent(transformed.content);
          }
          
          setEditorBarData(transformed.editorBarData);
          
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
    if (!editorBarRef.value || !editorBarRef.value.$data?.tmpCoverImage) {
      return null;
    }
    
    const coverImage = editorBarRef.value.$data.tmpCoverImage;
    setLoading(getLoadMsg('封面图片上传中...'));
    
    try {
      const response = await uploadArticleImage(coverImage);
      setLoading(getCancelLoadMsg());
      
      if (response.status === 200 || response.status === 201) {
        const coverUrl = apiUrl + response.data.image_url;
        
        // 更新 editorBar 数据
        if (editorBarRef.value.$data) {
          editorBarRef.value.$data.data.coverLink = coverUrl;
          // 清理临时图片
          if (editorBarRef.value.$data.tmpCoverImage) {
            URL.revokeObjectURL(coverImage);
          }
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
      if (coverUrl === null && editorBarRef.value?.$data?.tmpCoverImage) {
        // 上传失败但用户选择了封面图，返回false
        return false;
      }
      
      // 3. 准备表单数据
      setLoading(getLoadMsg('正在创建文章...'));
      
      const form = {};
      form.article_title = editorData.value.title;
      form.content = addEditorType(
        imageResult.updatedContent,
        editorType.value
      );
      
      // 获取 editorBar 数据
      const barData = editorBarRef.value?.$data?.data || editorBarData.value;
      form.tags = arrToString(barData.tags || []);
      form.article_summary = barData.summary || '';
      form.article_type = barData.type === '原创' ? 'original' : 'repost';
      form.origin_link = barData.originLink || '';
      form.cover_link = coverUrl || barData.coverLink || '';
      form.source_url = barData.sourceUrl || '';
      
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
          
          // 5. 上传资源文件（如果有）
          const file = editorBarRef.value?.$data?.file;
          if (file) {
            setLoading(getLoadMsg('正在上传资源文件...', -1));
            const resourceResponse = await uploadResource(
              file,
              response.article_id,
              setLoading
            );
            
            if (resourceResponse.status === 200 || resourceResponse.status === 201) {
              alert(getNormalSuccessAlert('资源上传成功'));
            } else {
              alert(getNormalErrorAlert('资源上传失败'));
            }
          }
          
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


