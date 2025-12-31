# API 模块结构

## 目录结构

```
src/api/
├── index.js              # 统一导出所有 API
├── request.js            # Axios 请求实例配置（原 axios.js）
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
    ├── token.js           # Token 相关 API
    └── statusCodeMessages.js  # 状态码消息
```

## 使用方式

### 方式一：从统一入口导入（推荐）

```javascript
// 导入所有 API
import { 
  createArticle, 
  getArticleList,
  loginWithPassword,
  // ... 其他 API
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
import axiosInstance from '@/api/request';
import { axiosInstanceNoHeader } from '@/api/request';
```

## 请求实例

### request (axiosInstance)

带缓存的请求实例，自动处理 token 认证。

**特性：**
- 自动添加 Authorization header
- GET 请求自动缓存
- 请求拦截器自动更新 token

**使用示例：**
```javascript
import { request } from '@/api';

// GET 请求（带缓存）
const response = await request.get('/article/list');

// POST 请求
const response = await request.post('/article/create', data);
```

### axiosInstanceNoHeader

不带认证头的请求实例，用于公开接口。

**使用示例：**
```javascript
import { axiosInstanceNoHeader } from '@/api';

// 公开接口请求
const response = await axiosInstanceNoHeader.get('/public/info');
```

## API 模块说明

### article.js
文章相关操作：
- `createArticle(data)` - 创建文章
- `editArticle(data)` - 编辑文章
- `getArticleDetail(id)` - 获取文章详情
- `getArticleList(sort, tag, page, useCache)` - 获取文章列表
- `deleteArticle(id)` - 删除文章
- `setArticleTop(id, ifTop)` - 设置文章置顶

### account.js
账户相关操作：
- `registerByEmail(data)` - 邮箱注册
- `loginWithPassword(data)` - 密码登录
- `getRegisterEmailCode(email, inviteCode)` - 获取注册验证码
- `loginWithEmailCode(email, code)` - 验证码登录
- `resetPassword(data)` - 重置密码
- `getResetPasswordEmailCode(email)` - 获取重置密码验证码
- `updateProfile(data)` - 更新个人资料
- `getUserInfo(userId)` - 获取用户信息

### post.js
帖子相关操作：
- `createPost(data)` - 创建帖子
- `getPostDetail(id)` - 获取帖子详情
- `getPostListByArticleId(articleId, page, useCache)` - 获取帖子列表
- `deletePost(id)` - 删除帖子
- `replyPost(data)` - 回复帖子

### course.js
课程相关操作：
- `createCourse(data)` - 创建课程
- `getCourseDetail(id)` - 获取课程详情
- `getCourseList(page, useCache)` - 获取课程列表
- `deleteCourse(id)` - 删除课程

### image.js
图片相关操作：
- `uploadArticleImage(file)` - 上传文章图片
- `uploadProfileImage(file)` - 上传头像

### resource.js
资源相关操作：
- `uploadResource(file, articleId, uiFunc)` - 上传资源文件
- `downloadResource(articleId, articleTitle, uiFunc)` - 下载资源文件

### search.js
搜索相关操作：
- `search(data)` - 执行搜索

### star.js
收藏相关操作：
- `starArticle(id)` - 收藏文章
- `unstarArticle(id)` - 取消收藏文章
- `getStarList(userId, page)` - 获取收藏列表

### like.js
点赞相关操作：
- `likeArticle(id)` - 点赞文章
- `unlikeArticle(id)` - 取消点赞文章

### notification.js
通知相关操作：
- `getNotificationList(page)` - 获取通知列表
- `markNotificationAsRead(id)` - 标记通知为已读

### manage.js
管理相关操作：
- `getManageList(type, page)` - 获取管理列表
- `deleteItem(type, id)` - 删除项目
- `blockUser(userId)` - 屏蔽用户

### token.js
Token 相关操作：
- `getAccessToken(refreshToken)` - 通过 refresh token 获取 access token

### statusCodeMessages.js
状态码消息：
- `getNetworkErrorResponse()` - 获取网络错误响应

## 迁移说明

### 从旧路径迁移

**旧导入方式：**
```javascript
import { createArticle } from '@/axios/article';
import axiosInstance from '@/axios/axios';
```

**新导入方式：**
```javascript
// 方式一：统一入口（推荐）
import { createArticle } from '@/api';
import { request } from '@/api';

// 方式二：模块导入
import { createArticle } from '@/api/modules/article';
import axiosInstance from '@/api/request';
```

### 路径对照表

| 旧路径 | 新路径 |
|--------|--------|
| `@/axios/axios` | `@/api/request` |
| `@/axios/article` | `@/api/modules/article` |
| `@/axios/account` | `@/api/modules/account` |
| `@/axios/post` | `@/api/modules/post` |
| `@/axios/course` | `@/api/modules/course` |
| `@/axios/image` | `@/api/modules/image` |
| `@/axios/resource` | `@/api/modules/resource` |
| `@/axios/search` | `@/api/modules/search` |
| `@/axios/star` | `@/api/modules/star` |
| `@/axios/like` | `@/api/modules/like` |
| `@/axios/notification` | `@/api/modules/notification` |
| `@/axios/manage` | `@/api/modules/manage` |
| `@/axios/block` | `@/api/modules/block` |
| `@/axios/invite` | `@/api/modules/invite` |
| `@/axios/top` | `@/api/modules/top` |
| `@/axios/token` | `@/api/modules/token` |
| `@/axios/statusCodeMessages` | `@/api/modules/statusCodeMessages` |

## 优势

1. **语义化命名**：`api` 比 `axios` 更清晰地表达目录用途
2. **模块化组织**：所有 API 文件集中在 `modules` 目录
3. **统一导出**：通过 `index.js` 提供统一的导入入口
4. **易于维护**：清晰的文件结构便于查找和管理
5. **类型支持**：未来可以轻松添加 TypeScript 类型定义

## 注意事项

1. 所有 API 函数都返回 Promise，需要使用 `await` 处理
2. 错误处理由各模块统一处理，返回标准格式的错误对象
3. GET 请求默认启用缓存，可通过 `useCache` 参数控制
4. 所有需要认证的请求会自动添加 Authorization header

