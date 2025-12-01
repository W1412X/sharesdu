plugins {
    id("com.android.library")
}

android {
    namespace = "com.sharesdu.android.feature.service"
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
    // 依赖其他模块
    implementation(project(":core"))
    implementation(project(":data"))
    implementation(project(":common"))
    
    // AndroidX 核心库
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.fragment:fragment:1.6.2")
    
    // Material Design
    implementation("com.google.android.material:material:1.12.0")
}

