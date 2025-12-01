plugins {
    id("com.android.library")
}

android {
    namespace = "com.sharesdu.android.common"
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
    // 依赖 core 和 data 模块
    implementation(project(":core"))
    implementation(project(":data"))
    
    // AndroidX 核心库
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.constraintlayout:constraintlayout:2.2.1")
    
    // Material Design
    implementation("com.google.android.material:material:1.12.0")
    
    // 图片加载库
    implementation("com.github.bumptech.glide:glide:4.16.0")
    
    // 图片缩放查看库
    implementation("com.github.chrisbanes:PhotoView:2.3.0")
    
    // ViewPager2 支持多图滑动
    implementation("androidx.viewpager2:viewpager2:1.1.0-beta02")
    
    // ExifInterface支持
    implementation("androidx.exifinterface:exifinterface:1.3.6")
    
    // Activity Result API支持
    implementation("androidx.activity:activity:1.8.0")
    
    // Retrofit（用于 Adapter 中的网络请求）
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
}

