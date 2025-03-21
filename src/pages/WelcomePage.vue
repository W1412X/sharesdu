<template>
    <div class="top-bar">
        <span class="logo-text logo-margin">ShareSdu</span>
        <div class="top-btn-div">
            <v-btn @click="this.setContactState(true)" :color="themeColor" variant="text"
                class="title-bold">联系我们</v-btn>
            <v-btn @click="openApi" :color="themeColor" variant="text" class="title-bold">开发文档</v-btn>
            <v-btn :color="themeColor" variant="text" class="title-bold">APP</v-btn>
        </div>
    </div>
    <div class="logo-line"></div>
    <div class="full-center">
        <v-dialog v-model="ifShowDialog" class="full-center">
            <div class="dialog-card-container">
                <v-card v-if="ifShowLogin" class="card">
                    <div class="title-bold">敬请期待</div>
                    <div class="text-medium">暂未对外开放<br />(预计于25年3月份开放注册)</div>
                    <div class="card-bottom-div">
                        <v-btn variant="text" @click="this.setLoginState(false)">好的</v-btn>
                    </div>
                </v-card>
                <v-card v-if="ifShowContact" class="card">
                    <div class="title-bold">联系我们</div>
                    <div class="text-medium-bold">
                        邮箱：<a href="mailto:admin@sharesdu.com">admin@sharesdu.com</a><br />
                        QQ群：246680702
                    </div>
                    <div class="card-bottom-div">
                        <v-btn variant="text" @click="this.setContactState(false)">好的</v-btn>
                    </div>
                </v-card>
            </div>
        </v-dialog>
        <div class="column-div">
            <v-card class="intro-card" elevation="12">
                <div class="title-big-bold intro-text-div">一个大学资源分享平台</div>
                <div class="title intro-text-div">旨在为大学生提供一个内容纯净精确的分享、搜索、获取大学生活中需要的学习资料，经验贴，课程评价、问答以及其他信息的
                    <span class="title-bold">永久免费</span>
                    的平台
                </div>
                <div class="column-btn-div">
                    <v-btn to="/document/intro" prepend-icon="mdi-file-document" color="primary"
                        class="intro-btn">查看网站介绍</v-btn>
                    <v-btn to="/login" prepend-icon="mdi-login-variant" color="secondary"
                        class="intro-btn">注册用户账号</v-btn>
                </div>
                <div class="text-tiny intro-text-div">拥有山大云邮(@mail.sdu.edu.cn)的人员均可注册 （¯﹃¯） </div>
            </v-card>
            <div class="img-container">
                <img class="img" src="/qq_img/group_qr.png" />
                <img class="img" src="/wechat/wechat_qr.jpg" />
            </div>
        </div>
    </div>
    <div
        style="width: 100%;display: flex;justify-content: center;margin-top: 10px;flex-direction: row;align-items: center;margin-bottom: 10px;">
        <div
            style="display: flex;flex-direction: row;font-size: 13px;font-weight: 600;justify-content: center;margin-right: 10px;">
            <a href="https://beian.miit.gov.cn/" style="color: #8a8a8a;" target="_blank">鲁ICP备2024118409号-1</a>
        </div>
        <div style="display: flex;flex-direction: row;justify-content: center;align-items: center;">
            <img style="vertical-align:middle;width: 20px;height: 20px;margin-right: 5px;" src="../../public/police.png">
            <a style="font-size:13px;font-weight: bold;color: #8a8a8a;"
                href="//www.beian.gov.cn/portal/registerSystemInfo?recordcode=37028202001173">鲁公网安备37028202001173号</a>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import { getCancelLoadMsg } from '@/utils/other';
import { ref, computed } from 'vue';
export default {
    name: 'WelcomePage',
    setup() {
        const themeColor = globalProperties.$themeColor;
        const deviceType = globalProperties.$deviceType;
        const ifShowLogin = ref(false);
        const ifShowContact = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowLogin.value || ifShowContact.value;
        })
        const setLoginState = (state) => {
            ifShowLogin.value = state;
        }
        const setContactState = (state) => {
            ifShowContact.value = state;
        }
        return {
            ifShowContact,
            ifShowDialog,
            ifShowLogin,
            setContactState,
            setLoginState,
            themeColor,
            deviceType
        }
    },
    components: {

    },
    data() {
        return {
            reason: "",
        }
    },
    methods: {
        openApi(){
            this.$emit("alert",{
                state:true,
                color:'info',
                title:'>_< API文档暂时不开放',
                content:'...................'
            })
        }
    },
    mounted() {
        this.setLoading(getCancelLoadMsg());
    }
}
</script>
<style scoped>
/** desktop */
@media screen and (min-width: 600px) {
    .top-btn-div {
        display: flex;
        flex-direction: row-reverse;
        width: 60%;
    }

    .full-center {
        width: 100%;
        display: grid;
        justify-content: center;
    }

    .dialog-card-container {
        display: flex;
        justify-content: center;
    }

    .card {
        padding: 10px;
        max-width: 400px;
    }

    .card-bottom-div {
        display: flex;
        flex-direction: row-reverse;
        padding: 5px;
        margin-top: 5px;
    }

    .intro-card {
        margin-top: 150px;
        max-width: 800px;
        padding: 15px;
        height: fit-content;
        display: grid;
        justify-content: center;
        flex-direction: column;
    }

    .intro-text-div {
        margin-top: 5px;
        width: fit-content;
        justify-self: center;
    }

    .column-btn-div {
        width: fit-content;
        display: flex;
        flex-direction: column;
        justify-self: center;
    }

    .column-div {
        width: 100%;
        height: 100%;
        display: grid;
        justify-content: center;
    }

    .intro-btn {
        margin: 5px;
    }

    .img-container {
        width: fit-content;
        height: fit-content;
        justify-self: center;
    }

    .img {
        height: 200px;
        width: 200px;
        margin: 10px;
    }

    .top-bar {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
    }

    .logo-margin {
        margin: 5px;
        width: 40%;
    }
}

/** mobile */
@media screen and (max-width: 600px) {
    .full-center {
        width: 100vw;
        display: grid;
        justify-content: center;
    }

    .top-bar {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
    }

    .top-btn-div {
        display: flex;
        flex-direction: row-reverse;
        width: 60vw;
    }

    .dialog-card-container {
        display: flex;
        justify-content: center;
    }

    .card {
        padding: 10px;
        max-width: 200px;
    }

    .card-bottom-div {
        display: flex;
        flex-direction: row-reverse;
        padding: 5px;
        margin-top: 5px;
    }

    .intro-card {
        margin-top: 150px;
        max-width: 400px;
        padding: 15px;
        height: fit-content;
        display: grid;
        justify-content: center;
        flex-direction: column;
    }

    .intro-text-div {
        margin-top: 5px;
        width: fit-content;
        justify-self: center;
    }

    .column-div {
        width: fit-content;
        display: flex;
        flex-direction: column;
        justify-self: center;
    }

    .column-btn-div {
        width: fit-content;
        display: flex;
        flex-direction: column;
        justify-self: center;
    }

    .intro-btn {
        margin: 5px;
    }

    .img-container {
        margin-top: 50px;
        width: 100%;
        height: fit-content;
        display: grid;
        justify-content: center;
    }

    .logo-margin {
        margin: 5px;
        width: 40vw;
    }

    .img {
        height: 200px;
        width: 200px;
        margin: 10px;

    }
}
</style>