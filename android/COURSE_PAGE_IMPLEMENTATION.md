# Android 课程详情页面实现目标文档

## 一、概述

本文档基于 Web 端课程页面的功能设计和逻辑，规划 Android 端课程详情页面的完整实现方案。目标是实现一个功能完整、模块化、组件化且与项目整体风格保持一致的课程详情页面。

## 二、页面结构分析

### 2.1 Web 端页面结构

根据 `web/src/pages/course/index.vue` 分析，页面主要包含以下部分：

1. **课程头部 (CourseHeader)**
   - 课程名称
   - 操作按钮（分享、编辑、收藏）
   - 课程基本信息（类型、教师、教学方式、学分、校区、学院、考核方式）
   - 发布时间和历史版本链接
   - 评分可视化（平均分、评分分布条形图）

2. **用户自己的评价卡片 (SelfCommentCard)**
   - 评分显示（星级）
   - 评价内容
   - 编辑/添加评价按钮

3. **评论列表 (CommentList)**
   - 其他用户的评价列表
   - 加载更多按钮
   - 空状态提示

4. **底部操作栏 (CourseActions)**
   - 左侧：用户名显示
   - 右侧：操作按钮（管理/举报、查看帖子）

5. **帖子列表对话框 (PostListDialog)**
   - 课程下的帖子列表
   - 发表帖子按钮
   - 加载更多功能

6. **对话框组件**
   - 评价编辑器 (CommentEditorDialog)
   - 帖子编辑器 (PostEditor)
   - 课程编辑器 (CourseEditor)
   - 历史版本卡片 (CourseHistoryCard)
   - 海报显示 (PosterDisplayer)

### 2.2 Android 端页面结构设计

参考 `PostDetailActivity` 的架构，课程详情页面应包含：

```
CourseDetailActivity
├── Toolbar (标题栏)
├── NestedScrollView (可滚动容器)
│   ├── CourseHeaderView (课程头部组件)
│   ├── SelfCommentCardView (用户评价卡片)
│   └── CommentListView (评论列表)
├── BottomActionBar (底部操作栏)
└── Dialog/Fragment (对话框)
    ├── CommentEditorDialog (评价编辑器)
    ├── PostListDialog (帖子列表)
    └── 其他对话框
```

## 三、功能模块详细设计

### 3.1 课程头部模块 (CourseHeaderView)

#### 3.1.1 功能需求
- 显示课程名称（支持多行，最大3行）
- 显示课程基本信息（类型、教师、教学方式、学分、校区、学院、考核方式）
- 显示发布时间
- 显示评分信息：
  - 平均分（X.X/5）
  - 星级评分显示
  - 评价数量
  - 评分分布条形图（1-5分）
- 操作按钮：
  - 分享按钮（生成分享海报）
  - 编辑按钮（提交课程信息修改）
  - 收藏按钮（StarButton）
  - 历史版本按钮

#### 3.1.2 数据模型
```java
Course {
    Integer id;
    String name;
    String type; // compulsory, elective, restricted_elective
    String college;
    String campus;
    Integer credit;
    String teacher;
    String attendMethod; // online, offline, hybrid
    String examineMethod;
    Double avgScore; // 计算得出：all_score / all_people
    Integer evaluateNum; // all_people
    List<Integer> scoreDistribution; // [1分人数, 2分人数, ..., 5分人数]
    String publishTime;
    Boolean ifStar;
}
```

#### 3.1.3 组件设计
- 使用 `CardView` 作为容器
- 使用 `RecyclerView` 或 `LinearLayout` 布局
- 评分分布使用 `ProgressBar` 实现
- 星级显示使用自定义 RatingBar 或 Material RatingBar

#### 3.1.4 注意事项
- 类型、教学方式需要转换为中文显示
- 评分分布需要计算百分比并显示进度条
- 加载状态需要显示加载指示器
- 支持主题色配置

### 3.2 用户评价卡片模块 (SelfCommentCardView)

#### 3.2.1 功能需求
- 显示用户自己的评分（星级）
- 显示用户自己的评价内容（支持链接、换行）
- 显示"暂未评价"或"我的评论"状态
- 提供"评价此课程"或"修改我的评价"按钮

#### 3.2.2 数据模型
```java
SelfComment {
    Integer score; // 1-5
    String comment;
}
```

#### 3.2.3 组件设计
- 使用 `CardView` 作为容器
- 使用 `RatingBar` 显示评分
- 使用 `TextView` 显示评价内容（支持富文本）
- 使用 `Button` 作为操作按钮

#### 3.2.4 注意事项
- 需要区分已评价和未评价状态
- 评价内容需要支持链接跳转
- 加载状态需要显示加载指示器

### 3.3 评论列表模块 (CommentListView)

#### 3.3.1 功能需求
- 显示其他用户的评价列表（排除自己的评价）
- 支持分页加载
- 显示加载更多按钮
- 显示空状态提示
- 支持无限滚动

#### 3.3.2 数据模型
```java
CourseComment {
    Integer id; // review_id
    Integer authorId; // scorer_id
    String authorName; // scorer_name
    Integer score; // 1-5
    String comment;
    String time; // publish_time
}
```

#### 3.3.3 组件设计
- 使用 `RecyclerView` 实现列表
- 使用 `CommentItemView` 作为列表项（可复用或新建）
- 使用 `LinearLayoutManager` 布局
- 添加滚动监听实现无限加载

#### 3.3.4 注意事项
- 需要过滤掉当前用户的评价
- 分页加载需要防止重复请求
- 空状态需要友好提示
- 加载状态需要显示加载指示器

### 3.4 底部操作栏模块 (BottomActionBar)

#### 3.4.1 功能需求
- 左侧显示用户头像（当前登录用户）
- 右侧显示操作按钮：
  - 管理员：显示管理按钮
  - 非管理员：显示举报按钮
  - 所有人：显示查看帖子按钮

#### 3.4.2 组件设计
- 使用 `LinearLayout` 水平布局
- 左侧：`UserAvatarView`（复用现有组件）
- 中间：`View` 作为分隔（weight=1）
- 右侧：`ImageButton` 操作按钮

#### 3.4.3 注意事项
- 参考 `PostDetailActivity` 的底部栏设计
- 按钮图标需要符合 Material Design 规范
- 需要根据用户权限显示不同按钮

### 3.5 评价编辑器对话框 (CommentEditorDialog)

#### 3.5.1 功能需求
- 星级评分选择（1-5分）
- 评价内容输入（多行文本，支持敏感词检测）
- 表情选择器
- 提交和取消按钮
- 加载状态显示

#### 3.5.2 组件设计
- 使用 `DialogFragment` 或 `BottomSheetDialog`
- 使用 `RatingBar` 选择评分
- 使用 `EditText` 输入评价内容
- 使用 `EmojiPicker` 选择表情（可选）

#### 3.5.3 注意事项
- 评分必填，提交前需要验证
- 评价内容需要敏感词检测
- 支持新建和编辑两种模式

### 3.6 帖子列表对话框 (PostListDialog)

#### 3.6.1 功能需求
- 显示课程下的帖子列表
- 支持分页加载
- 提供发表帖子按钮
- 支持帖子置顶操作（管理员）
- 支持无限滚动

#### 3.6.2 组件设计
- 使用 `BottomSheetDialog` 或 `DialogFragment`
- 使用 `RecyclerView` 显示帖子列表
- 复用 `PostItemView` 组件
- 添加滚动监听实现无限加载

#### 3.6.3 注意事项
- 帖子列表需要支持置顶排序
- 管理员可以置顶/取消置顶帖子
- 空状态需要友好提示

## 四、数据流设计

### 4.1 数据加载流程

```
Activity onCreate
├── initViews() - 初始化视图
├── initNetwork() - 初始化网络服务
└── loadData()
    ├── loadCourseDetail() - 加载课程详情
    ├── loadSelfComment() - 加载用户评价
    └── loadMoreComments() - 加载评论列表（第一页）
```

### 4.2 数据模型转换

参考 `web/src/pages/course/utils/dataTransformers.js`：

1. **课程详情转换**
   - API 返回：`course_detail` (Map)
   - 转换后：`Course` 对象
   - 计算：`avgScore = all_score / all_people`

2. **评论列表转换**
   - API 返回：`score_list` (List)
   - 转换后：`List<CourseComment>`
   - 过滤：排除当前用户的评价

3. **帖子列表转换**
   - API 返回：`post_list` (List)
   - 转换后：`List<Post>`
   - 复用现有的 Post 模型

### 4.3 状态管理

参考 Web 端的 Composables 设计：

1. **数据状态**
   - `course`: 课程数据
   - `selfComment`: 用户评价
   - `commentList`: 评论列表
   - `postList`: 帖子列表
   - `loading`: 加载状态
   - `allLoaded`: 是否全部加载

2. **UI 状态**
   - 对话框显示状态
   - 滚动位置
   - 分页信息

## 五、API 接口

### 5.1 课程详情
- **接口**: `GET /course/detail?course_id={id}`
- **响应**: `CourseDetailResponse`
- **字段映射**: 参考 `parseCourseFromMap()` 方法

### 5.2 用户评价
- **获取**: `GET /course/evaluation?user_id={userId}&course_id={courseId}`
- **提交**: `POST /course/rate` 或 `PUT /course/edit_rating`
- **响应**: `UserCourseEvaluationResponse`

### 5.3 评论列表
- **接口**: `GET /course/score_list?course_id={id}&page_index={page}&page_size={size}`
- **响应**: `CourseScoreListResponse`
- **字段**: `score_list`, `total_pages`, `current_page`

### 5.4 帖子列表
- **接口**: `GET /course/post_list?course_id={id}&page_index={page}&page_size={size}`
- **响应**: `CoursePostListResponse`
- **字段**: `post_list`, `total_pages`, `current_page`

### 5.5 其他接口
- 生成分享海报：前端生成（Android 端可暂不实现或使用 WebView）
- 课程编辑：`POST /course/edit`
- 帖子置顶：`POST /post/set_top`
- 举报：`POST /report`

## 六、组件化设计

### 6.1 可复用组件

1. **UserAvatarView** - 用户头像（已存在）
2. **PostItemView** - 帖子项（已存在，可复用）
3. **CommentItemView** - 评论项（已存在，可复用或扩展）
4. **StarButton** - 收藏按钮（需要实现）
5. **RatingBar** - 星级评分（使用 Material RatingBar）

### 6.2 新建组件

1. **CourseHeaderView** - 课程头部
   - 位置：`common/src/main/java/com/sharesdu/android/common/view/CourseHeaderView.java`
   - 布局：`common/src/main/res/layout/view_course_header.xml`

2. **SelfCommentCardView** - 用户评价卡片
   - 位置：`common/src/main/java/com/sharesdu/android/common/view/SelfCommentCardView.java`
   - 布局：`common/src/main/res/layout/view_self_comment_card.xml`

3. **CourseCommentItemView** - 课程评论项（如果 CommentItemView 不适用）
   - 位置：`common/src/main/java/com/sharesdu/android/common/view/CourseCommentItemView.java`
   - 布局：`common/src/main/res/layout/view_course_comment_item.xml`

## 七、实现步骤

### 阶段一：基础框架搭建
1. 创建 `CourseDetailActivity`
2. 创建基础布局文件
3. 实现 Toolbar 和基础结构
4. 实现数据加载框架

### 阶段二：核心组件实现
1. 实现 `CourseHeaderView` 组件
2. 实现 `SelfCommentCardView` 组件
3. 实现评论列表功能
4. 实现底部操作栏

### 阶段三：对话框功能
1. 实现评价编辑器对话框
2. 实现帖子列表对话框
3. 实现其他对话框（可选）

### 阶段四：优化和完善
1. 添加加载状态
2. 添加错误处理
3. 添加空状态提示
4. 优化用户体验
5. 添加状态恢复（可选）

## 八、注意事项

### 8.1 代码规范
- 遵循项目现有的代码风格
- 使用 Kotlin 或 Java（根据项目选择）
- 遵循 Android 开发最佳实践
- 添加必要的注释和文档

### 8.2 性能优化
- 使用 RecyclerView 实现列表
- 实现 ViewHolder 模式
- 图片加载使用 Glide 或 Picasso
- 避免内存泄漏（注意 Context 引用）

### 8.3 错误处理
- 网络请求失败处理
- 数据解析错误处理
- 空数据状态处理
- 用户友好的错误提示

### 8.4 UI/UX 一致性
- 参考 `PostDetailActivity` 的设计风格
- 使用项目统一的颜色、字体、间距
- 保持与 Web 端功能一致性
- 适配不同屏幕尺寸

### 8.5 数据安全
- 敏感词检测（评价内容）
- 输入验证
- 防止重复提交

### 8.6 测试
- 单元测试（数据转换逻辑）
- UI 测试（关键流程）
- 边界情况测试（空数据、网络错误等）

## 九、参考文件

### Web 端参考
- `web/src/pages/course/index.vue` - 主页面
- `web/src/pages/course/components/` - 组件目录
- `web/src/pages/course/utils/` - 工具函数

### Android 端参考
- `android/feature/index/src/main/java/.../PostDetailActivity.java` - 帖子详情页面
- `android/common/src/main/java/.../view/` - 通用视图组件
- `android/core/src/main/java/.../network/` - 网络接口

## 十、后续扩展

1. 状态恢复（页面返回时恢复滚动位置和加载状态）
2. 分享功能（生成分享海报）
3. 课程编辑功能
4. 历史版本查看
5. 更多交互优化

---

**文档版本**: v1.0  
**创建日期**: 2024  
**最后更新**: 2024



