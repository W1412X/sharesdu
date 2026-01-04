# 用户身份标识系统使用说明

## 概述

用户身份标识系统用于在用户头像上显示身份徽章，类似于社交媒体的认证标识（如蓝V认证）。

## 配置方式

### 1. 在 `config/index.js` 中配置用户身份

在 `userRoles` 对象中添加用户ID和对应的身份类型：

```javascript
export const userRoles = {
  'user_id_1': 'admin',        // 管理员
  'user_id_2': 'verified',      // 认证的官方号
  'user_id_3': 'developer',    // 开发者
  'user_id_4': 'moderator',    // 版主
  'user_id_5': 'contributor',  // 贡献者
};
```

### 2. 身份类型说明

系统支持以下身份类型（按优先级从高到低）：

- **admin** (优先级 100) - 管理员
  - 图标：`mdi-shield-check`
  - 颜色：红色 (#FF5722)
  
- **verified** (优先级 80) - 认证的官方号
  - 图标：`mdi-check-circle`
  - 颜色：蓝色 (#2196F3)
  
- **developer** (优先级 60) - 开发者
  - 图标：`mdi-code-tags`
  - 颜色：绿色 (#4CAF50)
  
- **moderator** (优先级 40) - 版主
  - 图标：`mdi-account-star`
  - 颜色：紫色 (#9C27B0)
  
- **contributor** (优先级 20) - 贡献者
  - 图标：`mdi-star-circle`
  - 颜色：橙色 (#FF9800)

### 3. 优先级机制

- 如果用户有多个身份，系统会自动显示优先级最高的身份标识
- 优先级数值越大，优先级越高

## 使用方法

### 在组件中使用工具函数

```javascript
import { getUserRole, isAdmin, isVerified, getHighestPriorityRole } from '@/utils/userBadge';

// 获取用户身份
const role = getUserRole(userId);

// 检查是否是管理员
if (isAdmin(userId)) {
  // ...
}

// 检查是否是认证用户
if (isVerified(userId)) {
  // ...
}

// 获取最高优先级的身份配置
const roleConfig = getHighestPriorityRole(userId);
if (roleConfig) {
  console.log(roleConfig.label); // 身份标签
  console.log(roleConfig.icon);  // 图标名称
  console.log(roleConfig.color); // 颜色
}
```

### AvatarName 组件自动显示

`AvatarName` 组件会自动检测用户身份并显示徽章，无需额外配置：

```vue
<avatar-name :init-data="{ id: userId, name: userName }" />
```

## 自定义身份类型

如需添加新的身份类型，在 `config/index.js` 的 `roleConfig` 中添加：

```javascript
export const roleConfig = {
  // ... 现有配置
  customRole: {
    priority: 30,
    label: '自定义身份',
    icon: 'mdi-custom-icon',
    color: '#自定义颜色',
    bgColor: 'rgba(自定义颜色, 0.1)',
  },
};
```

## 注意事项

1. 用户ID需要转换为字符串进行匹配
2. 徽章大小会根据头像大小自动调整
3. 移动端和PC端都有适配
4. 徽章显示在头像右下角，带有白色边框和阴影效果

