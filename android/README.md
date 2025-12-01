# ShareSDU Android App

基于Android原生开发的ShareSDU应用，采用MVVM架构，使用Jetpack Compose构建UI。

## 技术栈

- **语言**: Kotlin
- **架构**: MVVM (Model-View-ViewModel)
- **UI框架**: Jetpack Compose
- **依赖注入**: Hilt
- **网络**: Retrofit + OkHttp
- **数据存储**: DataStore / Room
- **异步**: Coroutines + Flow
- **导航**: Navigation Component
- **图片加载**: Coil

## 项目结构

```
android/app/src/main/java/com/sharesdu/android/
├── ShareSDUApplication.kt        # Application类
├── di/                           # 依赖注入模块
│   ├── AppModule.kt
│   └── NetworkModule.kt
├── data/                         # 数据层
│   ├── local/                    # 本地数据
│   │   └── datastore/
│   │       └── PreferencesManager.kt
│   ├── remote/                   # 远程数据
│   │   ├── api/
│   │   │   └── ApiService.kt
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   └── interceptor/
│   │       └── AuthInterceptor.kt
│   └── repository/               # 数据仓库
│       ├── AccountRepository.kt
│       └── ArticleRepository.kt
├── ui/                           # UI层
│   ├── theme/                    # 主题
│   │   ├── Theme.kt
│   │   └── Type.kt
│   ├── navigation/               # 导航
│   │   └── NavGraph.kt
│   └── feature/                  # 功能模块
│       ├── welcome/
│       ├── login/
│       └── index/
└── util/                         # 工具类
    └── Constants.kt
```

## 快速开始

### 1. 环境要求

- Android Studio Hedgehog (2023.1.1) 或更高版本
- JDK 17
- Android SDK 27+
- Gradle 8.0+

### 2. 配置

1. 打开项目
2. Sync Project with Gradle Files
3. 确保API Base URL配置正确（`Constants.kt`）

### 3. 运行

```bash
# 同步Gradle
./gradlew build

# 安装到设备
./gradlew installDebug
```

## 主要功能

### 已实现

- ✅ 欢迎页
- ✅ 登录功能（用户名密码登录）
- ✅ 首页框架（Tab切换）
- ✅ 网络请求封装
- ✅ Token管理
- ✅ 数据存储（DataStore）

### 待完善

- ⚠️ 首页列表展示
- ⚠️ 文章/帖子/课程详情页
- ⚠️ 搜索功能
- ⚠️ 聊天功能
- ⚠️ 编辑器
- ⚠️ 个人中心

## 架构说明

### MVVM架构

```
UI (Compose Screen)
    ↓ (观察State)
ViewModel
    ↓ (调用Repository)
Repository
    ↓ (选择数据源)
Local DataStore / Remote API
```

### 数据流

1. **UI层**: Compose Screen观察ViewModel的State
2. **ViewModel**: 管理UI状态，调用Repository获取数据
3. **Repository**: 统一数据源，处理缓存和远程数据
4. **数据层**: DataStore存储用户信息，API获取远程数据

## API接口

所有API接口与Web端保持一致，Base URL:
```
https://api.sharesdu.com/index/api
```

主要API模块：
- Account API: 账户相关
- Article API: 文章相关
- Post API: 帖子相关
- Course API: 课程相关
- Search API: 搜索相关
- Chat API: 聊天相关

## 开发规范

### 命名规范

- **类名**: PascalCase (`LoginViewModel`)
- **函数/变量**: camelCase (`getUserInfo()`)
- **常量**: UPPER_SNAKE_CASE (`BASE_URL`)
- **资源文件**: snake_case (`ic_launcher.xml`)

### 代码组织

- 按功能模块划分包结构
- 每个功能模块独立，低耦合
- 公共组件放在common包下

## 依赖版本

详见 `build.gradle.kts` 文件。

## 文档

- [开发文档](ANDROID_APP_DEV.md) - 详细的开发指南
- [实现状态](IMPLEMENTATION_STATUS.md) - 当前实现状态和待办事项

## 注意事项

1. **首次运行前**: 需要修复一些Kotlin语法问题（详见实现状态文档）
2. **API配置**: 确保API Base URL和网络权限配置正确
3. **Token管理**: Token存储在DataStore中，自动添加到请求头

## 后续计划

1. 完善首页列表展示
2. 实现详情页面
3. 添加其他功能模块
4. 优化用户体验
5. 添加测试

## 许可证

本项目属于ShareSDU团队。

---

**版本**: 1.0.0  
**最后更新**: 2024-01-XX






