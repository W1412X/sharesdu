<!-- old one -->
<template>
  <v-dialog v-model="ifShowDialog" style="width: 100%;height:100%;justify-content: center;">
    <div v-if="ifShowEmailExmineCode" style="width: 100%;height:100%;justify-content: center;display: flex">
      <email-examine-card :init-data="examineCardData" @alert="alert" @close="close"
        @submit="handleResetFinish"></email-examine-card>
    </div>
    <div v-if="ifShowSetProfileCard" style="width: 100%;height:100%;justify-content: center;display: flex">
      <set-profile-card @close="close" @alert="alert"
        @set_loading="setLoading"></set-profile-card>
    </div>
  </v-dialog>
  <v-card>
    <div style="display: flex; flex-direction: row">
      <div style="
            width: 100%;
            margin: 10px;
            display: flex;
            flex-direction: column;
          ">
        <div style="display: flex; flex-direction: row; margin: 10px">
          <v-avatar :image="userInfo.profileUrl" style="margin-right: 20px"></v-avatar>
          <v-spacer />
          <v-btn variant="outlined" color="#8a8a8a" @click="this.editProfile()">修改头像</v-btn>
        </div>
        <div style="display: flex; flex-direction: row; margin: 10px">
          <sensitive-text-area v-model="this.editingUserInfo.userName" :disabled="!ifAbleEditUserName" density="compact"
            row-height="15" rows="1" label="用户名" variant="outlined" auto-grow
            style="margin-right: 20px"></sensitive-text-area>
          <v-spacer />
          <v-btn variant="outlined" :color="this.userNameButtonColor" @click="this.editUserName()">{{
            buttonText.userName }}</v-btn>
          <v-btn style="margin-left: 20px" v-if="ifAbleEditUserName" variant="outlined" :color="userNameButtonColor"
            @click="this.cancelUserName()">取消</v-btn>
        </div>
        <div style="display: flex; flex-direction: row; margin: 10px">
          <sensitive-text-area v-model="this.editingUserInfo.email" :disabled="!ifAbleEditEmail" label="邮箱"
            density="compact" row-height="15" rows="1" variant="outlined" auto-grow
            style="margin-right: 20px"></sensitive-text-area>
          <v-spacer />
          <v-btn variant="outlined" :color="this.emailButtonColor" @click="this.editEmail()">{{ buttonText.email
            }}</v-btn>
          <v-btn style="margin-left: 20px" v-if="ifAbleEditEmail" variant="outlined" :color="emailButtonColor"
            @click="this.cancelEmail()">取消</v-btn>
        </div>
        <div style="display: flex; flex-direction: row; margin: 10px">
          <sensitive-text-area v-model="this.editingUserInfo.passwd" :disabled="!ifAbleEditPasswd" label="密码"
            density="compact" :rules="[passwdRule]" row-height="15" rows="1" variant="outlined" auto-grow
            style="margin-right: 20px"></sensitive-text-area>
          <v-spacer />
          <v-btn variant="outlined" :color="this.passwdButtonColor"
            :disabled="!validatePasswd(this.editingUserInfo.passwd) && ifAbleEditPasswd" @click="this.editPasswd()">{{
              buttonText.passwd }}</v-btn>
          <v-btn style="margin-left: 20px" v-if="ifAbleEditPasswd" variant="outlined" :color="passwdButtonColor"
            @click="this.cancelPasswd()">取消</v-btn>
        </div>
        <div style="display: flex; flex-direction: row; margin: 10px">
          <sensitive-text-area v-model="this.editingUserInfo.introduce" :disabled="!ifAbleEditIntroduce" label="简介"
            density="compact" row-height="15" rows="3" variant="outlined" auto-grow
            style="margin-right: 20px"></sensitive-text-area>
          <v-btn variant="outlined" :color="this.introduceButtonColor" @click="this.editIntroduce()">{{
            buttonText.introduce }}</v-btn>
          <v-btn style="margin-left: 20px" v-if="ifAbleEditIntroduce" variant="outlined" :color="introduceButtonColor"
            @click="this.cancelIntroduce()">取消</v-btn>
        </div>
        <div style="display: flex; flex-direction: row-reverse; margin: 10px">
          <v-btn style="margin-right: 10px;" prepend-icon='mdi-logout' variant="outlined" color="#8a8a8a"
            @click="this.logout()">退出在此设备的登陆</v-btn>
          <v-btn style="margin-right: 10px;" prepend-icon='mdi-delete-outline' variant="outlined" color="#8a8a8a"
            @click="this.delete()">注销此账户</v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>
<script>
import SetProfileCard from '@/components/user/SetProfileCard.vue';
import EmailExamineCard from '@/components/user/EmailExamineCard.vue';
import { computed, ref } from 'vue';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import { logout } from '@/axios/account';
import { copy, getCancelLoadMsg, getLoadMsg, openPage } from '@/utils/other';
import { rules, validatePassWord } from '@/utils/rules';
import { clearTokenCookies, getCookie } from '@/utils/cookie';
import { globalProperties } from '@/main';
export default {
  props: {
  },
  components: {
    EmailExamineCard,
    SetProfileCard,
    SensitiveTextArea,
  },
  setup() {
    const ifShowEmailExmineCode = ref(false);
    const ifShowSetProfileCard = ref(false);
    const ifShowDialog = computed(() => {
      return ifShowEmailExmineCode.value || ifShowSetProfileCard.value;
    })
    const themeColor=globalProperties.$themeColor;
    const setEmailExmineCodeCardState = (state) => {
      ifShowEmailExmineCode.value = state;
    }
    const setProfileCardState = (state) => {
      ifShowSetProfileCard.value = state;
    }
    return {
      ifShowDialog,
      ifShowEmailExmineCode,
      ifShowSetProfileCard,
      setEmailExmineCodeCardState,
      setProfileCardState,
      themeColor
    }
  },
  data() {
    const userInfo = {
      userId:getCookie("userId"),
      userName:getCookie("userName"),
      profileUrl:getCookie("userProfileUrl"),
      passwd: '********',
      email: getCookie("email")
    };
    const editingUserInfo = {
      userName: null,
      profileUrl: null,
      passwd: null,
      email: null
    }
    const buttonText = {
      email: computed(() => {
        return this.ifAbleEditEmail ? '确认修改' : '修改绑定邮箱'
      }),
      passwd: computed(() => {
        return this.ifAbleEditPasswd ? '确认修改' : '修改密码'
      }),
      userName: computed(() => {
        return this.ifAbleEditUserName ? '确认修改' : '修改用户名'
      }),
      introduce: computed(() => {
        return this.ifAbleEditIntroduce ? '确认修改' : '修改简介'
      }),
    }
    //显示的邮箱验证码的卡片
    let examineCardData;
    const ifAbleEditUserName = false
    const ifAbleEditPasswd = false
    const ifAbleEditEmail = false
    const ifAbleEditIntroduce = false
    const emailButtonColor = computed(() => {
      return this.ifAbleEditEmail == true ? this.themeColor : '#8a8a8a'
    })
    const userNameButtonColor = computed(() => {
      return this.ifAbleEditUserName == true ? this.themeColor : '#8a8a8a'
    })
    const passwdButtonColor = computed(() => {
      return this.ifAbleEditPasswd == true ? this.themeColor : '#8a8a8a'
    })
    const introduceButtonColor = computed(() => {
      return this.ifAbleEditIntroduce == true ? this.themeColor : '#8a8a8a'
    })
    return {
      buttonText,
      ifAbleEditEmail,
      ifAbleEditPasswd,
      ifAbleEditUserName,
      emailButtonColor,
      userNameButtonColor,
      passwdButtonColor,
      userInfo,
      introduceButtonColor,
      ifAbleEditIntroduce,
      examineCardData,
      passwdRule: rules.password,
      validatePasswd: validatePassWord,
      editingUserInfo
    }
  },
  methods: {
    editProfile() {
      this.setProfileCardState(true);
    },
    editUserName() {
      if (this.ifAbleEditUserName) {
        this.alert({ color: "info", state: true, title: '功能暂不支持', content: '此功能暂不支持，开发者正在开发中，敬请期待！' })
        return;
        //this.ifAbleEditUserName = false
      } else {
        this.alert({ color: "info", state: true, title: '功能暂不支持', content: '此功能暂不支持，开发者正在开发中，敬请期待！' });
        return;
        //this.ifAbleEditUserName = true
      }
    },
    editEmail() {
      if (this.ifAbleEditEmail) {
        this.alert({ color: "info", state: true, title: '功能暂不支持', content: '此功能暂不支持，开发者正在开发中，敬请期待！' });
        //this.ifAbleEditEmail = false
      } else {
        this.alert({ color: "info", state: true, title: '功能暂不支持', content: '此功能暂不支持，开发者正在开发中，敬请期待！' });
        //this.ifAbleEditEmail = true
      }
    },
    editPasswd() {
      if (this.ifAbleEditPasswd) {
        this.alert({ state: true, title: '功能暂不支持', content: '此功能暂不支持，开发者正在开发中，敬请期待！' })
        //set email exmine code card info and state  
        this.examineCardData = {
          type: 'reset_passwd',
          email: this.userInfo.email,
          passwd: this.editingUserInfo.passwd,
        }
        this.setEmailExmineCodeCardState(true)
      } else {
        this.ifAbleEditPasswd = true
      }
    },
    editIntroduce() {
      if (this.ifAbleEditIntroduce) {
        this.alert({ state: true, title: '功能暂不支持', content: '此功能暂不支持，开发者正在开发中，敬请期待！' })
        this.ifAbleEditIntroduce = false
      } else {
        this.ifAbleEditIntroduce = true
      }
    },
    close() {//关闭邮箱验证码的窗口
      this.setEmailExmineCodeCardState(false);
      this.setProfileCardState(false);
    },
    handleResetFinish(msg) {
      //success set,this function will be called  
      //two type reset_passwd or reset_email  
      if (msg.type == 'reset_passwd' && msg.state == 'success') {//如果对应的状态为成功
        this.alert({
          state: true,
          color: 'success',
          title: '修改成功',
          content: '现在您可以使用新密码登陆'
        })
        this.userInfo.passwd=this.editingUserInfo.passwd;
        //tick the passwd
        this.cancelPasswd();
      }
      if(msg.type == 'reset_email' && msg.state == 'success'){
        this.alert({
          state:true,
          color:'success',
          title:'修改成功',
          content:'现在您可以使用新邮箱验证'
        })
        this.userInfo.email=this.editingUserInfo.email;
        this.cancelEmail();
      }
    },
    cancelUserName() {
      this.editingUserInfo = copy(this.userInfo);
      this.ifAbleEditUserName = false
    },
    cancelEmail() {
      this.editingUserInfo = copy(this.userInfo);
      this.ifAbleEditEmail = false
    },
    cancelPasswd() {
      this.editingUserInfo = copy(this.userInfo);
      this.ifAbleEditPasswd = false
    },
    cancelIntroduce() {
      this.editingUserInfo = copy(this.userInfo);
      this.ifAbleEditIntroduce = false
    },
    async logout() {
      //logout from current device  
      this.setLoading(getLoadMsg("正在退出登录...", -1));
      const response = await logout();
      if (response.status == 200) {
        clearTokenCookies();
          openPage("url",'#/login');
      } else {
        this.alert({
          state: true,
          color: 'error',
          title: '登出失败，已强制登出',
          content: response.message
        })
        clearTokenCookies();
      }
      this.setLoading(getCancelLoadMsg());
    },
    async delete() {
      this.examineCardData={
        type: 'delete_account',
        email:this.userInfo.email,
        userName:this.userInfo.userName,
      };
      this.setEmailExmineCodeCardState(true);
    },
    alert(msg) {
      this.$emit('alert', msg);
    },
    setLoading(msg) {
      this.$emit('set_loading', msg);
    }
  },
  mounted() { 
  },
}
</script>