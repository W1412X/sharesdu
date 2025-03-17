<template>
    <v-dialog v-model="ifShowDialog" class="full-screen dialog">
        <div class="dialog-card-container">
            <v-card v-if="ifShowEditFinishCard" class="edit-finish-card">
                <div class="title-bold row-center">编辑成功</div>
                <div class="text-medium row-center">您的文章已上传，正在审核中...</div>
                <div class="row-center">
                    <v-btn @click="toPage('SelfPage')" variant="outlined" :color="themeColor" class="dialog-bottom-bar-btn" >返回主页</v-btn>
                    <v-btn @click="toPage('ArticlePage',{id:this.articleId})" class="dialog-bottom-bar-btn" :color="themeColor" variant="outlined" >查看文章</v-btn>
                </div>
            </v-card>
        </div>
    </v-dialog>
    <div class="full-center">
        <v-card elevation="0" class="full-card">
            <v-btn @click="shiftEditorType" class="editor-type-btn" variant="tonal">{{ editorBtnText }}</v-btn>
            <sensitive-text-field 
                class="title-input"
                :density="deviceType=='mobile'?'compact':'comfortable'"
                variant="outlined"
                label="编辑文章标题"
                rows="1"
                v-model="editorData.title"
                :error="editorData.title.length>50"
                :error-messages="editorData.title.length>50?'标题长度不能超过50个字符':''"
                :counter="50"
                :counter-value="editorData.title.length"
            ></sensitive-text-field>
            <html-editor 
                ref="htmlEditorRef"
                @alert="alert"
                @set_loading="setLoading"
                :init-data="htmlData"
                v-if="editorType=='html'"
            ></html-editor>
            <md-editor
                ref="mdEditorRef"
                :init-data="mdData"
                @alert="alert"
                @set_loading="setLoading"
                v-if="editorType=='md'"
            ></md-editor>
            <editor-bar ref="editorBarRef" :title="editorData.title" :init-data="editorBarData" @set_loading="setLoading" @alert="alert"></editor-bar>
            <v-btn @click="submit" class="submit-btn" :color="themeColor" variant="outlined">发布文章</v-btn>
        </v-card>
    </div>
</template>
<script>
import { createArticle, editArticle, getArticleDetail } from '@/axios/article';
import { uploadArticleImage } from '@/axios/image';
import EditorBar from '@/components/EditorBar.vue';
import HtmlEditor from '@/components/HtmlEditor.vue';
import MdEditor from '@/components/MdEditor.vue';
import SensitiveTextField from '@/components/SensitiveTextField.vue';
import { globalProperties } from '@/main';
import { addEditorType, arrToString, extractEditorType, getCancelLoadMsg, getContentWithoutEditorType, getLoadMsg, getNormalErrorAlert } from '@/utils/other';
import { computed,ref } from 'vue';
export default {
    name: 'EditorPage',
    setup(){
        const editorType=ref('html');
        const deviceType=globalProperties.$deviceType;
        const themeColor=globalProperties.$themeColor;
        const editorBtnText=computed(()=>{
            return editorType.value=='html'?'使用Markdown':'使用富文本';
        })
        const htmlEditorRef=ref(null);
        const mdEditorRef=ref(null);
        const editorBarRef=ref(null);
        const apiUrl=globalProperties.$apiUrl;
        const ifShowEditFinishCard=ref(false);
        const ifShowDialog=computed(()=>{
            return ifShowEditFinishCard.value;
        })
        const setEditFinishCardState=(state)=>{
            ifShowEditFinishCard.value=state;
        }
        return{
            deviceType,
            editorBtnText,
            editorType,
            themeColor,
            setEditFinishCardState,
            ifShowDialog,
            ifShowEditFinishCard,
            apiUrl,
            editorBarRef,
            mdEditorRef,
            htmlEditorRef
        }
    },
    components:{
        SensitiveTextField,
        HtmlEditor,
        MdEditor,
        EditorBar,

    },
    data(){
        return{
            articleId:"",
            editorData:{
                title:"",
                content:"",
            },
            editorBarData:{
                summary:"",
                type:"",
                tags:"",
                originLink:"",
                coverLink: "",
                sourceUrl:"",
            },
            htmlData:{
                content:"",
            },
            mdData:{
                content:"",
            },
        }
    },
    methods: {
        shiftEditorType(){
            if(this.editorType === 'html'){
                this.editorType = 'md';
                //save the html content
                this.htmlData.content=this.htmlEditorRef.$data.data.content;
            }else{
                this.editorType = 'html';
                //save the md content
                this.mdData.content=this.mdEditorRef.$data.data.content;
            }
        },
        async submit(){
            try{
                /**
                 * upload article image
                 */
                let imageDict=null;
                if(this.editorType=="html"){
                    imageDict=this.htmlEditorRef.imageDict;
                }else if(this.editorType=="md"){
                    imageDict=this.mdEditorRef.$data.imageDict;
                }
                console.log(imageDict);
                let uploadState=true;
                let oriLocalUrls=JSON.parse(JSON.stringify(Object.keys(imageDict)));
                let validLocalUrls=[];
                for(let i=0;i<oriLocalUrls.length;i++){
                    if(this.editorType=="html"&&this.htmlEditorRef.$data.data.content.includes(oriLocalUrls[i])){
                        validLocalUrls.push(oriLocalUrls[i]);
                    }
                    if(this.editorType=="md"&&this.mdEditorRef.$data.data.content.includes(oriLocalUrls[i])){
                        validLocalUrls.push(oriLocalUrls[i]);
                    }
                }
                console.log(validLocalUrls);
                this.setLoading(getLoadMsg("正在上传图片 0/"+String(validLocalUrls.length)));
                for(let i=0;i<validLocalUrls.length;i++){
                    this.setLoading(getLoadMsg("正在上传图片 "+(i+1)+"/"+String(validLocalUrls.length)));
                    let response=await uploadArticleImage(imageDict[validLocalUrls[i]]);
                    console.log(imageDict[validLocalUrls[i]]);
                    if(response.status==200||response.status==201){
                        if(this.editorType=="md"){
                            this.mdEditorRef.$data.data.content=this.mdEditorRef.$data.data.content.replaceAll(validLocalUrls[i],this.apiUrl+response.data.image_url);
                        }else{
                            this.htmlEditorRef.$data.data.content=this.htmlEditorRef.$data.data.content.replaceAll(validLocalUrls[i],this.apiUrl+response.data.image_url);
                        }
                    }else{
                        uploadState=false;
                        break;
                    }
                }
                this.setLoading(getCancelLoadMsg());
                if(uploadState){
                    try{
                        //clear the img  
                        for(let i=0;i<oriLocalUrls.length;i++){
                            URL.revokeObjectURL(oriLocalUrls[i]);
                        }
                    }catch(e){
                        console.log(e);
                    }
                }else{
                    this.alert(getNormalErrorAlert("文章图片上传失败"));
                    return;
                }
                /**
                 * upload cover image
                 * if not choose , then don't upload
                 */
                if(this.editorBarRef.$data.tmpCoverImage){
                    let coverImage=this.editorBarRef.$data.tmpCoverImage;
                    console.log(coverImage);
                    this.setLoading(getLoadMsg("封面图片上传中..."));
                    let response=await uploadArticleImage(coverImage);
                    this.setLoading(getCancelLoadMsg());
                    if(response.status!=200&&response.status!=201){
                        this.alert(getNormalErrorAlert("封面图片上传失败"));
                        return;
                    }
                    this.editorBarRef.$data.data.coverLink=this.apiUrl+response.data.image_url;
                    //clear resource  
                    URL.revokeObjectURL(this.editorBarRef.$data.data.coverLink);
                }
                /**
                 * wait to do,upload file
                 */
                /**
                 * get the bar data and post  
                 */
                this.setLoading(getLoadMsg("正在创建文章..."));
                let form={};
                form.article_title=this.editorData.title;
                if(this.editorType=='md'){
                    form.content=addEditorType(this.mdData.content,"md");
                }else{
                    form.content=addEditorType(this.htmlData.content,"html");
                }
                form.tags=arrToString(this.editorBarRef.$data.data.tags);
                form.article_summary=this.editorBarRef.$data.data.summary;
                form.article_type=this.editorBarRef.$data.data.type=="原创"?"original":"repost";
                form.origin_link=this.editorBarRef.$data.data.originLink;
                form.cover_link=this.editorBarRef.$data.data.coverLink;
                form.source_url=this.editorBarRef.$data.data.sourceUrl;
                //try to get the route id 
                if(this.$route.params.id){
                    //edit mode  
                    form.article_id=this.$route.params.id;
                    let response=await editArticle(form);
                    if(response.status==200){
                        this.alert({
                            state:true,
                            color:'success',
                            title:'创建成功',
                            content:response.message,
                        })
                        this.setEditFinishCardState(true);
                    }else{
                        this.alert(getNormalErrorAlert(response.message));
                    }
                }else{
                    //create mode
                    let response=await createArticle(form);
                    if(response.status==200){
                        this.articleId=response.article_id;
                        this.alert({
                            state:true,
                            color:'success',
                            title:'创建成功',
                            content:response.message,
                        })
                        this.setEditFinishCardState(true);
                    }else{
                        this.alert(getNormalErrorAlert(response.message));
                    }
                }
                this.setLoading(getCancelLoadMsg());
            }catch(e){
                this.setLoading(getCancelLoadMsg());
                this.alert(getNormalErrorAlert("未知错误，请查看控制台"));
                console.log(e);
            }
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        toPage(pageName,params=null){
            this.$router.push({
                name:pageName,
                params:params
            })
        }
    },
    async mounted() {
        /**
         * check if with id
         * if yes, get the data and set the data,which means editing 
         * else do nothing
         */
        this.articleId=this.$route.params.id;
        this.setLoading(getLoadMsg("正在加载文章信息..."))
         if(this.$route.params.id){
            //try to get the detail of the article
            let response=await getArticleDetail(this.$route.params.id);
            if(response.status==200){
                try{
                    let article=response.article_detail;
                    this.editorType=extractEditorType(article.article_content);
                    this.editorData.content=getContentWithoutEditorType(article.article_content);
                    console.log(this.editorData.content);
                    if(this.editorType=="html"){
                        this.htmlData.content=this.editorData.content;
                    }else{
                        this.mdData.content=this.editorData.content;
                    }
                    this.editorData.title=article.article_title;
                    //editor bar data
                    this.editorBarData.summary=article.article_summary;
                    this.editorBarData.type=article.article_type;
                    this.editorBarData.tags=article.article_tags;
                    this.editorBarData.originLink=article.origin_link;
                    this.editorBarData.coverLink=article.cover_link;
                    this.editorBarData.sourceUrl=article.source_url;
                }catch(e){
                    this.alert(getNormalErrorAlert("表单格式化错误"));
                }
            }else{
                this.alert(getNormalErrorAlert(response.message));
                this.$router.push({name:"ErrorPage",params:{
                    reason:"无法找到该文章"
                }});
            }
        }else{
            this.alert({
                state:true,
                color:"info",
                title:"加载成功",
                content:"已加载编辑器"
            })
        }
        this.setLoading(getCancelLoadMsg());
    }
}
</script>
<style scoped>
.dialog-card-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
.row-center{
    display: flex;
    justify-content: center;
    width: 100%;
}
.dialog-bottom-bar-btn{
    height: 35px;
    margin: 10px;
}
@media screen and (min-width: 600px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
    .edit-finish-card{
        display: flex;
        width: 300px;
        flex-direction: column;
        padding:10px;
    }
    .full-card{
        padding:5px;
        width:1000px;
        height:100%;
        border: grey 1px solid;
        overflow-y: scroll;
    }
    .title-input{
        margin-top: 10px;
    }
    .editor-type-btn{
        width: 100%;
    }
    .submit-btn{
        width: 98%;
        margin: 5px;
    }
}

@media screen and (max-width: 600px) {
    .full-center {
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
    }
    .full-card{
        padding:0.5vw;
        width:100vw;
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
    }
    .edit-finish-card{
        display: flex;
        width: 80vw;
        flex-direction: column;
        padding:10px;
    }
    .title-input{
        margin-top: 1vw;
    }
    .editor-type-btn{
        width: 100%;
        height: 30px;
    }
    .submit-btn{
        height: 30px;
        margin: 5px;
    }
}
</style>