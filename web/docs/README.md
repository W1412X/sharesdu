# ShareSDU Web 文档中心

本目录包含 ShareSDU Web 前端项目的所有技术文档。

## 📁 文档结构

```
docs/
├── README.md                    # 本文件 - 文档索引
├── architecture/                # 架构设计文档
│   └── CACHE_SYSTEM_DESIGN.md  # 缓存系统设计文档
├── optimization/                # 性能优化文档
│   ├── CACHE_INVALIDATION_AUDIT.md
│   ├── CACHE_INVALIDATION_IMPLEMENTATION.md
│   ├── CACHE_INVALIDATION_RULES_IMPLEMENTATION.md
│   ├── COMPONENT_OPTIMIZATION_GUIDE.md
│   ├── LOADING_FLICKER_FIX.md
│   ├── LOADING_TRANSITION_OPTIMIZATION.md
│   ├── ROUTER_TRANSITION_FIX.md
│   └── TYPOGRAPHY_REFACTOR.md
└── refactoring/                 # 重构记录文档
    ├── API目录重构总结.md
    └── API配置优化总结.md
```

## 📚 文档分类

### 架构设计 (architecture/)

系统架构和设计模式相关文档。

- **[缓存系统设计](./architecture/CACHE_SYSTEM_DESIGN.md)** - 多层次缓存架构设计，包括 LRU 缓存、HTTP 响应缓存、图片缓存等

### 性能优化 (optimization/)

性能优化实践和问题修复记录。

#### 缓存优化
- **[缓存失效审计](./optimization/CACHE_INVALIDATION_AUDIT.md)** - 缓存失效机制的审计报告
- **[缓存失效实现](./optimization/CACHE_INVALIDATION_IMPLEMENTATION.md)** - 缓存失效功能的实现细节
- **[缓存失效规则实现](./optimization/CACHE_INVALIDATION_RULES_IMPLEMENTATION.md)** - 缓存失效规则的具体实现

#### UI/UX 优化
- **[组件优化指南](./optimization/COMPONENT_OPTIMIZATION_GUIDE.md)** - 列表项组件的字体设计和移动端优化规范
- **[加载闪烁修复](./optimization/LOADING_FLICKER_FIX.md)** - 修复页面加载时的闪烁问题
- **[加载过渡优化](./optimization/LOADING_TRANSITION_OPTIMIZATION.md)** - 优化页面加载过渡效果
- **[路由过渡修复](./optimization/ROUTER_TRANSITION_FIX.md)** - 修复路由切换时的过渡问题
- **[路由优化实施](./optimization/ROUTER_OPTIMIZATION_2026.md)** - 路由系统全面优化（2026-03）
- **[字体重构](./optimization/TYPOGRAPHY_REFACTOR.md)** - 字体系统的重构记录

### 重构记录 (refactoring/)

代码重构和架构调整的记录文档。

- **[API 目录重构总结](./refactoring/API目录重构总结.md)** - 将 `src/axios` 重构为 `src/api` 的完整记录
- **[API 配置优化总结](./refactoring/API配置优化总结.md)** - API baseURL 配置优化，支持环境变量

## 🎯 快速导航

### 新手入门
1. 先阅读 [缓存系统设计](./architecture/CACHE_SYSTEM_DESIGN.md) 了解系统架构
2. 查看 [组件优化指南](./optimization/COMPONENT_OPTIMIZATION_GUIDE.md) 了解 UI 开发规范
3. 参考 [API 目录重构总结](./refactoring/API目录重构总结.md) 了解 API 调用方式

### 开发者指南
- **开发新组件**：参考 [组件优化指南](./optimization/COMPONENT_OPTIMIZATION_GUIDE.md)
- **API 调用**：参考 [API 目录重构总结](./refactoring/API目录重构总结.md)
- **缓存管理**：参考 [缓存系统设计](./architecture/CACHE_SYSTEM_DESIGN.md)

### 问题排查
- **加载问题**：查看 [加载闪烁修复](./optimization/LOADING_FLICKER_FIX.md) 和 [加载过渡优化](./optimization/LOADING_TRANSITION_OPTIMIZATION.md)
- **路由问题**：查看 [路由过渡修复](./optimization/ROUTER_TRANSITION_FIX.md) 和 [路由优化实施](./optimization/ROUTER_OPTIMIZATION_2026.md)
- **缓存问题**：查看缓存相关的三个文档

## 📝 文档贡献

### 添加新文档

根据文档类型放入对应目录：

- **架构设计文档** → `architecture/`
- **性能优化文档** → `optimization/`
- **重构记录文档** → `refactoring/`

### 文档命名规范

- 使用英文命名，单词间用下划线分隔
- 使用大写字母开头：`FEATURE_NAME.md`
- 中文文档可以使用中文命名，但建议添加英文别名

### 更新索引

添加新文档后，请更新本 README 文件的相应章节。

## 🔗 相关资源

- [项目根目录 README](../../README.md) - 项目整体介绍
- [API 文档](../../api.md) - 后端 API 接口文档
- [源码 README](../src/README.md) - 源码目录说明

## 📮 反馈

如有文档问题或建议，欢迎提 Issue 或 PR。
