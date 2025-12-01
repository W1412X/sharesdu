pluginManagement {
    repositories {
        // 阿里云镜像 - 插件管理（优先）
        maven { url = uri("https://maven.aliyun.com/repository/gradle-plugin") }
        maven { url = uri("https://maven.aliyun.com/repository/google") }
        maven { url = uri("https://maven.aliyun.com/repository/central") }
        maven { url = uri("https://maven.aliyun.com/repository/public") }
        // 腾讯云镜像（备用）
        maven { url = uri("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/") }
        // Gradle Plugin Portal（必需，用于部分官方插件）
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        // 阿里云镜像 - 依赖仓库
        maven { url = uri("https://maven.aliyun.com/repository/google") }
        maven { url = uri("https://maven.aliyun.com/repository/central") }
        maven { url = uri("https://maven.aliyun.com/repository/public") }
        maven { url = uri("https://maven.aliyun.com/repository/jcenter") }
        // 腾讯云镜像（备用）
        maven { url = uri("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/") }
        // JitPack 用于 GitHub 库（保留，因为部分库只有这个源）
        maven { url = uri("https://jitpack.io") }
    }
}

rootProject.name = "ShareSDU"

// 核心模块
include(":core")
// 数据模块
include(":data")
// 通用组件模块
include(":common")
// 功能模块
include(":feature:index")
include(":feature:auth")
include(":feature:self")
include(":feature:service")
include(":feature:author")
// 应用模块
include(":app")
 