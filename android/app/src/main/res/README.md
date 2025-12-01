# Android 资源文件说明

本文档说明 Android 项目中配置的全局设计资源，这些资源与 web 前端项目的设计保持一致。

## 颜色资源 (colors.xml)

### 主题颜色
- `theme_color` / `theme_color_primary`: #9c0c13 (深红色) - 对应 web 项目的主题颜色
- `theme_color_light`: 浅色变体
- `theme_color_dark`: 深色变体
- `theme_color_alpha_10/20/50`: 不同透明度的主题颜色

### Material Design 3 颜色系统
- `md_theme_primary`: 主色
- `md_theme_onPrimary`: 主色上的文本颜色
- `md_theme_primaryContainer`: 主色容器
- `md_theme_onPrimaryContainer`: 主色容器上的文本颜色
- 以及其他 Material Design 3 标准颜色

### 文本颜色
- `text_primary`: 主要文本颜色 (#000000)
- `text_secondary`: 次要文本颜色 (#8a8a8a)
- `text_hint`: 提示文本颜色 (#CCCCCC)

### 背景和分割线
- `background_primary`: 主要背景色 (#FFFFFF)
- `background_secondary`: 次要背景色 (#F5F5F5)
- `divider`: 分割线颜色 (#DDDDDD)

## 主题样式 (themes.xml)

### 应用主题
- `Theme.ShareSDU`: 应用主主题，基于 Material Design 3
- 支持日夜间模式自动切换
- 已配置所有 Material Design 3 颜色属性

### 文本样式
对应 web 项目的字体大小定义：

- `TextStyle.TitleBig` / `TextStyle.TitleBigBold`: 24sp
- `TextStyle.PageTitleBold`: 22sp
- `TextStyle.Title` / `TextStyle.TitleBold`: 18sp
- `TextStyle.Medium` / `TextStyle.MediumBold`: 16sp
- `TextStyle.Small` / `TextStyle.SmallBold`: 14sp
- `TextStyle.Tiny` / `TextStyle.TinyBold`: 12sp
- `TextStyle.Min` / `TextStyle.MinBold`: 10sp
- `TextStyle.LogoText`: 20sp，主题色，粗体
- `TextStyle.LogoTextWhite`: 20sp，白色，粗体

## 尺寸资源 (dimens.xml)

### 字体大小
- `text_size_title_big`: 24sp
- `text_size_page_title`: 22sp
- `text_size_logo`: 20sp
- `text_size_title`: 18sp
- `text_size_medium`: 16sp
- `text_size_small`: 14sp
- `text_size_tiny`: 12sp
- `text_size_min`: 10sp

### 间距
- `spacing_tiny/small/medium/large/xlarge/xxlarge`: 4dp, 8dp, 12dp, 16dp, 24dp, 32dp
- `padding_*`: 内边距
- `margin_*`: 外边距

### 圆角半径
- `corner_radius_small/medium/large/xlarge`: 4dp, 8dp, 12dp, 20dp

### 图标大小
- `icon_size_small/medium/large/xlarge`: 16dp, 24dp, 32dp, 48dp

### 组件高度
- `button_height_small/medium/large`: 32dp, 40dp, 48dp
- `nav_bar_height`: 45dp
- `bottom_nav_height`: 50dp
- `search_input_height`: 35dp

## 组件样式 (styles.xml)

### 按钮样式
- `Button.Primary`: 主要按钮，主题色背景
- `Button.Secondary`: 次要按钮，主题色边框
- `Button.Text`: 文本按钮，主题色文本

### 卡片样式
- `Card.Default`: 默认卡片样式，带圆角和阴影

### 输入框样式
- `TextInputLayout.Default`: 默认输入框样式，主题色边框

### 工具栏样式
- `Toolbar.Default`: 默认工具栏，主题色背景

### 底部导航栏样式
- `BottomNavigation.Default`: 默认底部导航栏样式

## 使用示例

### 在布局文件中使用颜色
```xml
<TextView
    android:textColor="@color/theme_color"
    android:background="@color/background_primary" />
```

### 在布局文件中使用尺寸
```xml
<TextView
    android:textSize="@dimen/text_size_title"
    android:padding="@dimen/padding_medium" />
```

### 在布局文件中使用文本样式
```xml
<TextView
    style="@style/TextStyle.TitleBold" />
```

### 在布局文件中使用组件样式
```xml
<com.google.android.material.button.MaterialButton
    style="@style/Button.Primary"
    android:text="确定" />
```

### 在代码中使用资源
```kotlin
// 获取颜色
val themeColor = ContextCompat.getColor(context, R.color.theme_color)

// 获取尺寸
val textSize = resources.getDimensionPixelSize(R.dimen.text_size_title)

// 获取字符串
val appName = getString(R.string.app_name)
```

## 图标库

项目使用 Material Design 库 (`com.google.android.material:material:1.12.0`)，该库包含了常用的 Material Icons。

如果需要更多图标，可以：
1. 使用 Material Icons 字体文件
2. 添加自定义图标资源到 `drawable` 目录
3. 使用第三方图标库（如 FontAwesome、Ionicons 等）

## 注意事项

1. 所有颜色值都使用 ARGB 格式（如 #FF9c0c13）
2. 字体大小使用 `sp` 单位，以便根据用户字体大小设置自动缩放
3. 间距和尺寸使用 `dp` 单位，以确保在不同屏幕密度下的一致性
4. 主题支持日夜间模式自动切换
5. 所有资源都遵循 Material Design 3 设计规范

