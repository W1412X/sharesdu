<template>
    <v-card class="card-container" elevation="1">
        <div class="dev-container">
            <div class="code-container">
                <v-btn style="width: 100%;" prepend-icon="mdi-play" :color="themeColor" @click="preview()" variant="outlined">运行预览</v-btn>
                <v-text-field
                    v-model="previewWidth"
                    label="设置容器宽度(网站实际显示时为700px或者98vw)"
                    variant="outlined"
                    density="compact"
                    style="width: 100%;"
                ></v-text-field>
                <v-textarea
                    ref="input"
                    label="输入你的HTML代码(需要加上SELF-DEFINE-HTML作为开头)"
                    variant="outlined"
                    v-model="htmlContent"
                    :style="{height:'80%',width:'100%'}"
                ></v-textarea>
            </div>
            <div class="code-container" style="border: 1px solid grey;" :style="{'width':previewWidth}">
                <with-link-container ref="html" :init-data="{content:htmlContent}" :type="'post'" :key="previewState"></with-link-container >
            </div>
        </div>
    </v-card>
</template>
<script>
import { selfDefineLocalStorage } from '@/utils/localStorage';
import WithLinkContainer from '../common/WithLinkContainer.vue';
import { globalProperties } from '@/main';

export default {
  name: 'PostHtmlDevCard',
  components:{
    WithLinkContainer,
  },
  setup(){
    const themeColor=globalProperties.$themeColor;
    return {
        themeColor,
    }
  },
  methods: {
    preview(){
        this.previewState+=1;
    }
  },
  data() {
    return {
        htmlContent:"",
        previewWidth:'50%',
        previewState:0,
    }
  },
  mounted(){
    this.htmlContent=selfDefineLocalStorage.getItem("post-html-dev");
    if(!this.htmlContent){
        this.htmlContent="";
    }
  }
}
</script>
<style scoped>
.card-container{
    width: 94%;
    margin-left: 5%;
    height: 100vh;
    padding: 2%;
    margin-right: 1%;
}
.dev-container{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    width: 100%;
}
.code-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 50%;
}
</style>