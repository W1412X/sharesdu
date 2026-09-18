/**
 * 构建详情页「更多操作」的统一选项列表
 * PC 端下拉菜单（MoreOptionsMenu）与移动端底部抽屉（BottomActionMenu）共用，
 * 保证两端操作项一致。
 */
import { getCookie } from '@/utils/cookie';

/**
 * @param {String} type - 内容类型：post/article/course/section
 * @param {Object} data - 详情数据（需包含 authorId、id；article 需 content，可选 editorType）
 * @param {Object} [context]
 * @param {Boolean} [context.ifMd=false] - 文章是否为 Markdown 编辑器类型
 * @returns {Array<{icon: String, text: String, type: String, danger?: Boolean}>}
 */
export function buildMoreOptions(type, data, { ifMd = false } = {}) {
    const ifMaster = getCookie("ifMaster");
    const ifAuthor = getCookie("userId") == data?.authorId;
    const options = [];
    switch (type) {
        case 'course':
            if (!ifAuthor) {
                options.push({ icon: 'mdi-alert', text: '举报课程', type: 'course-alert', danger: true });
            }
            options.push({
                icon: 'mdi-pencil',
                text: '提交修改',
                type: 'course-edit',
            });
            options.push({
                icon: 'mdi-link-variant',
                text: '复制课程链接',
                type: 'course-share',
            });
            if (ifMaster) {
                options.push({
                    icon: 'mdi-shield-edit-outline',
                    text: '管理课程',
                    type: 'course-manage',
                });
            }
            break;
        case 'article':
            if (!ifAuthor) {
                options.push({ icon: 'mdi-alert', text: '举报文章', type: 'article-alert', danger: true });
            }
            options.push({
                icon: 'mdi-link-variant',
                text: '复制文章链接',
                type: 'article-share',
            });
            if ((ifMd || data?.editorType === 'md') && data?.content) {
                options.push({
                    icon: 'mdi-content-copy',
                    text: '复制 Markdown',
                    type: 'article-copy-md',
                });
                options.push({
                    icon: 'mdi-download',
                    text: '下载 Markdown',
                    type: 'article-download-md',
                });
            }
            if (ifMaster) {
                options.push({
                    icon: 'mdi-shield-edit-outline',
                    text: '管理文章',
                    type: 'article-manage',
                });
            }
            if (ifAuthor) {
                options.push({
                    icon: 'mdi-pencil',
                    text: '编辑文章',
                    type: 'article-edit',
                });
                options.push({ icon: 'mdi-delete', text: '删除文章', type: 'article-delete', danger: true });
            }
            break;
        case 'post':
            if (!ifAuthor) {
                options.push({ icon: 'mdi-alert', text: '举报帖子', type: 'post-alert', danger: true });
            }
            options.push({
                icon: 'mdi-link-variant',
                text: '复制帖子链接',
                type: 'post-share',
            });
            if (ifAuthor) {
                options.push({ icon: 'mdi-delete', text: '删除帖子', type: 'post-delete', danger: true });
            }
            break;
        case 'section':
            if (!ifAuthor) {
                options.push({ icon: 'mdi-alert', text: '举报板块', type: 'section-alert', danger: true });
            }
            options.push({
                icon: 'mdi-link-variant',
                text: '复制板块链接',
                type: 'section-share',
            });
            if (ifAuthor) {
                options.push({
                    icon: 'mdi-pencil',
                    text: '编辑板块',
                    type: 'section-edit',
                });
                options.push({ icon: 'mdi-delete', text: '删除板块', type: 'section-delete', danger: true });
            }
            break;
    }
    return options;
}

export default buildMoreOptions;
