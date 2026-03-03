# API 目录重构总结

## 概述

将 `src/axios` 目录重构为 `src/api` 目录，采用更语义化的命名和模块化的组织结构。

## 目录结构变化

### 重构前
```
src/axios/
├── axios.js              # 请求实例
├── article.js            # 文章 API
├── account.js            # 账户 API
├── post.js               # 帖子 API
└── ... (其他 API 文件)
```

### 重构后
```
src/api/
├── index.js              # 统一导出所有 API
├── request.js            # 请求实例配置（原 axios.js）
├── README.md             # API 使用文档
└── modules/              # API 模块目录
    ├── article.js        # 文章相关 API
    ├── account.js        # 账户相关 API
    ├── post.js           # 帖子相关 API
    ├── course.js         # 课程相关 API
    ├── chat.js           # 聊天相关 API
    ├── image.js          # 图片相关 API
    ├── resource.js       # 资源相关 API
    ├── search.js         # 搜索相关 API
    ├── star.js           # 收藏相关 API
    ├── like.js           # 点赞相关 API
    ├── notification.js   # 通知相关 API
    ├── manage.js         # 管理相关 API
    ├── block.js          # 屏蔽相关 API
    ├── invite.js         # 邀请相关 API
    ├── top.js            # 置顶相关 API
    ├── token.js          # Token 相关 API
    └── statusCodeMessages.js  # 状态码消息
```

## 主要变更

### 1. 目录重命名
- `src/axios` → `src/api`
- 更语义化，明确表示这是 API 相关代码

### 2. 文件重命名
- `axios.js` → `request.js`
- 更清晰地表达文件用途（请求配置）

### 3. 模块化组织
- 所有 API 文件移动到 `modules/` 目录
- 按功能分类，便于管理和查找

### 4. 统一导出
- 创建 `api/index.js` 统一导出所有 API
- 支持从统一入口导入，简化使用

### 5. 导入路径更新
- 所有文件中的导入路径已更新
- 从 `@/axios/xxx` 改为 `@/api/modules/xxx` 或 `@/api`

## 路径对照表

| 旧路径 | 新路径（方式一） | 新路径（方式二） |
|--------|----------------|----------------|
| `@/axios/axios` | `@/api/request` | `@/api/request` |
| `@/axios/article` | `@/api` | `@/api/modules/article` |
| `@/axios/account` | `@/api` | `@/api/modules/account` |
| `@/axios/post` | `@/api` | `@/api/modules/post` |
| `@/axios/course` | `@/api` | `@/api/modules/course` |
| `@/axios/image` | `@/api` | `@/api/modules/image` |
| `@/axios/resource` | `@/api` | `@/api/modules/resource` |
| `@/axios/search` | `@/api` | `@/api/modules/search` |
| `@/axios/star` | `@/api` | `@/api/modules/star` |
| `@/axios/like` | `@/api` | `@/api/modules/like` |
| `@/axios/notification` | `@/api` | `@/api/modules/notification` |
| `@/axios/manage` | `@/api` | `@/api/modules/manage` |
| `@/axios/block` | `@/api` | `@/api/modules/block` |
| `@/axios/invite` | `@/api` | `@/api/modules/invite` |
| `@/axios/top` | `@/api` | `@/api/modules/top` |
| `@/axios/token` | `@/api` | `@/api/modules/token` |
| `@/axios/statusCodeMessages` | `@/api` | `@/api/modules/statusCodeMessages` |

## 使用示例

### 方式一：从统一入口导入（推荐）

```javascript
// 导入多个 API
import { 
  createArticle, 
  getArticleList,
  loginWithPassword,
  createPost
} from '@/api';

// 导入请求实例
import { request, axiosInstanceNoHeader } from '@/api';
```

### 方式二：从模块导入

```javascript
// 从特定模块导入
import { createArticle, getArticleList } from '@/api/modules/article';
import { loginWithPassword } from '@/api/modules/account';

// 导入请求实例
import request from '@/api/request';
import { axiosInstanceNoHeader } from '@/api/request';
```

## 修改的文件统计

- **新建文件：** 1 个（`api/index.js`）
- **重命名文件：** 1 个（`axios.js` → `request.js`）
- **移动文件：** 17 个（所有 API 文件移动到 `modules/`）
- **更新导入路径：** 51+ 个文件

## 优势

1. **语义化命名**：`api` 比 `axios` 更清晰地表达目录用途
2. **模块化组织**：所有 API 文件集中在 `modules` 目录，便于管理
3. **统一导出**：通过 `index.js` 提供统一的导入入口，简化使用
4. **易于维护**：清晰的文件结构便于查找和管理
5. **类型支持**：未来可以轻松添加 TypeScript 类型定义（在 `types/` 目录）

## 验证

- ✅ 所有导入路径已更新
- ✅ 构建测试通过
- ✅ 无 linter 错误
- ✅ 所有 API 模块正常工作

## 注意事项

1. **向后兼容**：旧的 `axios` 目录可以保留一段时间作为备份
2. **逐步迁移**：如果发现遗漏的导入，可以继续更新
3. **文档更新**：已创建 `api/README.md` 说明新的使用方式

## 后续建议

1. **TypeScript 支持**：如果项目迁移到 TypeScript，可以在 `api/types/` 目录添加类型定义
2. **API 文档**：可以为每个 API 模块添加详细的 JSDoc 注释
3. **Mock 数据**：可以创建 `api/mocks/` 目录用于开发时的 Mock 数据
4. **测试**：可以为 API 模块添加单元测试

