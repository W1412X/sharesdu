<!-- use the old version design -->
<template>
    <v-card style="padding: 5px">
        <div style="display: flex; flex-direction: row">
            <v-icon icon="mdi-alert-circle-outline" size="25"></v-icon>
            <div class="title-bold title-alert">
                举报
            </div>
        </div>
        <div class="type-alert text-medium-bold">
            类型: {{ type }}
        </div>
        <div class="id-alert text-medium-bold">
            举报项目ID: {{ id }}
        </div>
        <sensitive-text-area class="text-area" label="填写你的举报理由(不多于100字)" variant="outlined" v-model="reason"></sensitive-text-area>
        <div class="btn-container">
            <v-btn @click="submit()" variant="text"
                class="text-medium btn">提交</v-btn>
            <v-btn @click="cancel()" variant="text"
                class="text-medium btn">取消</v-btn>
        </div>
    </v-card>
</template>
<script>
import { defineAsyncComponent } from 'vue'
import { adminEmail } from '@/config'

export default {
    props: {
        type:{
            type: String,
            default: null,
        },
        id:{
            type: String,
            default: null,
        },
    },
    components: {
        SensitiveTextArea: defineAsyncComponent(() => import('@/components/common/SensitiveTextArea.vue'))
    },
    data() {
        const reason = ''
        const alertSet = {}
        return {
            reason,
            alertSet,
        }
    },
    methods: {
        /**
         * 格式化举报内容为邮件正文
         * @param {String} type - 举报类型
         * @param {String} id - 举报项目ID
         * @param {String} reason - 举报原因
         * @returns {String} 格式化后的邮件正文
         */
        formatReportEmail(type, id, reason) {
            const emailContent = `举报类型：${type || '未知'}
举报项目ID：${id || '未知'}

举报原因：
${reason || '未填写'}

---
此举报来自 ShareSDU 平台
举报时间：${new Date().toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
})}`;
            return emailContent;
        },
        /**
         * 打开邮件客户端发送举报邮件
         * @param {String} type - 举报类型
         * @param {String} id - 举报项目ID
         * @param {String} reason - 举报原因
         */
        openEmailClient(type, id, reason) {
            const subject = encodeURIComponent(`[ShareSDU举报] ${type} - ID: ${id}`);
            const body = encodeURIComponent(this.formatReportEmail(type, id, reason));
            const mailtoLink = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
            
            // 打开邮件客户端
            window.location.href = mailtoLink;
        },
        submit() {
            if (this.reason == '') {
                //if the alert reason is empty
                this.alertSet = {
                    state: true,
                    title: '举报原因不可为空',
                    content: '',
                    color: 'warning',
                }
            } else {
                // 打开邮件客户端
                this.openEmailClient(this.type, this.id, this.reason);
                
                this.alertSet = {
                    state: true,
                    title: '举报提交成功',
                    content: '已打开邮件客户端，请确认发送邮件。处理后将会发送处理结果到您的邮箱',
                    color: 'success',
                }
            }
        },
        cancel() {
            this.$emit('close');
        }
    },
}
</script>
<style scoped>
.text-area{
    margin: 10px;
    margin-bottom: 5px;
}
.btn-container{
    display: flex;flex-direction: row;padding-bottom:5px;padding-right: 5px;flex-direction: row-reverse;
}
@media screen and (min-width: 1000px) {
    .title-alert{
        margin-left: 10px;
    }
    .type-alert{
        width: 100%;
        margin-top: 5px;
        margin-left: 10px;
    }
    .id-alert{
        width: 100%;
        margin-top: 5px;
          margin-left: 10px;
    }
    .btn{
        height: 30px;
        margin-left: 10px;
    }
}

@media screen and (max-width: 1000px) {
    .title-alert{
        margin-left: 10px;
    }
    .type-alert{
        width: 100%;
        margin-top: 5px;
        margin-left: 10px;
    }
    .id-alert{
        width: 100%;
        margin-top: 5px;
          margin-left: 10px;
    }
    .btn{
        height: 30px;
        margin-left: 10px;
    }
}


</style>