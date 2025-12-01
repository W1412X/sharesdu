# Android 项目模块化结构说明

## 模块划分

### 1. :core 模块 - 核心基础模块
**职责**: 提供项目的基础设施和核心功能

**包含内容**:
- 网络层: `ApiClient`, `ApiConfig`, `AuthInterceptor`, `ErrorHandlerInterceptor`
- 工具类: `TokenManager`, `ErrorHandler`
- 基础类: `BaseActivity`, `BaseFragment` (待创建)
- API 接口定义: 所有 Service 接口

**依赖**: 仅依赖 Android 系统和第三方库

### 2. :data 模块 - 数据层模块
**职责**: 数据模型和响应类

**包含内容**:
- Model 类: `Post`, `Article`, `Course`
- Response 类: 所有 Response 类 (`PostListResponse`, `ArticleListResponse` 等)

**依赖**: `:core`

### 3. :common 模块 - 通用组件模块
**职责**: 可复用的 UI 组件和工具

**包含内容**:
- Adapters: 所有 RecyclerView 适配器
- Custom Views: `PostItemView`, `ArticleItemView`, `CourseItemView` 等
- 通用工具类: `ImageCache`, `PostContentParser`

**依赖**: `:core`, `:data`

### 4. :feature 模块 - 功能模块
按功能划分的独立模块，每个模块代表一个业务功能。

#### :feature:index - 首页模块
- `IndexFragment`
- 相关 Activity

#### :feature:auth - 认证模块
- `LoginActivity`
- `LaunchActivity`
- `SplashActivity`

#### :feature:self - 个人中心模块
- `SelfFragment` 及其子 Fragment
- 相关 Adapters

#### :feature:service - 服务模块
- `ServiceFragment`

#### :feature:author - 作者页面模块
- `AuthorActivity`
- `AuthorContentFragment`

### 5. :app 模块 - 应用模块
**职责**: 应用程序入口和主界面

**包含内容**:
- `MainActivity`
- Application 类（如果有）
- AndroidManifest.xml
- 应用级别的资源文件

**依赖**: 所有其他模块

## 包名规范

- `:core`: `com.sharesdu.android.core.*`
- `:data`: `com.sharesdu.android.data.*`
- `:common`: `com.sharesdu.android.common.*`
- `:feature:index`: `com.sharesdu.android.feature.index.*`
- `:feature:auth`: `com.sharesdu.android.feature.auth.*`
- `:feature:self`: `com.sharesdu.android.feature.self.*`
- `:feature:service`: `com.sharesdu.android.feature.service.*`
- `:feature:author`: `com.sharesdu.android.feature.author.*`
- `:app`: `com.sharesdu.android.*` (保留原有包名)

## 迁移步骤

1. 创建所有模块的 build.gradle.kts 文件 ✓
2. 更新 settings.gradle.kts 添加所有模块 ✓
3. 迁移核心代码到 :core 模块
4. 迁移数据模型到 :data 模块
5. 迁移通用组件到 :common 模块
6. 迁移功能代码到对应的 :feature 模块
7. 更新 app 模块的依赖配置
8. 更新所有导入语句

## 注意事项

- 模块间的依赖关系要清晰，避免循环依赖
- 资源文件（layout、drawable等）需要根据使用情况分配到相应模块
- R 类引用需要更新为对应模块的包名
- AndroidManifest.xml 中的 Activity 声明需要保留在 :app 模块

