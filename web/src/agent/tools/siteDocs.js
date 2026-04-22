/**
 * 本站文档工具：从 public/doc 读取 Markdown，供 SiteDocsAgent 回答与本站设计/政策/开发相关的问题。
 * 文档通过 fetch(/doc/...) 获取（与 DocumentPage、useDeveloperActions 一致）。
 */

const DOC_BASE = '/doc';
const SITE_HASH_BASE = '#';

const GENERAL_DOC_ROUTE_KEYS = new Map([
  ['intro', 'intro'],
  ['to_know', 'to_know'],
  ['privacy', 'privacy'],
  ['about_us', 'about_us'],
]);

const DEVELOPER_DOC_ROUTE_KEYS = new Map([
  ['developer/introduction', 'introduction'],
  ['developer/platform/introduction', 'platform_introduction'],
  ['developer/platform/maintenance', 'platform_maintenance'],
  ['developer/platform/adaptation', 'platform_adaptation'],
  ['developer/platform/security', 'platform_security'],
  ['developer/platform/other', 'platform_other'],
  ['developer/microservice/introduction', 'microservice_introduction'],
  ['developer/microservice/authentication', 'microservice_authentication'],
  ['developer/microservice/data_sharing', 'microservice_data_sharing'],
  ['developer/microservice/forms', 'microservice_forms'],
  ['developer/agent/introduction', 'agent_introduction'],
  ['developer/agent/development', 'agent_development'],
  ['developer/agent/guidelines', 'agent_guidelines'],
  ['developer/other', 'other'],
]);

const DOC_TITLES = new Map([
  ['intro', '项目介绍'],
  ['to_know', '入站须知'],
  ['privacy', '隐私政策'],
  ['about_us', '关于我们'],
  ['developer/introduction', '开发者文档总览'],
  ['developer/platform/introduction', '平台开发介绍'],
  ['developer/platform/maintenance', '参与维护'],
  ['developer/platform/adaptation', '平台适配'],
  ['developer/platform/security', '数据安全'],
  ['developer/platform/other', '其他工作'],
  ['developer/microservice/introduction', '微服务开发介绍'],
  ['developer/microservice/authentication', '身份认证'],
  ['developer/microservice/data_sharing', '数据共享'],
  ['developer/microservice/forms', '开发形式'],
  ['developer/agent/introduction', '自动化脚本开发介绍'],
  ['developer/agent/development', '开发指南'],
  ['developer/agent/guidelines', '开发规范'],
  ['developer/other', '其他'],
]);

const docKeyToPath = (docKey) => {
  const key = String(docKey || '').trim();
  if (!key) return null;
  const normalized = key.replace(/^\/+|\/+$/g, '').replace(/\.md$/i, '');
  if (!normalized) return null;
  return `${DOC_BASE}/${normalized}.md`;
};

const docKeyToSiteUrl = (docKey) => {
  const key = String(docKey || '').trim().replace(/^\/+|\/+$/g, '').replace(/\.md$/i, '');
  if (!key) return null;
  if (GENERAL_DOC_ROUTE_KEYS.has(key)) {
    return `${SITE_HASH_BASE}/document/${GENERAL_DOC_ROUTE_KEYS.get(key)}`;
  }
  if (DEVELOPER_DOC_ROUTE_KEYS.has(key)) {
    return `${SITE_HASH_BASE}/developer?doc=${encodeURIComponent(DEVELOPER_DOC_ROUTE_KEYS.get(key))}`;
  }
  return null;
};

const resolveDocMeta = (docKey) => {
  const key = String(docKey || '').trim().replace(/^\/+|\/+$/g, '').replace(/\.md$/i, '');
  if (!key) return null;
  return {
    doc_key: key,
    raw_url: docKeyToPath(key),
    site_url: docKeyToSiteUrl(key),
    title: DOC_TITLES.get(key) || key,
  };
};

export const SITE_DOCS_TOOLSET = {
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_site_doc',
        description: `获取本站说明文档内容，用于回答与本站设计、政策、开发相关的问题。
可选 doc_key（任选其一）：
- intro: 项目介绍、功能、目标受众、特点、开发者生态、反馈与联系
- to_know: 入站须知、本站功能、版权与转载、禁止行为、隐私与安全
- privacy: 隐私政策（收集/使用/共享/保护/用户权利/存储/未成年人）
- about_us: 关于我们、开发者、开源仓库、加入方式
- developer/introduction: 开发者文档总览
- developer/platform/introduction: 平台开发介绍
- developer/platform/maintenance: 参与维护
- developer/platform/adaptation: 平台适配
- developer/platform/security: 数据安全
- developer/platform/other: 其他工作
- developer/microservice/introduction: 微服务开发介绍
- developer/microservice/authentication: 身份认证
- developer/microservice/data_sharing: 数据共享
- developer/microservice/forms: 开发形式
- developer/agent/introduction: 自动化脚本开发介绍
- developer/agent/development: 开发指南
- developer/agent/guidelines: 开发规范
- developer/other: 其他`,
        parameters: {
          type: 'object',
          properties: {
            doc_key: {
              type: 'string',
              description: '文档标识，如 intro, to_know, privacy, about_us, developer/introduction 等',
            },
          },
          required: ['doc_key'],
        },
      },
    },
  ],
  handlers: {
    get_site_doc: async ({ doc_key }) => {
      try {
        const meta = resolveDocMeta(doc_key);
        if (!meta?.raw_url) {
          return { ok: false, error: 'invalid_doc_key', data: { doc_key } };
        }
        const response = await fetch(meta.raw_url);
        if (!response.ok) {
          return {
            ok: false,
            error: 'fetch_failed',
            data: { ...meta, status: response.status },
          };
        }
        const content = await response.text();
        return {
          ok: true,
          data: { ...meta, content },
        };
      } catch (e) {
        return {
          ok: false,
          error: e?.message || 'unknown_error',
          data: { doc_key },
        };
      }
    },
    get_site_doc_link: async ({ doc_key }) => {
      try {
        const meta = resolveDocMeta(doc_key);
        if (!meta?.site_url) {
          return { ok: false, error: 'invalid_doc_key', data: { doc_key } };
        }
        return {
          ok: true,
          data: meta,
        };
      } catch (e) {
        return {
          ok: false,
          error: e?.message || 'unknown_error',
          data: { doc_key },
        };
      }
    },
  },
};
