<template>
    <v-card class="confirm-dialog-card">
        <v-card-title class="dialog-title text-title-bold">
            确认删除
        </v-card-title>
        <v-card-text class="dialog-content text-medium">
            确认删除此项么？
        </v-card-text>
        <v-card-actions class="dialog-actions">
            <v-spacer></v-spacer>
            <v-btn
                variant="outlined"
                size="small"
                @click="cancelDelete"
                class="dialog-btn"
            >
                取消
            </v-btn>
            <v-btn
                :color="themeColor"
                :loading="loading"
                :disabled="loading"
                size="small"
                @click="confirmDelete"
                class="dialog-btn"
            >
                确认
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { deleteArticle } from '@/api/modules/article';
import { deleteCourse } from '@/api/modules/course';
import { deletePostById, deleteReplyById } from '@/api/modules/post';
import { getNormalErrorAlert, getNormalSuccessAlert, openPage } from '@/utils/other';
import { globalProperties } from '@/main';

export default {
    props: {
        id: {
            type: String,
            default: '00000000',
        },
        type: {
            type: String,
            default: 'article',
        },
    },
    setup() {
        return {
            themeColor: globalProperties.$themeColor,
        };
    },
    data() {
        return {
            loading: false,
        }
    },
    methods: {
        alert(msg) {
            this.$emit('alert', msg)
        },
        cancelDelete() {
            this.$emit('close');
        },
        async confirmDelete() {
            this.loading = true;
            let response = { status: -1, message: "网络错误" };
            switch (this.type) {
                case 'article':
                    response = await deleteArticle(this.id);
                    break;
                case 'post':
                    response = await deletePostById(this.id);
                    break;
                case 'course':
                    response = await deleteCourse(this.id);
                    break;
                case 'reply':
                    response = await deleteReplyById(this.id);
                    break;
                case 'section':
                    response = await deleteArticle(this.id);
                    break;
                default:
                    this.alert(getNormalErrorAlert("未知的删除类型"));
                    this.loading = false;
                    return;
            }
            this.loading = false;
            if (response.status == 200) {
                this.alert(getNormalSuccessAlert('删除成功'));
                this.$emit('delete');
                this.$emit('close');
                if(this.type == 'post'||this.type == 'article'||this.type == 'course'){
                    openPage("router",{name:"IndexPage"});
                }
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
    }
}
</script>

<style scoped>
.confirm-dialog-card {
    border-radius: 12px;
    padding: 4px;
}

.dialog-title {
    padding: 16px 16px 8px 16px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.87);
}

.dialog-content {
    padding: 0 16px 16px 16px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.4;
}

.dialog-actions {
    padding: 4px 12px 12px 12px;
    gap: 8px;
}

.dialog-btn {
    min-width: 70px;
    text-transform: none;
    font-weight: 500;
    font-size: 13px;
}
</style>
