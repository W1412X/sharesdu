<template>
    <div style="position: fixed;">
        <canvas class="background" id="canvas"></canvas>
        <div style="max-height: 100vh;overflow-y: scroll;">
            <div class="top-bar">
                <span class="logo-text logo-margin">ShareSdu</span>
                <div class="top-btn-div">
                    <v-btn @click="this.setContactState(true)" :color="themeColor" variant="text"
                        class="title-bold">联系我们</v-btn>
                    <v-btn @click="downloadApp" :color="themeColor" variant="text" class="title-bold">安装APP</v-btn>
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
                                QQ群：<a href="https://qm.qq.com/q/Uh7X13Hp8Q">246680702</a>
                            </div>
                            <div class="card-bottom-div">
                                <v-btn variant="text" @click="this.setContactState(false)">好的</v-btn>
                            </div>
                        </v-card>
                        <v-card v-if="ifShowDownload" class="card">
                            <div class="title-bold">下载APP</div>
                            <div class="text-medium" style="margin: 5px;">
                                对于OPPO，VIVO，小米等品牌以及<span class="text-medium-bold">非纯血鸿蒙华为</span>用户直接下载Android版本并安装
                                <br />
                                对于苹果用户，在手机原生浏览器点击IOS按钮后安装网页应用
                                <br />
                                对于<span class="text-medium-bold">华为鸿蒙NEXT</span>用户，下载Harmony版本安装
                                <br/>
                                <span class="text-tiny">IOS应用由<a class="text-tiny-bold" href="https://app.60day.cn/">第三方平台</a>打包生成，谨慎授予相关权限</span>
                                <br />
                                <span class="text-tiny">注：如有无法安装以及其他问题请联系开发者(<a class="text-tiny-bold" href="https://qm.qq.com/q/Uh7X13Hp8Q">点击此处进入QQ群</a>)</span>
                            </div>
                            <div class="card-bottom-div">
                                <v-btn class="download-btn" prepend-icon="mdi-android" color="grey" variant="outlined"
                                    @click="openUrl('/app/sharesdu-android.apk')">Android</v-btn>
                                <v-btn class="download-btn"  prepend-icon="mdi-apple" color="grey" variant="outlined"
                                    @click="openUrl('https://appe.wapbyme.cn/dw/448765-9pKT')">IOS</v-btn>
                                <v-btn class="download-btn" prepend-icon="mdi-circle-outline" color="grey" variant="outlined"
                                    @click="openUrl('/app/sharesdu-harmony.hap')">HARMONY</v-btn>
                            </div>
                        </v-card>
                    </div>
                </v-dialog>
                <div class="column-div">
                    <v-card class="intro-card" elevation="12">
                        <div class="title-big-bold intro-text-div">一个大学交流分享平台</div>
                        <div class="title intro-text-div">旨在构建一个符合现代大学学生及相关人员实际需求的内容分享交流平台
                        </div>
                        <div class="column-btn-div">
                            <v-btn to="/document/intro" prepend-icon="mdi-file-document" color="primary"
                                class="intro-btn">查看网站介绍</v-btn>
                            <v-btn to="/login" prepend-icon="mdi-login-variant" color="secondary"
                                class="intro-btn">注册用户账号</v-btn>
                        </div>
                        <div class="text-tiny intro-text-div">
                            本站提供Android,IOS以及Harmony三种移动端的APP(点击右上角APP下载安装)<br/>
                            扫描下方二维码或<a class="text-tiny-bold" href="https://qm.qq.com/q/Uh7X13Hp8Q">点击此处</a>，加入官方QQ交流群/关注公众号
                        </div>
                            <br/>
                            
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
                    <img style="vertical-align:middle;width: 20px;height: 20px;margin-right: 5px;"
                        src="../../public/police.png">
                    <a style="font-size:13px;font-weight: bold;color: #8a8a8a;"
                        href="//www.beian.gov.cn/portal/registerSystemInfo?recordcode=37028202001173">鲁公网安备37028202001173号</a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import { initTriangleEffect } from '@/utils/animation';
import { openNewPage } from '@/utils/other';
import { ref, computed } from 'vue';
export default {
    name: 'WelcomePage',
    setup() {
        const themeColor = globalProperties.$themeColor;
        const deviceType = globalProperties.$deviceType;
        const ifShowLogin = ref(false);
        const ifShowContact = ref(false);
        const ifShowDownload = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowLogin.value || ifShowContact.value || ifShowDownload.value;
        })
        const setLoginState = (state) => {
            ifShowLogin.value = state;
        }
        const setContactState = (state) => {
            ifShowContact.value = state;
        }
        const setDownloadState = (state) => {
            ifShowDownload.value = state;
        }
        return {
            ifShowContact,
            ifShowDialog,
            ifShowLogin,
            setContactState,
            setLoginState,
            themeColor,
            deviceType,
            ifShowDownload,
            setDownloadState
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
        downloadApp() {
            this.setDownloadState(true);
        },
        openUrl(url) {
            openNewPage(url);
        }
    },
    mounted() {
        initTriangleEffect(document);
    }
}
</script>
<style scoped>
.download-btn {
    margin: 5px;
}
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
        max-width: 600px;
    }

    .card-bottom-div {
        display: flex;
        flex-direction: column;
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
        max-width: 80vw;
    }


    .card-bottom-div {
        display: flex;
        flex-direction: column;
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