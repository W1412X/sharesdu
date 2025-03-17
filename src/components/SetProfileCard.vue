<!-- old one -->
<template>
  <input type="file" ref="imgInput" style="display: none;" @change="handleSelectedImage" />
  <v-card class="card" variant="outlined">
    <div class="close-btn-container">
      <v-btn size="25" variant="text" icon="mdi-close" @click="close()"></v-btn>
    </div>
    <div style="display: flex; flex-direction: column">
      <div class="center-text">
        设置头像
      </div>
      <div class="center-little-text">
        默认使用随机的头像，上传一个图片作为你的头像，上传的头像大小会被自动缩放至128*128大小
      </div>
      <div style="
              justify-content: center;
              width: 100%;
              display: flex;
              margin-top: 20px;
            ">
        <v-avatar ref="file" :image="this.nowProfileUrl" variant="tonal" :size="60"
          @click="this.selectImage()"></v-avatar>
      </div>
      <div style="
              justify-content: center;
              width: 100%;
              display: flex;
              margin-top: 20px;
              flex-direction: row;
            ">
        <v-btn variant="outlined" style="height: 35px" color="#9c0c13" @click="this.submit()">提交</v-btn>
      </div>
    </div>
  </v-card>
</template>
<script>
import { uploadProfileImage } from '@/axios/image';
import { getCookie } from '@/utils/cookie';
import { compressImage } from '@/utils/image';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert } from '@/utils/other';
export default {
  setup(){
    const userName=getCookie('userName');
    const userProfileUrl=getCookie('userProfileUrl');
    console.log(userName);
    console.log(userProfileUrl);
    return {
      userName,
      userProfileUrl,
    }
  },
  data() {
    return {
      blob: null,
      nowProfileUrl: this.userProfileUrl,
    }
  },
  methods: {
    selectImage() {
      this.$refs.imgInput.click();
    },
    async handleSelectedImage(event) {//完成选取图片，压缩图片，上传图片的逻辑 
      let file = event.target.files[0];
      this.blob = await compressImage(file, 'profile');
      this.nowProfileUrl = URL.createObjectURL(this.blob);
      this.alert(getNormalInfoAlert("上传的头像大小会被自动缩放至64*64大小"))
    },
    async submit() {//关闭此窗口的逻辑，点击此按钮开始上传
      this.setLoading(getLoadMsg("正在上传头像",-1));
      const response=await uploadProfileImage(this.blob);
      this.setLoading(getCancelLoadMsg());
      if(response.status==200||response.status==201){
        this.alert(getNormalSuccessAlert(response.message));
        //if success,tell the parent 
        this.$emit("set_profile");
        this.close();
      }else{
        this.alert(getNormalErrorAlert(response.message));
      }
      this.setLoading(getCancelLoadMsg());
    },
    close() {
      this.$emit('close');
    },
    alert(msg) {
      this.$emit('alert', msg);
    },
    setLoading(msg) {
      this.$emit('set_loading', msg);
    },
  },
  mounted(){
    this.nowProfileUrl=this.userProfileUrl;
  }
}
</script>
<style scoped>
.close-btn-container{
  display: flex;
  flex-direction: row-reverse;
}
.card{
          width: 400px;
          padding: 10px;
          border-color: #8a8a8a;
          border-width: 2px;
          background-color: #ffffff;
}
.center-text{
  display: flex;
              flex-direction: row;
              font-size: 18px;
              justify-content: center;
              color: #8a8a8a;
              font-weight: 600;
}
.center-little-text{
  display: flex;
              flex-direction: row;
              font-size: 15px;
              justify-content: center;
              margin-top: 10px;
              color: #8a8a8a;
              font-weight: 400;
}
</style>