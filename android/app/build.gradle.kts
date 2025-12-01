plugins {
    id("com.android.application")
}

android {
    namespace = "com.sharesdu.android"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.sharesdu.android"
        minSdk = 27
        targetSdk = 33
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
}

dependencies {
    // 模块依赖 - 按依赖顺序添加
    implementation(project(":core"))
    implementation(project(":data"))
    implementation(project(":common"))
    implementation(project(":feature:index"))
    implementation(project(":feature:auth"))
    implementation(project(":feature:self"))
    implementation(project(":feature:service"))
    implementation(project(":feature:author"))
    
    // AndroidX 核心库
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.1")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.fragment:fragment:1.6.2")
    
    // Material Design 3 - 包含基础 Material Icons
    // Material Design 库已经包含了常用的 Material Icons
    // 如果需要更多图标，可以使用 Material Icons 字体文件或自定义图标资源
    implementation("com.google.android.material:material:1.12.0")
    
    // 动画库
    implementation("com.airbnb.android:lottie:3.7.0")
    
    // 图片加载库
    implementation("com.github.bumptech.glide:glide:4.16.0")
    
    // 图片缩放查看库
    implementation("com.github.chrisbanes:PhotoView:2.3.0")
    
    // 网络库（app 模块的 Activity 直接使用）
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    
    // 测试库
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}