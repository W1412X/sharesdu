# 字体大小系统重构说明

## 已完成的工作

### 1. 响应式字体大小系统设计

在 `web/src/style/global.css` 中实现了基于 CSS 变量的响应式字体大小系统：

- **PC 端（>= 1000px）**：保持原有字体大小
  - `--font-size-title-big`: 24px
  - `--font-size-page-title`: 22px
  - `--font-size-logo`: 20px
  - `--font-size-title`: 18px
  - `--font-size-medium`: 16px
  - `--font-size-small`: 14px
  - `--font-size-tiny`: 12px
  - `--font-size-min`: 10px

- **移动端（< 1000px）**：适当缩小以提升观感
  - `--font-size-title-big`: 20px (缩小约 17%)
  - `--font-size-page-title`: 18px (缩小约 18%)
  - `--font-size-logo`: 18px (缩小 10%)
  - `--font-size-title`: 16px (缩小约 11%)
  - `--font-size-medium`: 14px (缩小 12.5%)
  - `--font-size-small`: 13px (缩小约 7%)
  - `--font-size-tiny`: 11px (缩小约 8%)
  - `--font-size-min`: 9px (缩小 10%)

### 2. 全局字体样式类更新

所有字体样式类已更新为使用 CSS 变量：
- `.title-big` / `.title-big-bold`
- `.page-title-bold`
- `.title` / `.title-bold`
- `.text-medium` / `.text-medium-bold`
- `.text-small` / `.text-small-bold`
- `.text-tiny` / `.text-tiny-bold`
- `.text-min` / `.text-min-bold`
- `.logo-text` / `.logo-text-white`

### 3. 已更新的文件

以下文件已更新为使用新的字体大小系统：

- ✅ `web/src/style/global.css` - 核心字体系统
- ✅ `web/src/pages/index/components/ItemTypeTabs.vue` - 移动端选项卡
- ✅ `web/src/AppMobile.vue` - 移动端应用组件
- ✅ `web/src/components/article/SourceBar.vue` - 资源栏
- ✅ `web/src/router/components/AsyncError.vue` - 异步错误组件
- ✅ `web/src/router/components/AsyncLoading.vue` - 异步加载组件
- ✅ `web/src/pages/ErrorPage.vue` - 错误页面

## 使用指南

### 推荐用法

1. **使用全局样式类**（推荐）：
   ```vue
   <div class="text-small">小号文字</div>
   <div class="title-bold">标题（粗体）</div>
   ```

2. **使用 CSS 变量**（在样式表中）：
   ```css
   .custom-text {
     font-size: var(--font-size-medium);
   }
   ```

3. **避免内联样式**：
   ```vue
   <!-- 不推荐 -->
   <div style="font-size: 14px">文字</div>
   
   <!-- 推荐 -->
   <div class="text-small">文字</div>
   ```

## 需要手动检查的文件

以下文件包含内联字体大小设置，建议根据实际情况替换为全局样式类或 CSS 变量：

### 页面组件
- `web/src/pages/editor/components/*.vue` - 编辑器相关组件
- `web/src/pages/login/components/*.vue` - 登录相关组件
- `web/src/pages/article/components/*.vue` - 文章相关组件
- `web/src/pages/post/components/*.vue` - 帖子相关组件
- `web/src/pages/course/components/*.vue` - 课程相关组件
- `web/src/pages/welcome/components/*.vue` - 欢迎页组件
- `web/src/pages/chat/components/*.vue` - 聊天相关组件
- `web/src/pages/search/components/*.vue` - 搜索相关组件

### 通用组件
- `web/src/components/common/*.vue` - 通用组件
- `web/src/components/article/*.vue` - 文章组件
- `web/src/components/post/*.vue` - 帖子组件
- `web/src/components/course/*.vue` - 课程组件
- `web/src/components/user/*.vue` - 用户组件

### 特殊用途文件（可保留）
以下文件包含特殊用途的字体大小（如海报生成），可以保留：
- `web/src/utils/templates/poster.js` - 海报模板生成

## 字体大小映射表

| 原字体大小 | PC 端变量 | 移动端变量 | 推荐样式类 |
|-----------|----------|-----------|-----------|
| 24px | `--font-size-title-big` | 20px | `.title-big` |
| 22px | `--font-size-page-title` | 18px | `.page-title-bold` |
| 20px | `--font-size-logo` | 18px | `.logo-text` |
| 18px | `--font-size-title` | 16px | `.title` |
| 16px | `--font-size-medium` | 14px | `.text-medium` |
| 14px | `--font-size-small` | 13px | `.text-small` |
| 12px | `--font-size-tiny` | 11px | `.text-tiny` |
| 10px | `--font-size-min` | 9px | `.text-min` |

## 注意事项

1. **图标大小**：`v-icon` 组件的 `size` 属性控制的是图标尺寸，不是字体大小，通常不需要修改。

2. **特殊尺寸**：对于特殊的字体大小（如 28px、36px、42px 等），可以根据需要：
   - 使用最接近的 CSS 变量
   - 或创建新的 CSS 变量（如果使用频率高）

3. **响应式测试**：修改后请在 PC 端和移动端都进行测试，确保显示效果符合预期。

## 后续优化建议

1. 逐步替换剩余文件中的内联字体大小
2. 考虑添加更多字体大小级别（如 15px、17px 等）以满足特殊需求
3. 考虑使用 `clamp()` 函数实现更平滑的响应式字体大小

