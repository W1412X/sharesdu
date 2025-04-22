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
        默认使用随机的头像，上传一个图片作为你的头像，上传的头像大小会被自动缩放至64*64大小
      </div>
      <div style="
              justify-content: center;
              width: 100%;
              display: flex;
              margin-top: 20px;
            ">
        <v-avatar ref="file" :image="this.nowProfileUrl" size="64"
          @click="this.selectImage()"></v-avatar>
      </div>
      <div style="
              justify-content: center;
              width: 100%;
              display: flex;
              margin-top: 20px;
              flex-direction: row;
            ">
        <v-btn :color="themeColor" variant="outlined" style="margin: 5px;height: 35px;" @click="selectImage">
          {{ ifSelected? '重新选择' : '选择图片' }}
        </v-btn>
        <v-btn v-if="ifSelected" :loading="loading" :disabled="loading||compressing" variant="outlined" style="height: 35px;margin: 5px;" :color="themeColor" @click="this.submit()">
          {{ compressing? '正在压缩' : '确认上传' }}
        </v-btn>
      </div>
    </div>
  </v-card>
</template>
<script>
import { uploadProfileImage } from '@/axios/image';
import { globalProperties } from '@/main';
import { getCookie } from '@/utils/cookie';
import { compressImage, resizeImage } from '@/utils/image';
import { getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert } from '@/utils/other';
export default {
  setup() {
    const userName = getCookie('userName');
    const userProfileUrl = getCookie('userProfileUrl');
    const themeColor=globalProperties.$themeColor;
    return {
      userName,
      userProfileUrl,
      themeColor,
    }
  },
  data() {
    return {
      blob: null,
      nowProfileUrl: this.userProfileUrl,
      loading: false,
      ifSelected:false,
      compressing:false,
    }
  },
  methods: {
    selectImage() {
      this.$refs.imgInput.click();
    },
    async handleSelectedImage(event) {//完成选取图片，压缩图片，上传图片的逻辑 
      let file = event.target.files[0];
      this.compressing=true;
      this.blob = await compressImage(file,5);
      this.blob = await resizeImage(this.blob, 64, 64);
      this.nowProfileUrl = URL.createObjectURL(this.blob);
      this.compressing=false;
      this.ifSelected=true;
      this.alert(getNormalInfoAlert("上传的头像大小会被自动缩放至64*64大小"))
    },
    async submit() {//关闭此窗口的逻辑，点击此按钮开始上传
      this.loading = true;
      const response = await uploadProfileImage(this.blob);
      this.loading = false;
      if (response.status == 200 || response.status == 201) {
        this.alert(getNormalSuccessAlert(response.message));
        //if success,tell the parent 
        this.$emit("set_profile");
        this.close();
      } else {
        this.alert(getNormalErrorAlert(response.message));
      }
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
  mounted() {
    this.nowProfileUrl = this.userProfileUrl;
  }
}
</script>
<style scoped>
.close-btn-container {
  display: flex;
  flex-direction: row-reverse;
}

.card {
  width: 400px;
  padding: 10px;
  border-color: #8a8a8a;
  border-width: 2px;
  background-color: #ffffff;
}

.center-text {
  display: flex;
  flex-direction: row;
  font-size: 18px;
  justify-content: center;
  color: #8a8a8a;
  font-weight: 600;
}

.center-little-text {
  display: flex;
  flex-direction: row;
  font-size: 15px;
  justify-content: center;
  margin-top: 10px;
  color: #8a8a8a;
  font-weight: 400;
}
</style>