---
name: publish-to-sharesdu
description: >-
  Publishes articles to ShareSDU via HTTP API with mandatory user preview and desensitization.
  Use when the user asks to post to ShareSDU, or after completing SDU-related study, coursework,
  labs, learning materials, project retrospectives, or campus learning experience—proactively
  offer a sanitized draft preview and publish only after explicit user consent.
disable-model-invocation: false
---

# 向 ShareSDU 发布文章

## 何时启用

**用户明确要求发布**，或代其发帖时：严格按本文执行。

**任务完成后主动建议（须先预览、须用户同意）**  
当本轮对话主要在处理与 **山东大学（山大 / SDU）**、**课程学习**、**学习资料**、**实验 / 上机 / 课程设计**、**项目 / 竞赛复盘**、**选课 / 给分 / 学习方法**、**校园学习经验** 相关的工作，且该工作已告一段落（如实验做完、报告写好、问题已解决、总结已生成）时：

1. **不要立刻调用接口发帖**。  
2. 先根据本次成果整理一份 **预计发布稿**（标题、摘要、正文要点、拟用标签、是否含图/附件）。  
3. 向用户说明可以整理成文发到 ShareSDU，并 **展示预览 + 询问是否发布**（可问是否要再删哪些信息）。  
4. 仅在用户 **明确同意**（如「发」「可以发布」「上传到 ShareSDU」）后，再按下文登录与发布。  
5. 用户拒绝或暂不确定 → **不发布**。

以下情况 **不要** 主动提议发布：纯闲聊、与学业无关、用户明确说不要公开、内容明显涉密或仍含大量未去敏隐私。

## 隐私与去敏（发布前必做）

发布到公开站点前，正文、摘要、标签、图片、附件中 **不得泄漏个人或他人隐私**。发布前对稿件去敏；用户坚持保留的除外。

| 类型 | 处理 |
|------|------|
| 学号、工号、考生号、身份证号 | 删除 |
| 手机号、邮箱、QQ/微信、住址、宿舍门牌 | 删除 |
| 他人真实姓名 | 改为「某同学」「任课老师」或用户指定化名 |
| 密码、Token、API Key、内网账号 | 不得出现 |
| 可识别个人的聊天/成绩单截图 | 不上传原图；改写为去敏文字 |
| 能精确定位的信息组合 | 拆开并弱化（如学院+真名+电话） |

**通常可保留：** 课程名、公开教材、实验原理、通用参数、公开官网链接、个人总结的方法与踩坑（不涉及具体他人）。

去敏稿须让用户 **过目**；用户指出仍敏感处应修改后再问是否发布。

## 发布前预览（调用接口之前）

向用户展示：

- **标题**、**摘要**、**正文**（去敏后）、**标签**、**拟上传的图/附件**  
- **去敏说明**（已去掉哪类信息，一句话即可）

并明确提问：**「是否按以上内容发布到 ShareSDU？」**  
未获肯定答复前：**禁止** 调用登录与发帖接口。

## 文首声明（按本 Skill 发布时必填）

凡通过本 Skill 调用接口发布的文章，正文 **最开头**（`md` / `html` 类型前缀之后、标题与正文之前）必须加入以下 **引用块**，预览稿中也要包含，让用户看见：

```markdown
> 本文章由 AI 助手根据用户工作总结自动整理并发布。
```

- 若可识别当前运行环境，可将「AI 助手」换成具体名称（如 Cursor、Claude Code、Codex），无法确定时保留「AI 助手」。  
- 声明后空一行，再写标题与正文。  
- **不要** 删掉或改写含义；用户可在预览阶段要求调整表述，但发布版本须保留「自动整理发布」的说明。

组装示例（Markdown）：

```text
content = "md" + "> 本文章由 AI 助手根据用户工作总结自动整理并发布。\n\n" + 正文
```

## 账号

发布前若没有用户名和密码，直接问用户：

- ShareSDU **用户名**
- ShareSDU **密码**

用用户当轮提供的账号登录；已提供过则不必重复问。不要要求用户配置环境变量。

密码与 Token 仅用于本次请求，不要在回复中复述密码，不要写入任何文件。

---

## 接口基础

- **Base URL**：`https://api.sharesdu.com/index/api`（记为 `{BASE}`）
- URL **末尾不要** `/`
- JSON 请求：`Content-Type: application/json`
- 需登录的请求：`Authorization: Bearer <access_token>`
- 以响应 JSON 里的 **`status`** 判断成败（HTTP 200 也可能失败）

---

## 发布顺序（必须遵守）

```text
登录 → 上传图片拿 URL → 写入正文/封面 → 创建文章 →（可选）上传本地资源文件 →（可选）编辑文章
```

1. **图片（含封面）**：必须先 `POST /image/article`，把返回 URL 写进 Markdown 或 `cover_link`，再创建文章。  
2. **外链资源**：若有现成下载地址，在创建文章时填入 `resource_link` 或写在正文里。  
3. **本地附件**（pdf/zip 等）：`POST /resource/upload` 需要 **`article_id`**，只能在 **创建文章之后** 上传。正文若要写下载说明，再 `POST /article/edit` 补充。

禁止在 `content`、`cover_link` 里提交未上传的本地路径（`file://`、`/Users/...`、相对路径）。

---

## 1. 登录

### 1.1 密码登录

```http
POST {BASE}/login_passwd
Content-Type: application/json

{ "user_name": "<用户名>", "pass_word": "<密码>" }
```

成功：`status === 200`，保存 `refresh`。失败：把 `status`、`message` 告诉用户。

### 1.2 获取 Access Token

```http
POST {BASE}/token/refresh
Content-Type: application/json

{ "refresh": "<refresh>" }
```

| status | 处理 |
|--------|------|
| 999 | 使用返回的 `access` |
| 1001 | refresh 后**重试原请求一次** |
| 1000 / 1003 / 1006 | 重新向用户要账号并登录 |
| 1002 | 账号封禁，停止发布 |
| 1004 | 检查 `Authorization: Bearer ` 格式 |

---

## 2. 上传图片

```http
POST {BASE}/image/article
Authorization: Bearer <access>
Content-Type: multipart/form-data

image: <文件>
```

成功：`status` 为 `200` 或 `201`。

取图片地址（两种响应结构二选一）：

```text
path = body.data.image_url 或 body.image_url
完整 URL = path 已以 http 开头 ? path : {BASE} + path
```

将正文中的本地图片引用替换为完整 URL，例如 `![](完整URL)`。  
封面图同样先上传，结果填入 **`cover_link`**。

任一张图片失败则停止，不要创建文章。

---

## 3. 创建文章

图片 URL 已全部写入正文且封面已处理后再调用：

```http
POST {BASE}/article/create
Authorization: Bearer <access>
Content-Type: application/json
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `article_title` | 是 | 标题 |
| `content` | 是 | 正文；**最前面加类型前缀**（见下表） |
| `tags` | 否 | 逗号分隔 |
| `article_type` | 否 | `original` 或 `repost` |
| `origin_link` | 否 | 转载原文 URL |
| `article_summary` | 否 | 摘要 |
| `cover_link` | 否 | 封面完整 URL |
| `resource_link` | 否 | 已有外链时填写 |

| 正文类型 | `content` 格式 |
|----------|----------------|
| Markdown | `"md" + 文首声明块 + "\n\n" + 正文`（声明块见上文） |
| HTML | `"html" + 文首声明块 + 正文`（HTML 可用 `<blockquote>` 表达同义声明） |

文首声明块为必填，不可省略。

成功：`status === 200`，记下 **`article_id`**。  
告知用户文章地址：`https://www.sharesdu.com/#/article/{article_id}`

---

## 4. 上传资源文件（本地附件）

```http
POST {BASE}/resource/upload
Authorization: Bearer <access>
Content-Type: multipart/form-data

file: <文件>
article_id: <article_id>
```

成功：`status` 为 `200` 或 `201`。  
失败常见：`404` 文章不存在；`400` 类型或大小不符（一般为压缩包、PDF、Word、PPT，单文件约 80MB 上限）。

---

## 5. 编辑文章（可选）

```http
POST {BASE}/article/edit
Authorization: Bearer <access>
Content-Type: application/json

{
  "article_id": <id>,
  "article_title": "...",
  "content": "md..."
}
```

用于：附件上传后在正文末尾加下载说明，或修改标题/正文。

---

## 6. 失败与报错怎么读

1. **网络错误**：无响应、超时 → 说明可能网络问题，可重试。  
2. **HTTP 状态码**：同时尽量解析 body 里的 `status`、`message`。  
3. **业务失败**：HTTP 200 但 `status` 不是 200（登录刷新用 999/100x）→ 以 body 为准。

| 情况 | 处理 |
|------|------|
| 图片上传失败 | 不创建文章 |
| 文章成功、附件失败 | 给出 `article_id` 和附件失败原因，可只重试上传或编辑 |
| 登录失败 | 向用户展示 `message`，核对用户名密码 |
| 内容审核/违规 | 展示 `message`，不要原样重复提交 |

完成后向用户说明：成功或失败、文章链接（若有）、图片/附件处理结果；失败时附上 `status` 与 `message`。

---

## 7. 执行要点（检查清单）

- [ ] 若为主动建议场景：已展示预览且用户 **明确同意** 发布  
- [ ] 正文最前已加 **文首声明**（`> 本文章由…自动…整理发布`），预览中已展示  
- [ ] 正文、图、附件已 **去敏**，预览中已向用户说明  
- [ ] 已向用户确认标题与正文（用户提供或代写）  
- [ ] 已登录并取得 `access`  
- [ ] 所有正文图、封面已上传并替换为线上 URL  
- [ ] `content` 已加 `md` 或 `html` 前缀  
- [ ] 已 `article/create` 并拿到 `article_id`  
- [ ] 若有本地附件，已 `resource/upload`；必要时已 `article/edit`  
- [ ] 回复中不含密码、Token、学号、电话等隐私
