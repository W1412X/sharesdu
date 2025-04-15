<!-- old one -->
<template>
  <v-dialog v-model="ifShowDialog"
    style="display: flex;flex-direction: row;align-items: center;justify-content: center;width: 100%;height: 100%;">
    <div style="width: 100%;height:100%;justify-content: center;display: flex">
      <v-card v-if="ifShowImageConverter"  class="dialog-card">
        <div class="top-bar">
                    <v-spacer></v-spacer>
                    <v-icon icon="mdi-close" color="grey" size="24" @click="setImageConverterState(false)"></v-icon>
                </div>
                <pixel-image @result="handlePixelDealResult" :init-image-blob="blob" :init-item-type="'彩色'" :init-item-types="['黑白', '彩色','黑白(反转)','线条','线条(反转)']"></pixel-image>
      </v-card>
    </div>
  </v-dialog>
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
          @click="showImageConverter"></v-avatar>
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
import { computed, ref } from 'vue';
import PixelImage from './PixelImage.vue';
export default {
  setup() {
    const userName = getCookie('userName');
    const userProfileUrl = getCookie('userProfileUrl');
    const ifShowDialog = computed(() => {
      return ifShowImageConverter.value;
    });
    const ifShowImageConverter = ref(false);
    const setImageConverterState=(state)=>{
      ifShowImageConverter.value = state;
    }
    return {
      userName,
      userProfileUrl,
      ifShowImageConverter,
      setImageConverterState,
      ifShowDialog
    }
  },
  data() {
    return {
      blob: null,
      nowProfileUrl: this.userProfileUrl,
    }
  },
  components:{
    PixelImage,
  },
  methods: {
    selectImage() {
      this.$refs.imgInput.click();
    },
    async handleSelectedImage(event) {
      let file = event.target.files[0];
      this.blob = await compressImage(file, 'profile');
      this.nowProfileUrl = URL.createObjectURL(this.blob);
      this.alert(getNormalInfoAlert("上传的头像大小会被自动缩放至64*64大小"))
    },
    async handlePixelDealResult(image){
      this.blob=await compressImage(image,'profile');
      const timestamp = new Date().getTime();
      const extension = this.blob.type.split('/')[1]; 
      const fileName = `${timestamp}.${extension}`;
      this.blob=new File([this.blob],fileName,{type:this.blob.type});
      this.nowProfileUrl=URL.createObjectURL(this.blob);
      this.setImageConverterState(false);
      this.alert(getNormalInfoAlert("上传的头像大小会被自动缩放至64*64大小"))
    },
    async submit() {
      this.setLoading(getLoadMsg("正在上传头像", -1));
      const response = await uploadProfileImage(this.blob);
      this.setLoading(getCancelLoadMsg());
      if (response.status == 200 || response.status == 201) {
        this.alert(getNormalSuccessAlert(response.message));
        this.$emit("set_profile");
        this.close();
      } else {
        this.alert(getNormalErrorAlert(response.message));
      }
      this.setLoading(getCancelLoadMsg());
    },
    close() {
      this.$emit('close');
    },
    async showImageConverter(){
      const response = await fetch(this.nowProfileUrl);
      const blob=await response.blob();
      this.blob=blob;
      this.setImageConverterState(true);
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
.top-bar {
    width: 100%;
    display: flex;
    flex-direction: row;
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
@media  screen and (min-width: 600px)  {
    .dialog-card {
        max-width: 750px;
        min-height: 300px;
        max-height: 800px;
        overflow-y: scroll;
        padding: 5px;
    }
}
@media  screen and (max-width: 600px) {
    .dialog-car {
        max-width: 80vw;
        min-height: 30vh;
        max-height: 80vh;
        overflow-y: scroll;
        padding: 5px;
    }
}
</style>