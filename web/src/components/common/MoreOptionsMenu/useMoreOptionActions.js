/**
 * 「更多操作」选项点击处理的统一 composable。
 * PC 端下拉菜单（MoreOptionsMenu）与移动端底部抽屉（BottomActionMenu）共用，
 * 持有举报/删除确认/课程编辑对话框与移动端下载确认弹窗的状态。
 */
import { computed, ref } from 'vue';
import { openPage, getNormalSuccessAlert } from '@/utils/other';
import { copyMarkdownContent, downloadMarkdownContent } from '@/utils/markdownExport';
import { useDevice } from '@/app/composables/useDevice';

export function useMoreOptionActions() {
    const ifShowReportCard = ref(false);
    const ifShowDeleteConfirmCard = ref(false);
    const ifShowCourseEditor = ref(false);
    const ifShowMobileDownloadDialog = ref(false);
    const { ifMobile } = useDevice();

    // 待确认下载的上下文（移动端下载确认弹窗使用）
    let pendingDownload = null;

    const ifShowDialog = computed(() => {
        return ifShowReportCard.value || ifShowDeleteConfirmCard.value || ifShowCourseEditor.value;
    });

    const closeReportCard = () => {
        ifShowReportCard.value = false;
    };
    const closeDeleteConfirmCard = () => {
        ifShowDeleteConfirmCard.value = false;
    };
    const closeCourseEditor = () => {
        ifShowCourseEditor.value = false;
    };

    /**
     * 处理选项点击
     * @param {Object} option - buildMoreOptions 返回的选项
     * @param {Object} ctx - { itemType, data, emit, close }
     */
    const handleOption = (option, ctx) => {
        const { data, emit, close } = ctx || {};
        switch (option?.type) {
            case 'post-alert':
            case 'article-alert':
            case 'course-alert':
                ifShowReportCard.value = true;
                break;
            case 'course-edit':
                ifShowCourseEditor.value = true;
                break;
            case 'section-edit':
                openPage('router', {
                    name: 'SectionEditorPage',
                    params: {
                        id: data?.id,
                    },
                });
                break;
            case 'article-edit':
                openPage('router', {
                    name: 'EditorPage',
                    params: {
                        id: data?.id,
                    },
                });
                break;
            case 'section-share':
            case 'article-share':
            case 'course-share':
            case 'post-share':
                navigator.clipboard.writeText(window.location.href);
                emit?.('alert', getNormalSuccessAlert('复制成功'));
                break;
            case 'post-delete':
            case 'article-delete':
            case 'section-delete':
                ifShowDeleteConfirmCard.value = true;
                break;
            case 'course-manage':
            case 'article-manage': {
                const initType = option.type === 'course-manage' ? 'course' : 'article';
                openPage('router', {
                    name: 'ManagePage',
                    query: {
                        init_type: initType,
                        init_id: data?.id,
                    },
                });
                break;
            }
            case 'article-copy-md':
                copyMarkdownContent(data?.content, (msg) => emit?.('alert', msg));
                break;
            case 'article-download-md':
                if (ifMobile.value) {
                    pendingDownload = { data, emit, close };
                    ifShowMobileDownloadDialog.value = true;
                } else {
                    downloadMarkdownContent(data?.content, data?.title, (msg) => emit?.('alert', msg));
                }
                break;
        }
        close?.();
    };

    const confirmMobileDownload = () => {
        ifShowMobileDownloadDialog.value = false;
        if (pendingDownload) {
            const { data, emit } = pendingDownload;
            downloadMarkdownContent(data?.content, data?.title, (msg) => emit?.('alert', msg));
            pendingDownload = null;
        }
    };

    const cancelMobileDownload = () => {
        ifShowMobileDownloadDialog.value = false;
        pendingDownload = null;
    };

    return {
        ifShowReportCard,
        ifShowDeleteConfirmCard,
        ifShowCourseEditor,
        ifShowDialog,
        ifShowMobileDownloadDialog,
        handleOption,
        confirmMobileDownload,
        cancelMobileDownload,
        closeReportCard,
        closeDeleteConfirmCard,
        closeCourseEditor,
    };
}

export default useMoreOptionActions;
