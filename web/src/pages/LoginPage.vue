<template>
    <div style="position: fixed;">
        <canvas class="background" id="canvas"></canvas>
        <div>
            <v-dialog v-model="ifShowDialog" class="full-screen dialog">
                <div style="width: 100%;height:100%;justify-content: center;display: flex">
                    <email-examine-card @close="setEmailExamineCardState(false)" :init-data="examineCardInfo"
                        @alert="alert" @set_loading="setLoading" v-if="ifShowEmailExamineCard"></email-examine-card>
                </div>
            </v-dialog>
            <div class="full-center">
                <v-card class="card">
                    <v-tabs v-model="nowTab" :bg-color="themeColor" fixed-tabs>
                        <v-tab :style="{ background: themeColor, 'font-size': '18px' }" value="login" text="登陆"></v-tab>
                        <v-tab :style="{ background: themeColor, 'font-size': '18px' }" value="register"
                            text="注册"></v-tab>
                    </v-tabs>
                    <v-tabs-window v-model="nowTab">
                        <!-- login by userName -->
                        <v-tabs-window-item v-if="loginMethod === 'userName'" title="登录" value="login">
                            <sensitive-text-field v-model="loginByUsernameData.userName" :rules="[loginRules.userName]"
                                class="input" :density="inputType" variant="solo-filled" label="用户名"
                                prepend-inner-icon="mdi-account"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="loginByUsernameData.passwd"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="输入密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="输入密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <v-btn @click="loginByUsername()" class="login-btn" variant="outlined"
                                :disabled="!(valUserName(loginByUsernameData.userName) && valPassWord(loginByUsernameData.passwd))"
                                :loading="loading.login"
                                :color="themeColor">
                                登陆</v-btn>
                        </v-tabs-window-item>
                        <!-- login by email  -->
                        <v-tabs-window-item v-if="loginMethod === 'email'" title="登录" value="login">
                            <sensitive-text-field v-model="loginByEmailData.email" class="input"
                                :rules="[loginRules.email]" :density="inputType" variant="solo-filled" label="邮箱"
                                prepend-inner-icon="mdi-email"></sensitive-text-field>
                            <v-btn @click="loginByEmail()" class="login-btn" variant="outlined" :color="themeColor"
                                :disabled="!valEmail(loginByEmailData.email)">登陆</v-btn>
                        </v-tabs-window-item>
                        <!-- register by email STEP 1 -->
                        <v-tabs-window-item v-if="registerMethod === 'email' && registerByEmailStep === 0" title="注册"
                            value="register">
                            <div class="text-small tip-text-container">
                                <span>团体/组织/毕业生请联系管理员获取验证码</span>
                            </div>
                            <sensitive-text-field v-model="registerByEmailData.userName"
                                prepend-inner-icon="mdi-account" class="input" :rules="[loginRules.userName]"
                                :density="inputType" variant="solo-filled" label="用户名" :hint="'起一个喜欢的名称(此名称将作为登陆依据之一)'"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByEmailData.passwd"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="输入密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByEmailData.passwdConfirm"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="确认密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="确认密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <v-btn @click="step" class="login-btn" variant="outlined" :color="themeColor"
                                :disabled="!(valUserName(registerByEmailData.userName) && valPassWord(registerByEmailData.passwd) && valPassWord(registerByEmailData.passwdConfirm))">下一步</v-btn>
                        </v-tabs-window-item>
                        <!-- register by email STEP 2 -->
                        <v-tabs-window-item v-if="registerMethod === 'email' && registerByEmailStep === 1" title="注册"
                            value="register">
                            <div class="text-small-bold tip-text-container">
                                <span>注：当前仅对山东大学开放，校区，学院，专业均为选填</span>
                            </div>
                            <div class="row-center-div">
                                <v-select class="select-input" v-model="registerByEmailData.campus"
                                    variant="solo-filled" density="compact" :items="campusList" label="校区"></v-select>
                                <v-autocomplete class="select-input" v-model="registerByEmailData.college"
                                    variant="solo-filled" density="compact" :items="collegeList" label="学院"></v-autocomplete>
                                <sensitive-text-field class="select-input" v-model="registerByEmailData.major"
                                    :density="inputType" variant="solo-filled" label="专业"></sensitive-text-field>
                            </div>
                            <sensitive-text-field v-model="registerByEmailData.email" class="input"
                                :rules="[loginRules.email]" :density="inputType" variant="solo-filled"
                                prepend-inner-icon="mdi-email" label="校园邮箱(@mail.sdu.edu.cn)"></sensitive-text-field>
                            <div class="text-small agreement-text-container">
                                注册即代表您已阅读并同意
                                <span @click="toUrl('/#/document/to_know')">
                                    <strong style="color: #0074e8; text-decoration: underline;">入站须知</strong>
                                </span>与
                                <span @click="toUrl('/#/document/privacy')">
                                    <strong style="color: #0074e8; text-decoration: underline;">隐私政策</strong>
                                </span>
                            </div>
                            <div class="row-center-div">
                                <v-btn @click="stepBack" class="last-step-btn" variant="outlined"
                                    :color="themeColor">上一步</v-btn>
                                <v-btn @click="registerByEmail" class="register-btn" variant="outlined"
                                    :color="themeColor" :disabled="!valEmail(registerByEmailData.email)">注册</v-btn>
                            </div>
                        </v-tabs-window-item>
                        <!-- register by invite STEP 1 -->
                        <v-tabs-window-item v-if="registerMethod === 'invite' && registerByInviteStep === 0" title="注册"
                            value="register">
                            <div class="text-small tip-text-container">
                                <span>团体/组织/毕业生请联系管理员获取验证码</span>
                            </div>
                            <sensitive-text-field v-model="registerByInviteData.userName" class="input"
                                :rules="[loginRules.userName]" prepend-inner-icon="mdi-account" :density="inputType"
                                variant="solo-filled" label="用户名" :hint="'起一个喜欢的名称(此名称将作为登陆依据之一)'"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByInviteData.passwd"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="输入密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByInviteData.passwdConfirm"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="确认密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="确认密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <v-btn @click="step" class="login-btn" variant="outlined" :color="themeColor"
                                :disabled="!(valUserName(registerByInviteData.userName) && valPassWord(registerByInviteData.passwd) && valPassWord(registerByInviteData.passwdConfirm))">下一步</v-btn>
                        </v-tabs-window-item>
                        <!-- register by invite STEP2 -->
                        <v-tabs-window-item v-if="registerMethod === 'invite' && registerByInviteStep === 1" title="注册"
                            value="register">
                            <div class="text-small-bold tip-text-container">
                                <span>注：校区，学院，专业均为选填</span>
                            </div>
                            <div class="row-center-div">
                                <v-select class="select-input" v-model="registerByInviteData.campus"
                                    variant="solo-filled" density="compact" :items="campusList" label="校区"></v-select>
                                <v-autocomplete class="select-input" v-model="registerByInviteData.college"
                                    variant="solo-filled" density="compact" :items="collegeList" label="学院"></v-autocomplete>
                                <sensitive-text-field class="select-input" v-model="registerByInviteData.major"
                                    :density="inputType" variant="solo-filled" label="专业"></sensitive-text-field>
                            </div>
                            <sensitive-text-field v-model="registerByInviteData.email"
                                prepend-inner-icon="mdi-email" class="input"
                                :density="inputType" variant="solo-filled" label="绑定邮箱"></sensitive-text-field>
                            <sensitive-text-field v-model="registerByInviteData.inviteCode" class="input" :density="inputType"
                                variant="solo-filled" label="输入邀请码"></sensitive-text-field>
                            <div class="text-small agreement-text-container">
                                注册即代表您已阅读并同意
                                <span @click="toUrl('/#/document/to_know')">
                                    <strong style="color: #0074e8; text-decoration: underline;">入站须知</strong>
                                </span>与
                                <span @click="toUrl('/#/document/privacy')">
                                    <strong style="color: #0074e8; text-decoration: underline;">隐私政策</strong>
                                </span>
                            </div>
                            <div class="row-center-div">
                                <v-btn @click="stepBack" class="last-step-btn" variant="outlined"
                                    :color="themeColor">上一步</v-btn>
                                <v-btn @click="registerByInvite" class="register-btn" variant="outlined"
                                    :color="themeColor">注册</v-btn>
                            </div>
                        </v-tabs-window-item>
                        <div v-if="nowTab === 'login'" class="bottom-bar">
                            <v-btn @click="shiftLoginMethod" class="text-small" density="compact" variant="text">{{
                                loginMethod == 'userName' ? '使用邮箱登陆' : '使用用户名登陆' }}</v-btn>
                            <v-spacer></v-spacer>
                            <agree-button v-if="loginMethod == 'userName'" @click="handleAgree"></agree-button>
                        </div>
                        <div v-if="nowTab === 'register'" class="bottom-bar">
                            <v-btn @click="shiftRegisterMethod" class="text-small" density="compact" variant="text">{{
                                registerMethod == 'email' ? '使用邀请码注册' : '使用邮箱注册' }}</v-btn>
                        </div>
                    </v-tabs-window>
                </v-card>
                <v-btn @click="toUrl('/#/')" :color="themeColor" class="return-welcome-btn" variant="plain">返回首页</v-btn>
            </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import EmailExamineCard from '@/components/user/EmailExamineCard.vue';
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import { computed, ref } from 'vue';
import { rules } from '@/utils/rules';
import { validateEmail, validatePassWord, validateUserName } from '@/utils/rules';
import { /*getRegisterEmailCode*/ loginWithPassword, /*loginWithEmail, register*/ } from '@/axios/account';
import { getNormalWarnAlert, openPage, setLogin } from '@/utils/other';
import { csLoginByUserName } from '@/axios/api_convert/account';
import { initTriangleEffect } from '@/utils/animation';
import AgreeButton from '@/components/common/AgreeButton.vue';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { selfDefineLocalStorage } from '@/utils/localStorage';
export default {
    name: 'LoginPage',
    props:{
        name:{
            type:String,
            default:""
        },
        passwd:{
            type:String,
            default:""
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const ifShowEmailExamineCard = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowEmailExamineCard.value;
        })
        const apiUrl = globalProperties.$apiUrl;
        const campusList = globalProperties.$campus;
        const collegeList = globalProperties.$colleges;
        const setEmailExamineCardState = (state) => {
            ifShowEmailExamineCard.value = state;
        }
        const deviceType = globalProperties.$deviceType;
        const inputType = deviceType == 'desktop' ? 'compact' : 'comfortable';
        return {
            themeColor,
            ifShowEmailExamineCard,
            ifShowDialog,
            setEmailExamineCardState,
            deviceType,
            inputType,
            campusList,
            collegeList,
            apiUrl,
        }
    },
    components: {
        EmailExamineCard,
        SensitiveTextField,
        AgreeButton,
    },
    data() {
        const loginByUsernameData = {
            userName: null,
            passwd: null,
        }
        const loginByEmailData = {
            email: null,
            emailCode: null,
        }
        const registerByEmailData = {
            email: null,
            passwd: "",
            passwdConfirm: "",
            userName: "",
            campus: null,
            major: null,
            college: null,
            emailCode: null,
        }
        const registerByInviteData = {
            email: null,
            passwd: "",
            passwdConfirm: "",
            userName: "",
            campus: null,
            major: null,
            college: null,
            emailCode: null,
            inviteCode: null,
        }
        /**
         * card message card 
         */
        var examineCardInfo = computed(() => {
            if (this.nowTab == 'login') {
                return {
                    type: 'login',
                    email: this.loginByEmailData.email,
                }
            } else {
                if(this.registerMethod=='email'){
                    return {
                        type: 'register',
                        email: this.registerByEmailData.email,
                        campus: this.registerByEmailData.campus,
                        college: this.registerByEmailData.college,
                        major: this.registerByEmailData.major,
                        userName: this.registerByEmailData.userName,
                        passwd: this.registerByEmailData.passwd,
                    }
                }else{
                    return {
                        type: 'register',
                        email: this.registerByInviteData.email,
                        campus: this.registerByInviteData.campus,
                        college: this.registerByInviteData.college,
                        major: this.registerByInviteData.major,
                        userName: this.registerByInviteData.userName,
                        passwd: this.registerByInviteData.passwd,
                        inviteCode:this.registerByInviteData.inviteCode,
                    }
                }
            }
        })
        var loginMethod = 'userName';// userName/email
        var registerMethod = 'email';// email/invite
        var registerByEmailStep = 0;
        var registerByInviteStep = 0;
        const loginRules = rules;
        return {
            loginByUsernameData,
            loginByEmailData,
            registerByEmailData,
            registerByInviteData,
            loginMethod,
            registerMethod,
            registerByEmailStep,
            loginRules,
            registerByInviteStep,
            examineCardInfo,
            passwdVisible: false,
            ifSavePasswd:false,
            loading:{
                login:false,
            },
            nowTab:'login',
        }
    },
    beforeRouteLeave (to, from, next) {
        try{
            let msg={};
            msg.loginByUsernameData=this.loginByUsernameData;
            msg.loginByEmailData=this.loginByEmailData;
            msg.registerByEmailData=this.registerByEmailData;
            msg.registerByInviteData=this.registerByInviteData;
            msg.loginMethod=this.loginMethod;
            msg.registerMethod=this.registerMethod;
            msg.registerByEmailStep=this.registerByEmailStep;
            msg.registerByInviteStep=this.registerByInviteStep;
            msg.ifShowEmailExamineCard=this.ifShowEmailExamineCard;
            msg.nowTab=this.nowTab;
            selfDefinedSessionStorage.setItem('loginMsg',JSON.stringify(msg));
            next();
        }catch(e){
            next();
        }
    },
    methods: {
        async loginByUsername() {
            /**
             * login
             */
            this.loading.login=true;
            const response = await loginWithPassword(csLoginByUserName(this.loginByUsernameData));
            this.loading.login=false;
            if (response.status == 200) {
                this.alert({
                    color: 'success',
                    title: '登陆成功',
                    state: true,
                    content: response.message,
                })
                /**
                 * save the user message
                 */
                setLogin(response.user_name,response.user_id,response.email,response.refresh,this.apiUrl + "/image/user?user_id=" + response.user_id,response.is_master,response.is_super_master,this.ifSavePasswd?this.loginByUsernameData.passwd:null)
                /**
                 * to the index page
                 */
                if(selfDefineLocalStorage.getItem("lastHref")){
                    window.open(selfDefineLocalStorage.getItem("lastHref"),'_self')      
                    selfDefineLocalStorage.removeItem("lastHref")  
                }else{
                    openPage("router",{
                        name: 'IndexPage',
                    })
                }

            } else {
                this.alert({
                    color: 'error',
                    title: '请求错误',
                    state: true,
                    content: response.message,
                })
            }
        },
        loginByEmail() {
            /**
             * show the examine card  
             */
            this.setEmailExamineCardState(true);
        },
        registerByEmail() {
            /**
             * show the examine card
             */
            this.setEmailExamineCardState(true);
        },
        registerByInvite() {
            /**
             * temporarily do nothing
             */
            this.setEmailExamineCardState(true);
        },
        step() {
            if (this.registerMethod == 'email') {
                if (this.registerByEmailData.passwd != this.registerByEmailData.passwdConfirm) {
                    this.alert(getNormalWarnAlert("两次密码输入不一致"));
                    return;
                }
                this.registerByEmailStep++;
            } else {
                if (this.registerByInviteData.passwd != this.registerByInviteData.passwdConfirm) {
                    this.alert(getNormalWarnAlert("两次密码输入不一致"));
                    return;
                }
                this.registerByInviteStep++;
            }
        },
        stepBack() {
            if (this.registerMethod == 'email') {
                this.registerByEmailStep--;
            } else {
                this.registerByInviteStep--;
            }
        },
        shiftLoginMethod() {
            this.loginMethod = this.loginMethod === 'userName' ? 'email' : 'userName'
        },
        shiftRegisterMethod() {
            this.registerMethod = this.registerMethod === 'email' ? 'invite' : 'email';
        },
        valEmail(email) {
            return validateEmail(email);
        },
        valUserName(name) {
            return validateUserName(name);
        },
        valPassWord(passWord) {
            return validatePassWord(passWord);
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        toUrl(url) {
            openPage("url",{url:url});
        },
        handleAgree(state){
            this.ifSavePasswd=state;
        }
    },
    mounted() {
        //get last edit msg  
        let msg=selfDefinedSessionStorage.getItem("loginMsg");
        if(msg){
            msg=JSON.parse(msg);
            this.loginByUsernameData=msg.loginByUsernameData;
            this.loginByEmailData=msg.loginByEmailData;
            this.registerByEmailData=msg.registerByEmailData;
            this.registerByInviteData=msg.registerByInviteData;
            this.loginMethod=msg.loginMethod;
            this.registerMethod=msg.registerMethod;
            this.registerByEmailStep=msg.registerByEmailStep;
            this.registerByInviteStep=msg.registerByInviteStep;
            this.nowTab=msg.nowTab;
            this.setEmailExamineCardState(msg.ifShowEmailExamineCard);
        }
        if(this.user_name){
            this.loginByUsernameData.userName=this.name;
            this.loginByUsernameData.passwd=this.passwd;
        }
        if(selfDefineLocalStorage.getItem("passwd")){
            this.loginByUsernameData.userName=selfDefineLocalStorage.getItem("userName");
            this.loginByUsernameData.passwd=selfDefineLocalStorage.getItem("passwd");
        }
        initTriangleEffect(document);
    },
    created() {

    },
}
</script>
<style scoped>
.bottom-bar {
    padding: 5px;
    display: flex;
    flex-direction: row-reverse;
    width: 100%;
}
.return-welcome-btn{
    margin-top: 30px;
}
.margin-right-10px {
    margin-right: 10px;
}

.row-center-div {
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.tip-text-container {
    width: 100%;
    margin-top: 10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    color: grey;
}

.row-center-div {
    display: flex;
    padding-left: 5%;
    padding-right: 5%;
    flex-direction: row;
    justify-content: center;
}

.select-input {
    width: 30%;
    margin: 1%;
}

.agreement-text-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 10px;
}

@media screen and (min-width: 1000px) {
    .full-center {
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .input {
        width: 90%;
        margin-left: 5%;
        margin-right: 5%;
        margin-top: 20px;
    }

    .card {
        width: 600px;
    }

    .login-btn {
        width: 50%;
        margin-left: 25%;
        margin-right: 25%;
        margin-top: 10px;
        margin-bottom: 20px;
    }

    .register-btn {
        width: 25%;
        margin-left: 20px;
    }

    .last-step-btn {
        width: 25%;
    }
}

@media screen and (max-width: 1000px) {
    .full-center {
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .input {
        width: 90%;
        margin-left: 5%;
        margin-right: 5%;
        margin-top: 20px;
    }

    .card {
        width: 80vw;
    }

    .login-btn {
        width: 80%;
        margin-left: 10%;
        margin-right: 10%;
        margin-top: 10px;
        margin-bottom: 20px;
    }

    .register-btn {
        width: 25%;
        margin-left: 20px;
    }

    .last-step-btn {
        width: 25%;
    }
}
</style>