# 路由切换空白页面问题修复

## 问题描述

在页面切换时，出现空白页面的问题。具体表现为：
1. 从一个页面切换到另一个页面时
2. 页面显示为空白，没有任何内容
3. 一段时间后才显示新页面内容

## 问题原因

### 根本原因

1. **过渡模式问题**：使用 `mode="out-in"` 时，旧组件先完全消失（opacity: 0），然后新组件才开始显示
2. **异步组件加载延迟**：新组件是异步加载的，在加载完成前，`Component` 可能是 `undefined` 或还在加载中
3. **过渡时间不匹配**：过渡动画时间与组件实际加载时间不匹配

### 具体表现

- 旧页面淡出（0.15s）
- 新组件开始加载（异步，可能需要几百毫秒）
- 在组件加载完成前，`Component` 为 `undefined`，导致空白
- 组件加载完成后才开始显示

## 解决方案

### 1. 添加组件存在性检查

在 `router-view` 中添加 `v-if="Component"` 检查，确保只有在组件存在时才渲染。

### 2. 添加加载占位符

当 `Component` 不存在时，显示加载占位符，避免空白：

```vue
<transition name="page-fade" mode="out-in">
  <component v-if="Component" :is="Component" :key="routeSlot.fullPath" />
  <div v-else :key="'loading'" class="page-loading-placeholder">
    <v-progress-circular indeterminate :color="themeColor" :size="50" />
  </div>
</transition>
```

### 3. 优化异步组件加载延迟

将异步组件的 `delay` 从 200ms 改为 0ms，让加载状态立即显示：

```javascript
delay = 0, // 减少延迟，立即显示加载状态
```

### 4. 调整过渡动画

- 使用 `mode="out-in"` 确保平滑切换
- 添加加载占位符作为过渡的中间状态
- 过渡时间：进入 0.2s，离开 0.1s

## 已修复的文件

1. ✅ **AppMobile.vue** - 移动端路由视图
2. ✅ **AppDesktop.vue** - PC端路由视图
3. ✅ **asyncComponents.js** - 异步组件加载配置

## 技术细节

### 过渡流程

1. **旧页面淡出**（0.1s）
2. **显示加载占位符**（如果 Component 不存在）
3. **新组件加载完成**
4. **新页面淡入**（0.2s）

### 关键代码

```vue
<router-view v-slot="{ Component, route: routeSlot }">
  <transition name="page-fade" mode="out-in">
    <component v-if="Component" :is="Component" :key="routeSlot.fullPath" />
    <div v-else :key="'loading'" class="page-loading-placeholder">
      <v-progress-circular indeterminate />
    </div>
  </transition>
</router-view>
```

## 注意事项

1. **异步组件加载**：Vue Router 的异步组件会自动处理加载状态，但我们需要在过渡中处理 `Component` 为 `undefined` 的情况
2. **过渡模式**：`mode="out-in"` 确保先消失再显示，避免重叠，但需要处理加载状态
3. **性能考虑**：加载占位符应该轻量，避免影响性能

## 后续优化建议

1. **预加载**：对于可预测的页面切换，可以预加载目标页面组件
2. **缓存策略**：合理使用组件缓存，减少重复加载
3. **骨架屏**：对于复杂页面，可以使用骨架屏替代简单的加载指示器

