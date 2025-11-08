# IndexPage 模块化结构

## 目录结构

```
src/pages/index/
├── IndexPage.vue          # 主页面组件
├── components/            # 页面专用组件
│   ├── index.js           # 组件统一导出
│   ├── ItemTypeTabs.vue   # 内容类型标签切换（文章/帖子/课程）
│   ├── ArticleSortBar.vue # 文章排序按钮栏
│   ├── ArticleList.vue    # 文章列表容器
│   ├── PostList.vue       # 帖子列表容器
│   ├── CourseList.vue     # 课程列表容器
│   └── LoadMoreButton.vue # 加载更多按钮
└── utils/                 # 页面专用工具函数
    ├── index.js           # 工具函数统一导出
    ├── dataTransformers.js # 数据转换函数
    ├── useIndexState.js   # 状态管理 Composable
    ├── useIndexData.js    # 数据管理 Composable
    └── useIndexLoad.js    # 加载逻辑 Composable
```

## Components 说明

### ItemTypeTabs.vue
内容类型标签切换组件，支持 PC 端和移动端两种显示方式。

**Props:**
- `modelValue`: 当前选中的类型（'article' | 'post' | 'course'）
- `ifMobile`: 是否为移动端
- `themeColor`: 主题颜色

**Events:**
- `update:modelValue`: 类型变化时触发

### ArticleSortBar.vue
文章排序按钮栏，仅在 PC 端显示。

**Props:**
- `sortMethod`: 当前排序方式（'time' | 'star' | 'view' | 'hot'）
- `themeColor`: 主题颜色
- `ifMobile`: 是否为移动端

**Events:**
- `update:sortMethod`: 排序方式变化时触发

### ArticleList.vue
文章列表容器组件，包含排序栏、文章项列表和加载更多按钮。

**Props:**
- `articleList`: 文章列表数组
- `sortMethod`: 当前排序方式
- `themeColor`: 主题颜色
- `ifMobile`: 是否为移动端
- `allLoad`: 是否全部加载完成
- `loading`: 是否正在加载

**Events:**
- `update:sortMethod`: 排序方式变化
- `load-more`: 加载更多

### PostList.vue
帖子列表容器组件。

**Props:**
- `postList`: 帖子列表数组
- `themeColor`: 主题颜色
- `allLoad`: 是否全部加载完成
- `loading`: 是否正在加载

**Events:**
- `load-more`: 加载更多

### CourseList.vue
课程列表容器组件。

**Props:**
- `courseList`: 课程列表数组
- `themeColor`: 主题颜色
- `allLoad`: 是否全部加载完成
- `loading`: 是否正在加载

**Events:**
- `load-more`: 加载更多

### LoadMoreButton.vue
加载更多按钮组件。

**Props:**
- `allLoad`: 是否全部加载完成
- `loading`: 是否正在加载
- `themeColor`: 主题颜色

**Events:**
- `load-more`: 点击加载更多

## Utils 说明

### dataTransformers.js
数据转换工具函数，将 API 响应数据转换为组件所需格式。

**函数:**
- `transformArticleList(articleList)`: 转换文章列表
- `transformPostList(postList)`: 转换帖子列表
- `transformCourseList(courseList)`: 转换课程列表

### useIndexState.js
IndexPage 状态管理 Composable。

**导出:**
- `itemType`: 当前内容类型
- `articleSortMethod`: 文章排序方式
- `ifMounted`: 是否已挂载
- `lastPageNum`: 上次浏览的页码
- `restoreState()`: 从 sessionStorage 恢复状态
- `saveState(pageNum, scrollPosition)`: 保存状态到 sessionStorage

### useIndexData.js
IndexPage 数据管理 Composable。

**导出:**
- `articleList`: 文章列表（按排序方式分类）
- `postList`: 帖子列表
- `courseList`: 课程列表
- `articlePageNum`: 文章分页信息
- `postPageNum`: 帖子分页信息
- `coursePageNum`: 课程分页信息
- `loading`: 加载状态
- `allLoad`: 是否全部加载完成

### useIndexLoad.js
IndexPage 加载逻辑 Composable。

**导出:**
- `refresh(itemType)`: 刷新数据
- `loadMore(itemType)`: 加载更多数据
- `restoreScrollAndLoad(itemType, lastPageNum)`: 恢复滚动位置并加载到指定页码

## 使用方式

在 `IndexPage.vue` 中的使用示例：

```javascript
import { useIndexState } from './utils/useIndexState';
import { useIndexData } from './utils/useIndexData';
import { useIndexLoad } from './utils/useIndexLoad';
import ItemTypeTabs from './components/ItemTypeTabs.vue';
import ArticleList from './components/ArticleList.vue';
// ... 其他组件

export default {
  setup() {
    const { itemType, articleSortMethod, ... } = useIndexState();
    const { articleList, postList, ... } = useIndexData();
    const { refresh, loadMore, ... } = useIndexLoad(...);
    
    return {
      // 返回所有需要的状态和方法
    };
  }
};
```

## 优势

1. **模块化**: 组件和逻辑分离，职责清晰
2. **可复用**: 组件可以在其他页面复用
3. **易维护**: 修改某个功能只需修改对应的文件
4. **易测试**: 每个组件和 composable 可以独立测试
5. **代码组织**: 相关代码集中管理，便于查找和维护

## 注意事项

- 所有组件和工具函数都保持原有逻辑不变
- 组件使用 Vue 3 的 props 和 emits 规范
- Composables 遵循 Vue 3 Composition API 规范
- 数据转换函数确保 API 响应格式变化时只需修改一处

