<!-- use the old version design -->
<template>
    <v-card style="width: 500px; padding: 5px">
        <div style="display: flex; flex-direction: row">
            <v-icon icon="mdi-alert-circle-outline" size="25"></v-icon>
            <div class="title-bold title-alert">
                举报
            </div>
        </div>
        <div class="type-alert text-medium-bold">
            类型: {{ report.type }}
        </div>
        <div class="id-alert text-medium-bold">
            举报项目ID: {{ report.id }}
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
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
export default {
    props: {
        report: {
            type: Object,
            default: function () {
                return {
                    type: '文章',
                    id: '00000000',
                }
            },
        },
    },
    components: {
        SensitiveTextArea
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
                this.alertSet = {
                    state: true,
                    title: '举报提交成功',
                    content: '请耐心等待举报结果，处理后将会发送处理结果到您的邮箱',
                    color: 'success',
                }
                // eslint-disable-next-line
                const report = {
                    type: this.report.type,
                    id: this.report.id,
                    reason: this.report.reason,
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