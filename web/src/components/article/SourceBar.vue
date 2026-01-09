<template>
    <v-dialog v-model="ifShowDialog" style="width: 100%;height:100%;justify-content: center;">
      <div v-if="ifShowDialog" style="width: 100%;height:100%;justify-content: center;display: flex">
        <v-card class="dialog-card">
            <span class="title-bold">提示</span>
            <span class="text-small">在app中下载功能暂时无法生效，可以复制链接后在浏览器中访问进行下载</span>
            <div class="dialog-bottom-btn-bar">
                <v-spacer></v-spacer>
                <v-btn @click="download" :color="themeColor" density="compact" variant="outlined">继续下载</v-btn>
                <v-btn @click="copyArticleLink" :color="themeColor" style="margin-left: 10px;" density="compact" variant="outlined">复制文章链接</v-btn>
            </div>
        </v-card>
      </div>
    </v-dialog>
    <v-card
      color="rgba(0,0,0,0.3)"
      @click="showDownloadDialog"
      style="padding: 5px;margin:5px"
      variant="outlined"
    >
      <div style="display: flex; flex-direction: row">
        <v-icon icon="mdi-paperclip" size="20" :color="themeColor"></v-icon>
        <span class="text-small-bold" style="color: #8a8a8a;margin-left:10px;" :style="{color:themeColor}"
          >{{ '资源 : '+articleTitle }}</span
        >
      </div>
    </v-card>
</template>
<script>
import { downloadResource } from '@/api/modules/resource';
import { globalProperties } from '@/main';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';

export default {
    props: {
        articleId:{
            type:String,
            default:null,
        },
        articleTitle:{
            type:String,
            default:null,
        }
    },
    setup(){
        const themeColor=globalProperties.$themeColor;
        const deviceType=globalProperties.$deviceType;
        return {
            themeColor,
            deviceType,
        }
    },
    components: {
    },
    data() {
        return {
            downloadState:false,
            ifShowDialog:false,
        }
    },
    methods: {
        showDownloadDialog() {
            if(this.deviceType==='mobile'){
                this.ifShowDialog = true;
            }else{
                this.download();
            }

        },
        async download() {
            this.setLoading(getLoadMsg("正在下载..."));
            let response=await downloadResource(this.articleId,this.articleTitle,this.setLoading);
            this.setLoading(getCancelLoadMsg());
            if(response.status==200){
                this.alert(getNormalSuccessAlert("下载成功"))
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        setLoading(msg) {
            this.$emit("set_loading", msg);
        },

        alert(msg) {
            this.$emit("alert", msg);
        },
        copyArticleLink() {
            navigator.clipboard.writeText("https://sharesdu.com/#/article/"+this.articleId);
            this.alert(getNormalSuccessAlert("复制成功"));
        },
    },
}
</script>
<style scoped>
.card{
    width:100%;
    padding:5px;
    margin:5px;
}
.dialog-bottom-btn-bar{
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 20px;
}
.dialog-card{
    padding: 20px;
    display: flex;
    flex-direction: column;
}
@media screen and (min-width: 1000px) {
    
}

@media screen and (max-width: 1000px) {
}
</style>