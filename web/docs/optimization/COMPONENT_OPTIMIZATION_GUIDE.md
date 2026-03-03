# 列表项组件优化指南

本文档总结了 ArticleItem、PostItem、CourseItem 等列表项组件的字体设计和移动端优化设计规范，为类似组件的优化提供通用路径。

## 一、组件拆分结构

### 推荐的文件结构

```
components/[category]/[ComponentName]/
├── index.vue    # 主入口（根据设备类型动态加载）
├── pc.vue       # PC 端版本
└── mobile.vue   # 移动端版本
```

### 主入口组件（index.vue）模板

```vue
<template>
    <component-name-pc v-if="deviceType === 'desktop'" 
        :init-data="initData" 
        :search-query="searchQuery">
    </component-name-pc>
    <component-name-mobile v-else 
        :init-data="initData" 
        :search-query="searchQuery">
    </component-name-mobile>
</template>
<script>
import { globalProperties } from '@/main';
import ComponentNamePc from './pc.vue';
import ComponentNameMobile from './mobile.vue';

export default {
    name: 'ComponentName',
    props: {
        initData: { type: Object, required: true },
        searchQuery: { type: Array, default: () => [] }
    },
    setup() {
        const deviceType = globalProperties.$deviceType;
        return { deviceType };
    },
    components: {
        ComponentNamePc,
        ComponentNameMobile,
    },
}
</script>
```

## 二、字体大小设计规范

### PC 端字体大小规范

| 用途 | 样式类 | 字体大小 | 使用场景 |
|------|--------|---------|---------|
| 主标题 | `.title` | 18px | 文章/帖子/课程标题 |
| 正文/摘要 | `.text-small` | 14px | 摘要、正文内容 |
| 次要信息 | `.text-tiny` | 12px | 时间、标签等 |
| 统计信息 | `.text-small` | 14px | 浏览量、收藏数等 |

### 移动端字体大小规范

| 用途 | 样式类 | 字体大小 | 使用场景 |
|------|--------|---------|---------|
| 主标题 | `.text-medium-bold` | 14px (粗体) | 文章/帖子/课程标题 |
| 正文/摘要 | `.text-small` | 13px | 摘要、正文内容 |
| 次要信息 | `.text-tiny` | 11px | 时间、标签等 |
| 统计信息 | `.text-tiny` 或 `.text-min` | 11px 或 9px | 浏览量、收藏数等 |

### 字体大小映射表

```css
/* PC 端（>= 1000px） */
--font-size-title: 18px
--font-size-medium: 16px
--font-size-small: 14px
--font-size-tiny: 12px
--font-size-min: 10px

/* 移动端（< 1000px） */
--font-size-title: 16px      (缩小约 11%)
--font-size-medium: 14px     (缩小 12.5%)
--font-size-small: 13px      (缩小约 7%)
--font-size-tiny: 11px       (缩小约 8%)
--font-size-min: 9px         (缩小 10%)
```

## 三、布局设计规范

### PC 端布局特点

1. **固定宽度**：通常为 `750px`
2. **横向布局**：图片在左，内容在右
3. **固定高度**：容器高度固定（如 `130px`）
4. **间距**：`padding: 5px`，`gap: 10px`
5. **统计信息**：图标 + 数字，横向排列

### 移动端布局特点

1. **全屏宽度**：`width: 100vw`
2. **紧凑布局**：`padding: 12px`，`gap: 8-12px`
3. **Flex 布局**：使用 `flex: 1` 和 `min-width: 0` 实现自适应
4. **图片尺寸**：缩小到 85-90%（如 140px → 95px）
5. **统计信息**：纯文字，点分隔格式

## 四、移动端统计信息设计

### 设计模式

**PC 端**：图标 + 数字
```vue
<div class="bottom-item">
    <v-icon icon="mdi-star" size="20"></v-icon>
    {{ data.starNum }}
</div>
```

**移动端**：纯文字，点分隔
```vue
<div class="text-tiny bottom-bar-mobile">
    <span class="mobile-author">@{{ data.authorName }}</span>
    <span class="mobile-separator">·</span>
    <span class="mobile-stats">{{ mobileStatsText }}</span>
</div>
```

### 数字格式化函数

```javascript
computed: {
    mobileStatsText() {
        const formatNumber = (num) => {
            if (!num && num !== 0) return '';
            if (num < 1000) return num.toString();
            if (num < 10000) return (num / 1000).toFixed(1) + 'k';
            return (num / 10000).toFixed(1) + 'w';
        };
        
        const stats = [];
        if (this.data.viewNum != null) {
            stats.push('浏览 ' + formatNumber(this.data.viewNum));
        }
        if (this.data.starNum != null) {
            stats.push('收藏 ' + formatNumber(this.data.starNum));
        }
        // ... 其他统计项
        return stats.join(' · ');
    },
}
```

### 移动端统计信息样式

```css
.bottom-bar-mobile {
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #8a8a8a;
    margin-top: auto;
    padding-top: 4px;
    line-height: 1.2;
}

.mobile-author {
    color: rgba(0, 0, 0, 0.6);
    font-weight: 500;
}

.mobile-separator {
    margin: 0 6px;
    color: #8a8a8a;
}

.mobile-stats {
    color: #8a8a8a;
}
```

## 五、通用优化路径

### 步骤 1：组件拆分

1. 创建组件文件夹 `[ComponentName]/`
2. 创建 `index.vue`（主入口）
3. 创建 `pc.vue`（PC 端版本）
4. 创建 `mobile.vue`（移动端版本）
5. 删除原 `[ComponentName].vue` 文件

### 步骤 2：字体大小优化

#### PC 端
- ✅ 标题：使用 `.title` (18px)
- ✅ 正文：使用 `.text-small` (14px)
- ✅ 次要信息：使用 `.text-tiny` (12px)
- ✅ 统一颜色：`#8a8a8a` 用于次要文字

#### 移动端
- ✅ 标题：使用 `.text-medium-bold` (14px, 粗体)
- ✅ 正文：使用 `.text-small` (13px)
- ✅ 次要信息：使用 `.text-tiny` (11px)
- ✅ 统计信息：使用 `.text-tiny` 或 `.text-min` (11px 或 9px)

### 步骤 3：布局优化

#### PC 端布局
```css
.card {
    width: 750px;
    margin-top: 5px;
}

.container {
    padding: 5px;
    display: flex;
    flex-direction: row;
    height: 130px; /* 固定高度 */
}

.title-container {
    max-width: 550px;
    height: 27px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-clamp: 1;
}
```

#### 移动端布局
```css
.card {
    width: 100vw;
    margin-top: 4px;
    border-radius: 0;
    border-bottom: 1px solid #eeeeee;
}

.container {
    display: flex;
    flex-direction: row;
    padding: 12px;
    gap: 12px;
    min-height: 110px;
}

.row-div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0; /* 关键：允许 flex 子元素收缩 */
}

.title-container {
    flex: 0 0 auto;
    max-width: 100%;
    margin-bottom: 6px;
    line-height: 1.4;
    max-height: 2.8em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    text-overflow: ellipsis;
}
```

### 步骤 4：移动端统计信息改造

1. **添加计算属性**：实现数字格式化和文字拼接
2. **修改模板**：从图标+数字改为纯文字格式
3. **添加样式**：`.bottom-bar-mobile`, `.mobile-author`, `.mobile-separator`, `.mobile-stats`

### 步骤 5：图片尺寸优化

#### PC 端
- 图片尺寸：`140x130` 或 `150x120`
- 圆角：`border-radius: 4px`

#### 移动端
- 图片尺寸：缩小到 85-90%（如 `95x95` 或 `85x85`）
- 圆角：`border-radius: 8px`（更圆润）

### 步骤 6：间距优化

#### PC 端
- 容器 padding: `5px`
- 元素间距: `10-20px`
- 底部栏 margin-top: `12px`

#### 移动端
- 容器 padding: `12px`
- 元素间距: `4-8px`（更紧凑）
- 使用 `gap` 属性统一管理间距

### 步骤 7：行高优化

- PC 端：`line-height: 1.2`（紧凑）
- 移动端：`line-height: 1.4`（更易读）

## 六、关键设计原则

### 1. 响应式字体系统
- ✅ 使用 CSS 变量 `var(--font-size-*)`
- ✅ 自动适配 PC 端和移动端
- ✅ 统一管理，易于维护

### 2. 层次分明
- ✅ 标题：最大、最醒目
- ✅ 正文：中等大小
- ✅ 统计信息：最小、最不显眼
- ✅ 通过颜色区分：主要文字 `rgba(0,0,0,0.87)`，次要文字 `#8a8a8a`

### 3. 移动端优化
- ✅ 紧凑布局，充分利用屏幕空间
- ✅ 纯文字统计信息，减少视觉干扰
- ✅ 数字格式化（1.2k, 1.2w），提升可读性
- ✅ 点分隔格式，符合移动端应用习惯

### 4. 代码复用
- ✅ 共享逻辑提取到 composables
- ✅ 样式使用全局 CSS 变量
- ✅ 组件拆分但保持接口一致

## 七、检查清单

优化组件时，请检查以下项目：

### 字体大小
- [ ] PC 端使用 `.title`, `.text-small`, `.text-tiny`
- [ ] 移动端使用 `.text-medium-bold`, `.text-small`, `.text-tiny`
- [ ] 所有字体大小使用 CSS 变量或全局样式类
- [ ] 无内联 `font-size` 设置

### 布局
- [ ] PC 端固定宽度（750px）
- [ ] 移动端全屏宽度（100vw）
- [ ] 移动端使用 flex 布局，设置 `min-width: 0`
- [ ] 移动端间距更紧凑（padding: 12px, gap: 8-12px）

### 统计信息
- [ ] PC 端：图标 + 数字
- [ ] 移动端：纯文字，点分隔
- [ ] 移动端数字格式化（1.2k, 1.2w）
- [ ] 移动端统计信息样式统一

### 图片
- [ ] PC 端和移动端图片尺寸不同
- [ ] 移动端图片适当缩小（85-90%）
- [ ] 圆角设置合理（PC: 4px, Mobile: 8px）

### 颜色
- [ ] 主要文字：`rgba(0,0,0,0.87)` 或 `#000`
- [ ] 次要文字：`#8a8a8a`
- [ ] 统一使用全局颜色变量

## 八、示例对比

### ArticleItem 优化前后对比

**PC 端（保持不变）**
- 标题：`.title` (18px)
- 摘要：`.text-small` (14px)
- 统计：图标 + 数字

**移动端（优化后）**
- 标题：`.text-medium-bold` (14px, 粗体)
- 摘要：`.text-small` (13px)
- 统计：`@作者名 · 1.2k浏览 · 234收藏 · 56热度`

### PostItem 优化前后对比

**PC 端（保持不变）**
- 标题：`.title` (18px)
- 内容：`.text-small` (14px)
- 统计：图标 + 数字

**移动端（优化后）**
- 标题：`.text-medium-bold` (14px, 粗体)
- 内容：`.text-small` (13px)
- 统计：`点赞 1.2k · 浏览 234 · 回复 56`

### CourseItem 优化前后对比

**PC 端（优化后）**
- 标题：`.title` (18px)
- 信息：`.text-small` (14px) ← 从 `.text-medium` 优化
- 时间：`.text-tiny` (12px) ← 从 `.text-small` 优化

**移动端（新建）**
- 标题：`.text-medium-bold` (14px, 粗体)
- 信息：`.text-small` (13px)
- 时间：`.text-tiny` (11px)
- 评分：`.title` (16px) / `.text-min` (9px)

## 九、常见问题

### Q1: 如何确定移动端字体大小？
**A**: 参考 ArticleItem 的设计：
- 标题：`.text-medium-bold` (14px, 粗体)
- 正文：`.text-small` (13px)
- 统计：`.text-tiny` (11px) 或 `.text-min` (9px)

### Q2: 移动端统计信息格式如何统一？
**A**: 使用点分隔格式：`@作者名 · 1.2k浏览 · 234收藏`
- 作者名：`rgba(0,0,0,0.6)`, `font-weight: 500`
- 分隔符：`·`，间距 `6px`
- 统计信息：`#8a8a8a`

### Q3: 移动端布局如何实现自适应？
**A**: 使用 flex 布局：
```css
.row-div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0; /* 关键！允许收缩 */
}
```

### Q4: 如何保持 PC 端和移动端功能一致？
**A**: 
- 保持 props 接口一致
- 共享业务逻辑（如点击事件）
- 只在 UI 层面区分 PC 和移动端

## 十、总结

通过以上优化路径，可以实现：
1. ✅ **统一的字体大小系统**：使用 CSS 变量，自动适配
2. ✅ **清晰的视觉层次**：标题、正文、统计信息层次分明
3. ✅ **移动端友好设计**：紧凑布局，纯文字统计信息
4. ✅ **代码可维护性**：组件拆分，逻辑清晰
5. ✅ **性能优化**：只加载当前设备需要的组件

遵循这些规范，可以确保项目中所有列表项组件保持一致的视觉风格和用户体验。

