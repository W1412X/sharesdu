<!-- old one -->
<template>

  <input type="file" ref="imgInput" style="display: none;" @change="handleSelectedImage" />
  <v-card  class="card" variant="outlined">
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
import { compressImage } from '@/utils/image';
import { getCancelLoadMsg, getLoadMsg } from '@/utils/other';
export default {
  props: {
    userName: {
      type: String,
      default: 'visitor'
    }
  },
  data() {
    const nowProfileUrl = ''
    return {
      nowProfileUrl,
      blob: null
    }
  },
  methods: {
    selectImage() {
      this.$refs.imgInput.click();
    },
    async handleSelectedImage(event) {//完成选取图片，压缩图片，上传图片的逻辑 
      let file = event.target.files[0];
      //压缩图片  
      this.blob = await compressImage(file, 64);
      this.nowProfileUrl = URL.createObjectURL(this.blob);
      console.log(this.nowProfileUrl);
      const message = {
        color: 'info',
        title: '图片预览',
        state: true,
        content: '由于服务器资源限制，头像将会被压缩至128*128'
      }
      this.$emit('alert', message);
    },
    async submit() {//关闭此窗口的逻辑，点击此按钮开始上传
      this.setLoading(getLoadMsg("正在上传头像",-1));
      const response=await uploadProfileImage(this.blob);
      if(response.status==200){
        this.alert({color:'success',state:true,title:'上传成功',content:"成功修改头像"});
        this.close();
      }else{
        this.alert({color:'error',state:true,title:'上传失败',content:response.message});
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