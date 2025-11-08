<!-- use the old one -->
<template>
    <v-card class="card">
        <div class="close-btn-container">
            <v-btn size="25" variant="text" icon="mdi-close" @click="cancelExamine()"></v-btn>
        </div>
        <div class="title-text">
            验证您的账户
        </div>
        <div class="normal-text title">
            我们已经向您的邮箱
            <span class="email-text">{{ data.email }}</span>
            发送验证码,请检查您的邮箱以获取验证码并输入
            (如果没有收到，注意检查垃圾邮箱)
        </div>
        <v-sheet color="surface">
            <v-otp-input v-model="data.emailCode" variant="outlined"></v-otp-input>
        </v-sheet>
        <div class="examine-btn-container">
            <v-btn :disabled="loading.examine" :loading="loading.examine" :color="themeColor" height="40" text="验证"
                variant="flat" @click="examine()" class="examine-btn"></v-btn>
        </div>
        <div class="row-reverse-div">
            <div class="bottom-bar text-small">
                没有收到验证码?
                <a href="#" @click.prevent="code = ''" @click="resend()" style="margin-right: 10px">重新发送</a>
            </div>
            <v-spacer></v-spacer>
        </div>
    </v-card>
</template>
<script>
import { getRegisterEmailCode, getDeleteAccountEmailCode, getLoginEmailCode, getResetPasswordEmailCode, registerByEmail } from '@/api/modules/account';
import { loginWithEmail, deleteAccount, resetPassword } from '@/api/modules/account';
import { globalProperties } from '@/main';
import { getCancelLoadMsg, getLoadMsg, getNormalInfoAlert, openPage, setLogin } from '@/utils/other';
import { clearTokenCookies } from '@/utils/cookie';
import { csDeleteAccount, csLoginByEmail, csRegisterByEmail, csResetPassword } from '@/api/modules/api_convert/account';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { selfDefineLocalStorage } from '@/utils/localStorage';
export default {
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    type: null,
                    email: '',
                    passwd: '',
                    userName: '',
                    emailCode: '',
                }
            }
        },
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const apiUrl = globalProperties.$apiUrl;
        return {
            themeColor,
            apiUrl,
        }
    },
    data() {
        const data = this.initData;
        return {
            data,
            loading: {
                send: false,
                examine: false,
            }
        }
    },
    methods: {
        async examine() {//examine the email here 
            //check if the examine code valid 
            if (!this.data.emailCode || this.data.emailCode.length != 6) {
                this.alert({
                    state: true,
                    color: 'error',
                    title: '请输入正确格式验证码',
                    content: '验证码格式错误'
                })
                return;
            }
            this.loading.examine = true;
            let formToSubmit = this.data;
            let response = null;
            switch (this.data.type) {
                case 'register':
                    response = await registerByEmail(csRegisterByEmail(formToSubmit));
                    break;
                case 'login':
                    response = await loginWithEmail(csLoginByEmail(formToSubmit));
                    break;
                case 'delete_account':
                    response = await deleteAccount(csDeleteAccount(formToSubmit));
                    break;
                case 'reset_passwd':
                    response = await resetPassword(csResetPassword(formToSubmit));
                    break;
                default:
                    break;
            }
            if (response.status == 200) {
                switch (this.data.type) {
                    case 'register':
                        this.alert(getNormalInfoAlert("登陆之后，在个人主页可以修改个人信息"))
                        selfDefinedSessionStorage.removeItem("loginMsg");
                        window.location.reload();
                        break;
                    case 'login':
                        /**
                         * save the user message
                         */
                        setLogin(response.user_name, response.user_id, this.data.email, response.refresh, this.apiUrl + "/image/user?user_id=" + response.user_id, response.is_master, response.is_super_master, null);
                        if (selfDefineLocalStorage.getItem("lastHref")) {
                            window.open(selfDefineLocalStorage.getItem("lastHref"), '_self')
                            selfDefineLocalStorage.removeItem("lastHref")
                        } else {
                            openPage("router",{
                                name: 'IndexPage',
                            })
                        }
                        break;
                    case 'delete_account':
                        /**
                         * delete the user message
                         */
                        clearTokenCookies();
                        selfDefinedSessionStorage.removeItem("loginMsg");
                        openPage("router",{ name: "WelcomePage" });
                        break;
                    case 'reset_passwd':
                        this.$emit("submit", { type: "reset_passwd", state: "success" });
                        this.$emit("close");
                        break;
                    default:
                        break;
                }
            } else {
                this.alert({
                    color: 'error',
                    state: true,
                    title: '验证失败',
                    content: response.message,
                })
            }
            this.loading.examine = false;
        },
        async resend() {//resend the code  
            let response = null;
            this.setLoading(getLoadMsg('正在发送验证码...', -1));
            switch (this.data.type) {
                case 'register':
                    response = await getRegisterEmailCode(this.data.email, this.data.inviteCode);
                    break;
                case 'login':
                    response = await getLoginEmailCode(this.data.email);
                    break;
                case 'delete_account':
                    response = await getDeleteAccountEmailCode(this.data.email);
                    break;
                case 'reset_passwd':
                    response = await getResetPasswordEmailCode(this.data.email);
                    break;
                default:
                    response={};
                    break;
            }
            if (response.status == 200) {
                this.alert({
                    state: true,
                    color: 'success',
                    title: '发送成功',
                    content: '验证码已发送至您的邮箱，请及时查看'
                })
            } else {
                this.alert({
                    state: true,
                    color: 'error',
                    title: "验证码发送失败",
                    content: response.message,
                })
            }
            this.setLoading(getCancelLoadMsg());
        },
        cancelExamine() {
            //close the examine code
            this.$emit('close');
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        alert(msg) {
            this.$emit('alert', msg);
        }
    },
    components: {},
    mounted() {
        /**
         * test
         */
    },
    created() {
        //create the examine code 
        this.resend();
    }
}
</script>
<style scoped>
.close-btn-container {
    display: flex;
    justify-content: right;
}

.title-text {
    margin-top: 5px;
    font-size: 24px;
    display: flex;
    justify-content: center;
    font-weight: bold;
}

.normal-text {
    margin-top: 10px;
    margin-bottom: 10px;
}

.email-text {
    color: #0066ff;
    text-decoration: underline;
}

.examine-btn-container {
    display: flex;
    justify-content: center;
}

.examine-btn {
    width: 300px;
    font-size: 18px;
    font-weight: bold;
    color: white;
}

.bottom-bar {
    display: flex;
    justify-content: right;
    margin-top: 25px;
}

.row-reverse-div {
    display: flex;
    flex-direction: row-reverse;
}

@media screen and (min-width: 1000px) {
    .card {
        display: flex;
        width: 600px;
        flex-direction: column;
        padding: 10px;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        display: flex;
        width: 80vw;
        flex-direction: column;
        padding: 10px;
    }

}
</style>