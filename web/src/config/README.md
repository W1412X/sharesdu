# 配置文件说明

## 概述

所有应用配置已从 `main.js` 中提取到 `src/config/index.js`，支持通过环境变量进行配置。

## 配置文件结构

### `src/config/index.js`

包含以下配置项：

- **API 配置** (`apiConfig`)
  - `baseURL`: API 基础 URL

- **学院列表** (`colleges`)
  - 所有学院名称数组

- **校区列表** (`campus`)
  - 所有校区名称数组

- **课程配置**
  - `courseTypes`: 课程类型列表
  - `teachMethods`: 教学方式列表
  - `examineMethods`: 考核方式列表

- **主题配置** (`themeConfig`)
  - `defaultColor`: 默认主题颜色

- **版本配置** (`versionConfig`)
  - `globalVersion`: 应用版本号

- **图片资源字典** (`getImageDict()`)
  - 返回图片资源路径配置

## 环境变量配置

### 支持的环境变量

在 `.env.development` 或 `.env.production` 文件中可以设置以下环境变量：

- `VUE_APP_API_BASE_URL`: API 基础 URL（默认: `https://api.sharesdu.com/index/api`）
- `VUE_APP_THEME_COLOR`: 主题颜色（默认: `#9c0c13`）
- `VUE_APP_VERSION`: 应用版本号（默认: `-0.0.0`）

### 环境变量文件

1. **开发环境**: `.env.development`
2. **生产环境**: `.env.production`
3. **示例文件**: `.env.example`（可作为模板）

### 使用方法

1. 复制 `.env.example` 为 `.env.development` 或 `.env.production`
2. 根据需要修改环境变量值
3. 重启开发服务器使配置生效

```bash
# 开发环境
cp .env.example .env.development

# 生产环境
cp .env.example .env.production
```

## 在代码中使用配置

### 导入配置

```javascript
// 导入整个配置对象
import config from '@/config'

// 或导入特定配置
import { apiConfig, colleges, campus } from '@/config'
```

### 使用示例

```javascript
// 使用 API 配置
const apiUrl = config.api.baseURL

// 使用学院列表
const collegeList = config.colleges

// 使用图片字典
const imgDict = config.getImageDict()
```

### 在 Vue 组件中使用

配置已自动注入到 Vue 全局属性中，可以通过 `this.$apiUrl` 等方式访问：

```javascript
// Options API
export default {
  mounted() {
  }
}

// Composition API
import { getCurrentInstance } from 'vue'

export default {
  setup() {
    const { proxy } = getCurrentInstance()
  }
}
```

## 配置优先级

1. **环境变量** (最高优先级)
2. **配置文件默认值** (如果环境变量未设置)

## 注意事项

1. 环境变量必须以 `VUE_APP_` 开头才能在客户端代码中访问
2. 修改环境变量后需要重启开发服务器
3. 生产环境构建时，环境变量会被编译到代码中
4. 不要在代码中硬编码配置值，始终使用配置文件

## 迁移说明

所有硬编码的配置已从以下文件迁移到配置文件：

- ✅ `src/main.js` - 所有全局配置
- ✅ `src/axios/axios.js` - API baseURL

其他文件通过 `globalProperties.$apiUrl` 等方式访问配置，无需修改。

