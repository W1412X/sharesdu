plugins {
    id("com.android.library")
}

android {
    namespace = "com.sharesdu.android.data"
    compileSdk = 34

    defaultConfig {
        minSdk = 27
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
}

dependencies {
    // 依赖 core 模块
    implementation(project(":core"))
    
    // JSON 处理
    implementation("com.google.code.gson:gson:2.10.1")
}

