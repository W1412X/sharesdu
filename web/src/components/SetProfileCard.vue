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
        上传一个图片并编辑作为你的头像，
      </div>
      <VuePictureCropper
          id="profile-cropper"
          :boxStyle="{
          width: 'fit-content',
          height: 'fit-content',
          backgroundColor: '#00000000',
          margin: 'auto'}" 
          :img="this.nowProfileUrl" 
          :options="{
            viewMode: 1,
            dragMode: 'move',
            aspectRatio: 1,
            cropBoxResizable: false,
          }" 
          :key="lastcropSize"
          :presetMode="{
            mode: 'round',
            width: lastcropSize,
            height: lastcropSize
          }">
      </VuePictureCropper>
      <div style="width: 100%;display: flex;flex-direction: row;justify-content: center;margin-top: 15px;">
        <v-avatar v-if="this.croppedImg" ref="file" :image="this.croppedImg" size="64"></v-avatar>
      </div>
      <div style="
              justify-content: center;
              width: 100%;
              display: flex;
              margin-top: 20px;
            ">
        <v-slider v-if="ifSelected" v-model="cropSize" :max="maxCropSize" :step="1" :min="minCropSize" :color="themeColor" label="大小" style="width: 100%;"
          @start="()=>{lastcropSize=cropSize;}"
          @end="()=>{lastcropSize=cropSize;}"
          hide-details>
        </v-slider>
      </div>
      <div style="
              justify-content: center;
              width: 100%;
              display: flex;
              margin-top: 20px;
              flex-direction: row;
            ">
        <v-btn :loading="loading" :disabled="loading" :color="themeColor" variant="outlined" style="margin: 5px;height: 35px;" @click="selectImage">
          {{ ifSelected ? '重新选择' : '选择图片' }}
        </v-btn>
        <v-btn v-if="ifSelected" :color="themeColor" variant="outlined" style="margin: 5px;height: 35px;" @click="preview">
          预览
        </v-btn>
        <v-btn v-if="ifSelected" :loading="loading" :disabled="loading || compressing" variant="outlined"
          style="height: 35px;margin: 5px;" :color="themeColor" @click="this.submit()">
          {{ compressing ? '正在压缩' : '确认上传' }}
        </v-btn>
      </div>
    </div>
  </v-card>
</template>
<script>
import VuePictureCropper,{ cropper } from 'vue-picture-cropper'
import { uploadProfileImage } from '@/axios/image';
import { globalProperties } from '@/main';
import { getCookie } from '@/utils/cookie';
// eslint-disable-next-line
import { compressImage } from '@/utils/image';
import { getNormalErrorAlert, getNormalSuccessAlert, getNormalWarnAlert } from '@/utils/other';
import { getImageDimensions } from '@/utils/pixel_emoji';
export default {
  setup() {
    const userName = getCookie('userName');
    const userProfileUrl = getCookie('userProfileUrl');
    const themeColor = globalProperties.$themeColor;
    return {
      userName,
      userProfileUrl,
      themeColor,
    }
  },
  components: {
    VuePictureCropper,
  },
  data() {
    return {
      blob: null,
      nowProfileUrl: this.userProfileUrl,
      loading: false,
      ifSelected: false,
      compressing: false,
      cropSize: 0,
      lastcropSize: 0,
      maxCropSize: 0,
      croppedImg:null,
      croppedImgBlob:null,
    }
  },
  methods: {
    selectImage() {
      this.$refs.imgInput.click();
    },
    async handleSelectedImage(event) {//完成选取图片，压缩图片，上传图片的逻辑 
      let file = event.target.files[0];
      this.blob=file;
      this.nowProfileUrl = URL.createObjectURL(file);
      this.loading=true;
      setTimeout(async ()=>{
        await this.update();
        this.loading=false;
      },1500);
    },
    async update(){
      console.log("update");
      let [width,height]=await getImageDimensions(this.blob);
      if(Math.min(width,height)<32){
        this.alert(getNormalWarnAlert("图片尺寸过小，请选择大于32*32的图片"));
        return;
      }
      let containerWidth=window.getComputedStyle(document.getElementById("profile-cropper")).width.slice(0,-2);
      let containerHeight=window.getComputedStyle(document.getElementById("profile-cropper")).height.slice(0,-2);
      console.log(containerWidth,containerHeight);
      let containerAspectRatio=containerWidth/containerHeight;
      let imgRatio=width/height;
      if(imgRatio>containerAspectRatio){
        //容器宽度不足，容器宽度为实际展示的图片宽度  
        containerHeight=height/imgRatio;
      }else{
        containerWidth=width*imgRatio;
      }
      this.maxCropSize=Math.min(containerHeight,containerWidth);
      this.minCropSize=1;
      this.cropSize=(this.minCropSize+this.maxCropSize)/2;
      this.lastcropSize=this.cropSize;
      this.ifSelected=true;
    },
    async submit() {//关闭此窗口的逻辑，点击此按钮开始上传
      this.loading = true;
      await this.preview();
      this.croppedImgBlob=await compressImage(this.croppedImgBlob,10);
      const response = await uploadProfileImage(this.croppedImgBlob);
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
    async crop(){
      if (!cropper) return
      const blob = await cropper.getBlob();
      this.croppedImgBlob = blob;
    },
    async preview(){
      await this.crop();
      if(this.croppedImg){
        URL.revokeObjectURL(this.croppedImg);
      }
      this.croppedImg = URL.createObjectURL(this.croppedImgBlob);
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