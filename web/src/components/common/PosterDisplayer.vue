<template>
    <div style="width: 100vw;height: 100vh;display: grid;align-content: center;justify-items: center;">
        <div>
            <img :src="this.imageUrl" class="img-big">
            <div style="display: flex;flex-direction: row;margin: 10px;width:100%;justify-content: center;align-items: center;">
                <v-btn style="margin-bottom: 10px;margin-right: 50px;" icon
                @click="close">
                <v-icon :color="themeColor" :size="28" :icon="'mdi-close'"></v-icon>
                <v-tooltip activator="parent">关闭</v-tooltip>
                </v-btn>
                <v-btn style="margin-bottom: 10px;" icon
                @click="save">
                <v-icon :color="themeColor" :size="28" :icon="'mdi-content-save-outline'"></v-icon>
                <v-tooltip activator="parent">保存海报到本地</v-tooltip>
            </v-btn>
            </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';

export default {
    props: {
        imageUrl:{
            type:String,
            default:""
        }
    },
    setup() {
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    components: {
    },
    data() {
        return {
        }
    },
    methods: {
        close(){
            this.$emit("close");
        },
        save(){
            const a = document.createElement('a');
            a.href = this.imageUrl;
            a.download = "SHARESDU课程分享海报.png"; // 设置下载的文件名
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.close();
        }
    },
    async mounted() {
    },
}
</script>
<style scoped>
  .img-big{
    max-width: 80vw;
    max-height: 80vh;
  }
</style>