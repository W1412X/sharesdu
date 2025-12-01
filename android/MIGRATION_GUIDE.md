# 代码迁移指南

## 迁移策略

由于代码文件较多，建议采用以下步骤进行迁移：

### 阶段 1: Core 模块迁移

**需要迁移的文件**:
- `network/ApiConfig.java` → `core/src/main/java/com/sharesdu/android/core/network/ApiConfig.java`
- `network/ApiClient.java` → `core/src/main/java/com/sharesdu/android/core/network/ApiClient.java`
- `network/ApiResponse.java` → `core/src/main/java/com/sharesdu/android/core/network/ApiResponse.java`
- `network/AuthInterceptor.java` → `core/src/main/java/com/sharesdu/android/core/network/AuthInterceptor.java`
- `network/ErrorHandlerInterceptor.java` → `core/src/main/java/com/sharesdu/android/core/network/ErrorHandlerInterceptor.java`
- `network/*Service.java` → `core/src/main/java/com/sharesdu/android/core/network/`
- `utils/TokenManager.java` → `core/src/main/java/com/sharesdu/android/core/utils/TokenManager.java`
- `utils/ErrorHandler.java` → `core/src/main/java/com/sharesdu/android/core/utils/ErrorHandler.java`

**包名修改**: `com.sharesdu.android.network` → `com.sharesdu.android.core.network`
**包名修改**: `com.sharesdu.android.utils` → `com.sharesdu.android.core.utils` (仅 TokenManager, ErrorHandler)

### 阶段 2: Data 模块迁移

**需要迁移的文件**:
- `model/*.java` → `data/src/main/java/com/sharesdu/android/data/model/`
- `network/response/*.java` → `data/src/main/java/com/sharesdu/android/data/response/`

**包名修改**: `com.sharesdu.android.model` → `com.sharesdu.android.data.model`
**包名修改**: `com.sharesdu.android.network.response` → `com.sharesdu.android.data.response`

### 阶段 3: Common 模块迁移

**需要迁移的文件**:
- `adapter/*.java` → `common/src/main/java/com/sharesdu/android/common/adapter/`
- `view/*.java` → `common/src/main/java/com/sharesdu/android/common/view/`
- `utils/ImageCache.java` → `common/src/main/java/com/sharesdu/android/common/utils/`
- `utils/PostContentParser.java` → `common/src/main/java/com/sharesdu/android/common/utils/`

**包名修改**: `com.sharesdu.android.adapter` → `com.sharesdu.android.common.adapter`
**包名修改**: `com.sharesdu.android.view` → `com.sharesdu.android.common.view`
**包名修改**: `com.sharesdu.android.utils` → `com.sharesdu.android.common.utils` (ImageCache, PostContentParser)

### 阶段 4: Feature 模块迁移

**需要迁移的文件**:

#### :feature:index
- `fragment/IndexFragment.java` → `feature/index/src/main/java/com/sharesdu/android/feature/index/IndexFragment.java`

#### :feature:auth
- `LoginActivity.java` → `feature/auth/src/main/java/com/sharesdu/android/feature/auth/LoginActivity.java`
- `LaunchActivity.java` → `feature/auth/src/main/java/com/sharesdu/android/feature/auth/LaunchActivity.java`

#### :feature:self
- `fragment/SelfFragment.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/SelfFragment.java`
- `fragment/SelfAccountFragment.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/SelfAccountFragment.java`
- `fragment/SelfChatFragment.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/SelfChatFragment.java`
- `fragment/SelfInfoFragment.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/SelfInfoFragment.java`
- `fragment/SelfNotificationFragment.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/SelfNotificationFragment.java`
- `fragment/SelfSettingFragment.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/SelfSettingFragment.java`
- `fragment/SelfStarFragment.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/SelfStarFragment.java`
- `fragment/SelfWriteFragment.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/SelfWriteFragment.java`
- `adapter/SelfMenuAdapter.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/SelfMenuAdapter.java`
- `adapter/StarFolderAdapter.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/StarFolderAdapter.java`
- `adapter/NotificationAdapter.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/NotificationAdapter.java`
- `adapter/ChatUserAdapter.java` → `feature/self/src/main/java/com/sharesdu/android/feature/self/ChatUserAdapter.java`

#### :feature:service
- `fragment/ServiceFragment.java` → `feature/service/src/main/java/com/sharesdu/android/feature/service/ServiceFragment.java`

#### :feature:author
- `activity/AuthorActivity.java` → `feature/author/src/main/java/com/sharesdu/android/feature/author/AuthorActivity.java`
- `fragment/AuthorContentFragment.java` → `feature/author/src/main/java/com/sharesdu/android/feature/author/AuthorContentFragment.java`
- `adapter/AuthorContentAdapter.java` → `feature/author/src/main/java/com/sharesdu/android/feature/author/AuthorContentAdapter.java`

### 阶段 5: 更新导入语句

迁移完成后，需要更新所有文件中的导入语句：

1. 使用 IDE 的批量替换功能或全局搜索替换：
   - `import com.sharesdu.android.network.` → `import com.sharesdu.android.core.network.`
   - `import com.sharesdu.android.model.` → `import com.sharesdu.android.data.model.`
   - `import com.sharesdu.android.network.response.` → `import com.sharesdu.android.data.response.`
   - `import com.sharesdu.android.adapter.` → `import com.sharesdu.android.common.adapter.`
   - `import com.sharesdu.android.view.` → `import com.sharesdu.android.common.view.`
   - `import com.sharesdu.android.utils.TokenManager` → `import com.sharesdu.android.core.utils.TokenManager`
   - `import com.sharesdu.android.utils.ErrorHandler` → `import com.sharesdu.android.core.utils.ErrorHandler`
   - `import com.sharesdu.android.utils.ImageCache` → `import com.sharesdu.android.common.utils.ImageCache`
   - `import com.sharesdu.android.utils.PostContentParser` → `import com.sharesdu.android.common.utils.PostContentParser`

2. 更新 R 类引用（如果需要）:
   - 模块内的资源使用本模块的 R 类，例如：`com.sharesdu.android.feature.index.R`
   - 跨模块访问资源需要明确指定模块

### 阶段 6: 更新 app 模块依赖

更新 `app/build.gradle.kts`，添加所有模块依赖：

```kotlin
dependencies {
    // 模块依赖
    implementation(project(":core"))
    implementation(project(":data"))
    implementation(project(":common"))
    implementation(project(":feature:index"))
    implementation(project(":feature:auth"))
    implementation(project(":feature:self"))
    implementation(project(":feature:service"))
    implementation(project(":feature:author"))
    
    // 其他依赖...
}
```

## 注意事项

1. **ErrorHandlerInterceptor 依赖问题**: 该拦截器引用了 `LoginActivity`，需要修改为使用接口或回调，避免直接依赖 Activity 类。

2. **资源文件迁移**: 
   - layout 文件需要根据使用情况迁移到对应模块
   - drawable、string 等资源同样需要合理分配

3. **AndroidManifest.xml**: Activity 声明保留在 app 模块的 AndroidManifest.xml 中

4. **测试**: 迁移完成后需要全面测试各个功能模块

## 自动化迁移脚本

可以使用以下 shell 脚本辅助迁移（需要根据实际情况调整）：

```bash
#!/bin/bash

# 1. 迁移 core 模块网络层
mkdir -p core/src/main/java/com/sharesdu/android/core/network
cp -r app/src/main/java/com/sharesdu/android/network/* core/src/main/java/com/sharesdu/android/core/network/

# 2. 迁移 data 模块
mkdir -p data/src/main/java/com/sharesdu/android/data/model
mkdir -p data/src/main/java/com/sharesdu/android/data/response
cp -r app/src/main/java/com/sharesdu/android/model/* data/src/main/java/com/sharesdu/android/data/model/
cp -r app/src/main/java/com/sharesdu/android/network/response/* data/src/main/java/com/sharesdu/android/data/response/

# 3. 迁移 common 模块
mkdir -p common/src/main/java/com/sharesdu/android/common/adapter
mkdir -p common/src/main/java/com/sharesdu/android/common/view
cp -r app/src/main/java/com/sharesdu/android/adapter/* common/src/main/java/com/sharesdu/android/common/adapter/
cp -r app/src/main/java/com/sharesdu/android/view/* common/src/main/java/com/sharesdu/android/common/view/

# 注意：迁移后需要手动修改包名和导入语句
```

