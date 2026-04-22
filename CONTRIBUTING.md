# 贡献指南

感谢你对 ShareSDU 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复或新功能
- 🎨 优化 UI/UX

## 📋 目录

- [开始之前](#开始之前)
- [自动部署与上线](#自动部署与上线)
- [提交签名要求](#提交签名要求)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)

## 开始之前

### 1. Fork 项目

点击项目页面右上角的 "Fork" 按钮，将项目 fork 到你的 GitHub 账户。

### 2. Clone 到本地

```bash
git clone https://github.com/YOUR_USERNAME/sharesdu.git
cd sharesdu
```

### 3. 添加上游仓库

```bash
git remote add upstream https://github.com/W1412X/sharesdu.git
```

### 4. 保持同步

在开始工作前，确保你的 fork 是最新的：

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## 自动部署与上线

仓库**已配置自动部署流水线**：**合并或推送到 `main` 分支的改动会触发自动构建与发布**，生产环境在流水线完成后即可看到更新。从推送到**大致可用**通常约 **10 分钟**（视 CI 队列、构建缓存与发布步骤而略有波动）。合并前仍建议在本地或 Pull Request 中通过检查与必要测试，避免有问题的代码直接进入主线。

## ⚠️ 提交签名要求

**重要：本项目要求所有提交必须有验证签名才能合并。**

### 为什么需要签名？

提交签名可以验证提交确实来自你，防止他人冒充你的身份提交代码，提高项目安全性。

### 配置签名（二选一）

#### 方式一：SSH 签名（推荐，更简单）

如果你已经有 SSH 密钥用于 git push，配置非常简单：

```bash
# 1. 配置 Git 使用 SSH 签名
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true

# 2. 添加 SSH 公钥到 GitHub（作为签名密钥）
# 访问 https://github.com/settings/keys
# 点击 "New SSH key"，Key type 选择 "Signing Key"
# 粘贴你的公钥内容（cat ~/.ssh/id_ed25519.pub）
```

如果你还没有 SSH 密钥：

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 然后按照上面的步骤配置
```

#### 方式二：GPG 签名（传统方式）

```bash
# 1. 安装 GPG
# Windows: 下载 https://www.gpg4win.org/download.html
# macOS: brew install gnupg
# Linux: sudo apt-get install gnupg

# 2. 生成 GPG 密钥
gpg --full-generate-key
# 选择 RSA and RSA，密钥长度 4096

# 3. 获取密钥 ID
gpg --list-secret-keys --keyid-format=long
# 记下 rsa4096/ 后面的 ID

# 4. 导出公钥
gpg --armor --export YOUR_KEY_ID
# 复制输出的公钥

# 5. 添加到 GitHub
# 访问 https://github.com/settings/keys
# 点击 "New GPG key"，粘贴公钥

# 6. 配置 Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

### 验证签名配置

```bash
# 创建测试提交
echo "test" > test.txt
git add test.txt
git commit -m "test: verify signing"

# 查看签名
git log --show-signature -1

# 应该看到 "Good signature" 或签名信息
# 删除测试文件
git reset --hard HEAD~1
rm test.txt
```

### 重新签名已有提交

如果你已经有未签名的提交：

```bash
# 重新签名最近的 N 个提交（替换 N 为实际数量）
git rebase --exec 'git commit --amend --no-edit -n -S' -i HEAD~N

# 强制推送
git push origin main --force-with-lease
```

## 🔄 开发流程

### 1. 创建分支

```bash
# 从最新的 main 分支创建功能分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 2. 进行开发

根据你要贡献的内容进行开发：

**Web 前端开发：**
```bash
cd web
npm install
npm run serve
```

**Android 开发：**
```bash
cd android
# 使用 Android Studio 打开项目
```

**HarmonyOS 开发：**
```bash
cd harmony
# 使用 DevEco Studio 打开项目
```

### 3. 测试你的更改

- 确保代码能够正常运行
- 如果是 bug 修复，验证 bug 已被修复
- 如果是新功能，测试功能是否正常工作
- 运行现有测试（如果有）

**Web 前端测试：**
```bash
cd web
npm run test:unit        # 单元测试
npm run test:e2e         # E2E 测试
npm run lint             # 代码检查
```

### 4. 提交更改

```bash
git add .
git commit -m "feat: 添加新功能"
# 提交会自动签名（如果已配置）
```

## 📝 代码规范

### Web 前端

- 遵循 ESLint 配置
- 使用 Vue 3 Composition API
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### 通用规范

- 代码注释使用中文
- 保持代码简洁易读
- 避免过度优化
- 遵循现有代码风格

## 💬 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构（既不是新功能也不是 bug 修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例：**

```bash
feat(article): 添加文章搜索功能

- 实现关键词搜索
- 支持标签筛选
- 添加搜索结果分页

Closes #123
```

```bash
fix(auth): 修复登录状态丢失问题

修复了用户刷新页面后登录状态丢失的问题。
现在使用 localStorage 持久化存储 token。

Fixes #456
```

```bash
docs: 重构项目文档结构

- 创建 web/docs 目录分类整理文档
- 添加 CHANGELOG.md 和 TODO.md
- 优化 API 文档结构
```

## 🔀 Pull Request 流程

### 1. 推送到你的 Fork

```bash
git push origin feature/your-feature-name
```

### 2. 创建 Pull Request

1. 访问你的 fork 页面
2. 点击 "Contribute" → "Open pull request"
3. 填写 PR 标题和描述

### 3. PR 标题格式

```
<type>: <简短描述>
```

例如：
- `feat: 添加文章搜索功能`
- `fix: 修复登录状态丢失问题`
- `docs: 更新 API 文档`

### 4. PR 描述模板

```markdown
## 概述
简要描述这个 PR 的目的和内容。

## 改动内容
- 改动点 1
- 改动点 2
- 改动点 3

## 测试
说明如何测试这些改动。

## 截图（如果适用）
添加相关截图。

## 相关 Issue
Closes #issue_number
```

### 5. 等待审查

- 维护者会审查你的 PR
- 根据反馈进行修改
- 保持耐心和友好的沟通

### 6. 合并后

```bash
# 删除本地分支
git branch -d feature/your-feature-name

# 删除远程分支
git push origin --delete feature/your-feature-name

# 更新本地 main 分支
git checkout main
git pull upstream main
```

## 📚 相关文档

- [API 文档](./api.md) - 后端 API 接口文档
- [更新日志](./CHANGELOG.md) - 版本更新历史
- [待办事项](./TODO.md) - 未来计划和待开发功能
- [Web 前端文档](./web/docs/README.md) - 前端技术文档

## 🐛 报告 Bug

如果你发现了 bug，请创建 Issue 并包含以下信息：

- Bug 描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息（浏览器、操作系统等）
- 截图或错误日志（如果有）

## 💡 功能建议

如果你有新功能建议，请创建 Issue 并说明：

- 功能描述
- 使用场景
- 预期效果
- 可能的实现方案（可选）

## ❓ 获取帮助

如果你在贡献过程中遇到问题：

1. 查看项目文档
2. 搜索已有的 Issues
3. 创建新的 Issue 提问
4. 在 PR 中 @维护者

## 📜 行为准则

- 尊重所有贡献者
- 保持友好和专业的沟通
- 接受建设性的批评
- 关注项目的最佳利益

## 🙏 致谢

感谢所有为 ShareSDU 项目做出贡献的开发者！

你的每一个贡献，无论大小，都让这个项目变得更好。❤️
