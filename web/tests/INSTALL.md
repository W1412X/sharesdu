# 测试环境安装指南

## 快速开始

### 1. 安装依赖

```bash
npm install --save-dev @vue/test-utils @vue/vue3-jest babel-jest jest jest-environment-jsdom cypress
```

或者使用 yarn：

```bash
yarn add -D @vue/test-utils @vue/vue3-jest babel-jest jest jest-environment-jsdom cypress
```

### 2. 验证安装

```bash
# 检查 Jest 版本
npx jest --version

# 检查 Cypress 版本
npx cypress --version
```

### 3. 运行测试

```bash
# 运行单元测试
npm run test:unit

# 运行 E2E 测试（需要先启动开发服务器）
npm run serve &
npm run test:e2e
```

## 常见问题

### Jest 配置问题

如果遇到模块解析错误，检查：
1. `jest.config.js` 中的 `moduleNameMapper` 配置
2. `babel.config.js` 是否正确配置
3. 路径别名 `@/` 是否正确映射

### Cypress 问题

如果 Cypress 无法启动：
1. 确保开发服务器正在运行（`npm run serve`）
2. 检查 `cypress.config.js` 中的 `baseUrl` 配置
3. 确保端口 8080 未被占用

### Vue Test Utils 问题

如果组件测试失败：
1. 检查 Vuetify 组件是否正确 mock
2. 确保全局属性正确设置（`tests/setup.js`）
3. 检查组件依赖是否正确 mock

## 下一步

1. 查看 `tests/README.md` 了解测试编写指南
2. 运行示例测试验证配置
3. 开始为关键业务逻辑添加测试

