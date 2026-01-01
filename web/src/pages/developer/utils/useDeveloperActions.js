/**
 * DeveloperPage 操作处理 Composable
 */
export function useDeveloperActions(
  categoryList,
  categoryLoading,
  currentDoc,
  expandedKeys,
  loadState,
  data,
  isLoading
) {
  // 加载目录配置
  const loadCategory = async () => {
    categoryLoading.value = true;
    try {
      const response = await fetch('/doc/developer/category.json');
      if (response.ok) {
        const categories = await response.json();
        categoryList.value = categories;
        // 默认展开所有有子项的目录
        categories.forEach(item => {
          if (item.children && item.children.length > 0) {
            expandedKeys.value.add(item.key);
          }
        });
      } else {
        console.error('Failed to load category.json');
        categoryList.value = [];
      }
    } catch (error) {
      console.error('Error loading category:', error);
      categoryList.value = [];
    } finally {
      categoryLoading.value = false;
    }
  };
  
  // 根据key查找文件路径
  const findFileByKey = (items, key) => {
    for (const item of items) {
      if (item.key === key && item.file) {
        return item.file;
      }
      if (item.children) {
        const found = findFileByKey(item.children, key);
        if (found) return found;
      }
    }
    return null;
  };
  
  // 加载文档
  const loadDocument = async (docKey) => {
    if (!docKey) return;
    
    // 如果切换的是同一个文档，不重新加载
    if (currentDoc.value === docKey && loadState.value) {
      return;
    }
    
    // 标记正在加载
    isLoading.value = true;
    
    // 先更新 currentDoc
    const previousDoc = currentDoc.value;
    const hadContent = loadState.value && previousDoc;
    currentDoc.value = docKey;
    
    const filePath = findFileByKey(categoryList.value, docKey);
    if (!filePath) {
      data.value.content = `# 文档未找到\n\n文档键 \`${docKey}\` 对应的文件路径未找到。`;
      loadState.value = true;
      isLoading.value = false;
      return;
    }
    
    // 如果之前没有内容，显示加载状态
    if (!hadContent) {
      loadState.value = false;
    }
    
    // 加载新内容
    let newContent = '';
    try {
      const response = await fetch(`/doc/developer/${filePath}`);
      if (response.ok) {
        newContent = await response.text();
      } else {
        newContent = `# 文档未找到\n\n文档 \`${filePath}\` 尚未创建，请稍后再试。\n\n您可以联系管理员创建此文档。`;
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      newContent = `# 加载错误\n\n无法加载文档，请检查网络连接或稍后再试。\n\n错误信息：${error.message}`;
    }
    
    // 只有在当前文档仍然是目标文档时才更新（防止快速切换时的竞态条件）
    if (currentDoc.value === docKey) {
      // 如果有旧内容，短暂延迟以允许过渡动画
      if (hadContent) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // 再次检查（防止快速切换）
      if (currentDoc.value === docKey) {
        // 更新内容
        data.value.content = newContent;
        loadState.value = true;
      }
    }
    
    isLoading.value = false;
  };
  
  // 处理目录项点击
  const handleItemClick = (item) => {
    if (item.file) {
      loadDocument(item.key);
    }
  };
  
  // 处理展开/折叠
  const handleToggle = (key) => {
    if (expandedKeys.value.has(key)) {
      expandedKeys.value.delete(key);
    } else {
      expandedKeys.value.add(key);
    }
  };
  
  return {
    loadCategory,
    loadDocument,
    handleItemClick,
    handleToggle,
  };
}

