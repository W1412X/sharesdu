<template>
    <v-card
      color="rgba(0,0,0,0.3)"
      @click="download"
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
        return {
            themeColor,
        }
    },
    components: {
    },
    data() {
        return {
            downloadState:false,
        }
    },
    methods: {
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
    },
}
</script>
<style scoped>
.card{
    width:100%;
    padding:5px;
    margin:5px;
}
@media screen and (min-width: 1000px) {
    
}

@media screen and (max-width: 1000px) {
}
</style>