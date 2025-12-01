# ShareSDU Android App 运行指南

## 🚀 快速开始

### 前置要求

1. **Android Studio**: Hedgehog (2023.1.1) 或更高版本
2. **JDK**: 17
3. **Android SDK**: 
   - minSdk: 27 (Android 8.1)
   - targetSdk: 34
   - compileSdk: 34
4. **Gradle**: 8.0+

### 配置步骤

1. **克隆/打开项目**
   ```bash
   cd android
   ```

2. **同步项目**
   - 打开Android Studio
   - 选择 "File" -> "Sync Project with Gradle Files"
   - 等待所有依赖下载完成

3. **配置API地址** (如需要)
   - 文件: `app/src/main/java/com/sharesdu/android/util/Constants.kt`
   - 修改 `BASE_URL` 变量（默认: `https://api.sharesdu.com/index/api`）

4. **构建项目**
   ```bash
   ./gradlew build
   ```

5. **运行应用**
   - 连接Android设备或启动模拟器
   - 点击Android Studio的"Run"按钮
   - 或使用命令行: `./gradlew installDebug`

## 📱 功能说明

### 已实现功能

✅ **欢迎页**
- 首次启动显示
- 登录状态检查
- 导航到登录或首页

✅ **登录**
- 用户名密码登录
- Token自动保存
- 登录成功后跳转首页

✅ **首页**
- 三个Tab: 文章、帖子、课程
- 文章排序: 时间/收藏/浏览/热度
- 列表展示
- 下拉刷新（逻辑已实现）
- 分页加载
- 点击进入详情

✅ **详情页**
- 文章详情: 显示内容、评论列表
- 帖子详情: 显示内容、回复列表
- 课程详情: 显示课程信息、评价列表

### 待完善功能

⚠️ **搜索功能**: UI已准备，待实现
⚠️ **聊天功能**: 待实现
⚠️ **个人中心**: 待实现
⚠️ **编辑器**: 待实现
⚠️ **Token自动刷新**: 逻辑已准备，待完善

## 🔧 常见问题

### 1. 编译错误

**问题**: 找不到某些类或导入错误
**解决**:
- 确保所有依赖已正确同步
- 清理并重新构建: `./gradlew clean build`
- 检查Android Studio的Build输出中的具体错误信息

### 2. 运行时错误

**问题**: App启动后崩溃
**解决**:
- 检查 `AndroidManifest.xml` 中的权限配置
- 确保网络权限已添加
- 检查日志: `adb logcat`

### 3. API连接失败

**问题**: 无法连接到服务器
**解决**:
- 检查网络连接
- 确认API地址是否正确 (`Constants.kt`)
- 检查 `network_security_config.xml` 配置
- 确保设备/模拟器可以访问目标服务器

### 4. 依赖问题

**问题**: Gradle同步失败
**解决**:
- 检查网络连接（需要访问Maven仓库）
- 更新Gradle Wrapper: `./gradlew wrapper --gradle-version=8.0`
- 清除缓存: `./gradlew clean`

## 📝 项目结构说明

```
android/app/src/main/java/com/sharesdu/android/
├── ShareSDUApplication.kt       # Application入口
├── di/                          # 依赖注入模块
│   ├── AppModule.kt
│   └── NetworkModule.kt
├── data/                        # 数据层
│   ├── local/                   # 本地存储
│   ├── remote/                  # 网络请求
│   └── repository/              # 数据仓库
├── ui/                          # UI层
│   ├── theme/                   # 主题配置
│   ├── navigation/              # 导航配置
│   ├── common/                  # 通用组件
│   └── feature/                 # 功能页面
│       ├── welcome/
│       ├── login/
│       ├── index/
│       ├── article/
│       ├── post/
│       └── course/
└── util/                        # 工具类
```

## 🔐 重要配置

### API配置

- Base URL: `Constants.kt` 中的 `BASE_URL`
- 认证方式: Bearer Token (JWT)
- Token存储: DataStore

### 权限配置

已在 `AndroidManifest.xml` 中配置:
- `INTERNET` - 网络访问
- `READ_EXTERNAL_STORAGE` - 读取存储
- `WRITE_EXTERNAL_STORAGE` - 写入存储

## 🎨 主题配置

- 主题颜色: `Constants.DEFAULT_THEME_COLOR` (#9c0c13)
- 支持深色模式
- Material3设计规范

## 🐛 调试

### 查看日志

```bash
# 查看所有日志
adb logcat

# 查看应用日志
adb logcat | grep ShareSDU

# 清除日志
adb logcat -c
```

### 网络调试

- 使用 OkHttp 的 LoggingInterceptor（已在开发模式启用）
- 查看网络请求和响应详情

## 📦 打包发布

### Debug版本

```bash
./gradlew assembleDebug
```

输出位置: `app/build/outputs/apk/debug/`

### Release版本

1. 配置签名信息（如需要）
2. 运行:
```bash
./gradlew assembleRelease
```

输出位置: `app/build/outputs/apk/release/`

## 🔄 更新日志

### v1.0.0 (当前版本)
- ✅ 基础架构搭建
- ✅ 登录功能
- ✅ 首页列表
- ✅ 详情页展示
- ✅ 导航系统

## 📚 相关文档

- [开发文档](ANDROID_APP_DEV.md) - 详细的开发指南
- [实现状态](IMPLEMENTATION_STATUS.md) - 功能实现状态
- [完善总结](PROJECT_COMPLETION.md) - 项目完善情况

## 💡 提示

1. **首次运行**: 确保设备/模拟器已连接，并且网络正常
2. **登录**: 使用有效的用户名和密码进行登录
3. **列表加载**: 如果列表为空，检查网络连接和API配置
4. **性能优化**: 列表使用LazyColumn，已做基本优化

---

**最后更新**: 2024-01-XX  
**版本**: 1.0.0  
**状态**: ✅ 可直接运行






