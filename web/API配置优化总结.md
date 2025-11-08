# API baseURL 配置优化总结

## 概述

将 API baseURL 从硬编码改为从配置文件读取，支持环境变量覆盖，提高配置的灵活性和可维护性。

## 主要变更

### 1. `src/api/request.js` (原 `src/axios/axios.js`)

**变更前：**
```javascript
import { apiConfig } from '@/config';

class AxiosWithCache {
    constructor() {
        this.axiosInstance=axios.create({
            baseURL: apiConfig.baseURL,
            // ...
        });
    }
}
```

**变更后：**
```javascript
import config from '@/config';

class AxiosWithCache {
    constructor() {
        this.axiosInstance=axios.create({
            baseURL: config.api.baseURL,  // 从统一配置对象读取
            // ...
        });
    }
}

export const axiosInstanceNoHeader=axios.create({
    baseURL: config.api.baseURL,  // 统一使用配置
});
```

### 2. `src/utils/imageUtils.js`

**变更前：**
```javascript
export function extractImageLinks(inputString) {
    const regex = /https:\/\/api\.sharesdu\.com\/index\/api\/image\/get[^\s")]+/g;
    const matches = inputString.match(regex);
    return matches || [];
}
```

**变更后：**
```javascript
import config from '@/config';

export function extractImageLinks(inputString) {
    // 从配置中读取 baseURL，支持不同环境
    const apiBaseUrl = config.api.baseURL;
    // 转义特殊字符用于正则表达式
    const escapedBaseUrl = apiBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedBaseUrl}/image/get[^\\s")]+`, 'g');
    const matches = inputString.match(regex);
    return matches || [];
}
```

## 配置结构

### `src/config/index.js`

```javascript
// API 配置
export const apiConfig = {
  baseURL: getEnvVar('VUE_APP_API_BASE_URL', 'https://api.sharesdu.com/index/api'),
};

// 导出统一配置对象
export default {
  api: apiConfig,
  // ... 其他配置
};
```

## 环境变量支持

### 支持的环境变量

- `VUE_APP_API_BASE_URL`: API 基础 URL
  - 默认值: `https://api.sharesdu.com/index/api`
  - 可在 `.env.development` 或 `.env.production` 中设置

### 使用示例

**`.env.development`**
```env
VUE_APP_API_BASE_URL=http://localhost:8080/api
```

**`.env.production`**
```env
VUE_APP_API_BASE_URL=https://api.sharesdu.com/index/api
```

## 配置优先级

1. **环境变量** (最高优先级)
   - 如果设置了 `VUE_APP_API_BASE_URL`，使用环境变量的值
2. **配置文件默认值** (如果环境变量未设置)
   - 使用 `config/index.js` 中定义的默认值

## 优势

1. **集中管理**：所有 API 配置集中在 `config/index.js`
2. **环境适配**：通过环境变量轻松切换不同环境的 API 地址
3. **易于维护**：修改 API 地址只需修改配置文件或环境变量
4. **类型安全**：统一的配置对象便于未来添加 TypeScript 支持
5. **动态支持**：`extractImageLinks` 函数现在支持动态 baseURL

## 修改的文件

1. ✅ `src/api/request.js` - 使用 `config.api.baseURL`
2. ✅ `src/utils/imageUtils.js` - `extractImageLinks` 函数使用动态配置

## 验证

- ✅ 所有 baseURL 都从配置读取
- ✅ 支持环境变量覆盖
- ✅ 构建测试通过
- ✅ 无 linter 错误

## 注意事项

1. **环境变量命名**：必须以 `VUE_APP_` 开头才能在客户端代码中访问
2. **重启服务**：修改环境变量后需要重启开发服务器
3. **生产构建**：生产环境构建时，环境变量会被编译到代码中
4. **配置一致性**：确保所有使用 baseURL 的地方都从配置读取

## 后续建议

1. **TypeScript 支持**：为配置添加类型定义
2. **配置验证**：添加配置验证逻辑，确保 baseURL 格式正确
3. **文档完善**：在项目文档中说明如何配置不同环境的 API 地址

