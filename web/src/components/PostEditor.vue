<!-- question editor -->
<template>
    <v-card class="card">
        <div class="content-div">
            <div class="title-bold">编辑帖子</div>
            <sensitive-text-field class="title-input"  v-model="data.title" label="编辑帖子标题"
                density="compact" rows="1" variant="outlined"></sensitive-text-field>
            <div class="row-div">
                <sensitive-text-area v-model="data.content" variant="outlined" rows="3" label="编辑帖子详述"></sensitive-text-area>
                <emoji-picker @emoji="addEmoji"></emoji-picker>
            </div>
            <div class="row-div-scroll">
                <img-card :editable="true" @delete_img="removeImage" v-for="(src,index) in imgSrcList" :key="index" :src="src" :width="100" :height="100">
                </img-card>
            </div>
            <v-btn :loading="loading" :disabled="loading" @click="triggerFileInput" variant="text" :color="themeColor" prepend-icon="mdi-plus" text="添加图片"></v-btn>
            <div class="bottom-btn-div">
                <v-btn :loading="loading" :disabled="loading" @click="submit" variant="text" class="btn" density="compact">发布</v-btn>
                <v-btn variant="text" class="btn" density="compact" @click="close">取消</v-btn>
            </div>
        </div>
    </v-card>
</template>
<script>
import { addLinkToPost, getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import SensitiveTextArea from './SensitiveTextArea.vue';
import SensitiveTextField from './SensitiveTextField.vue';
import { createPostInArticle, createPostInCourse } from '@/axios/post';
import { getNetworkErrorResponse } from '@/axios/statusCodeMessages';
import { getCookie } from '@/utils/cookie';
import EmojiPicker from './EmojiPicker.vue';
import { globalProperties } from '@/main';
import ImgCard from './ImgCard.vue';
import { uploadArticleImage } from '@/axios/image';
export default {
    name: 'PostEditor',
    props:{
        initData:{
            type: Object,
            default: () => {
                return {
                    id:'',
                    title: '',
                    content:'',
                }
            }
        },
        typeMsg:{
            type:Object,
            default: () => {
                return {
                    type:'post',//article course post
                    id:null,
                }
            }
        }
    },
    setup() {
        const themeColor=globalProperties.$themeColor;
        const apiUrl=globalProperties.$apiUrl;
        return {
            themeColor,
            apiUrl,
        }
    },
    components: {
        SensitiveTextField,
        SensitiveTextArea,
        EmojiPicker,
        ImgCard,
    },
    data() {
        /**
         * post data (editable)
         */
        const data=this.initData;
        return {
            imgDict:{},
            imgSrcList:[],
            data,
            loading:false,
        }
    },
    methods: {
        triggerFileInput() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.addEventListener('change', this.handleFileChange);
            input.click();
        },
        handleFileChange(event) {
            const files = Array.from(event.target.files);
            for(let i=0;i<files.length;i++){
                let tmp=URL.createObjectURL(files[i]);
                this.imgSrcList.push(tmp);
                this.imgDict[tmp]=files[i];
            }
        },
        removeImage(src){
            this.imgSrcList.splice(this.imgSrcList.indexOf(src),1);
            URL.revokeObjectURL(src);
        },
        addEmoji(emoji){
            this.data.content+=emoji;
        },
        close() {
            /**
             * close editor
             */
            this.$emit('close');
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        async submit(){
            /**
             * submit img first  
             */
            if(!this.data.title||this.data.title.length<=2){
                this.alert(getNormalErrorAlert('标题过短'));
            }
            if(!this.data.content||this.data.content.length<=2){
                this.alert(getNormalErrorAlert('内容过短'));
            }
            this.loading=true;
            let imgNum=this.imgSrcList.length;
            for(let i=0;i<imgNum;i++){
                this.loading=true;
                let img=this.imgSrcList[i];
                let file=this.imgDict[img];
                let response=await uploadArticleImage(file);
                if(response.status!=200&&response.status!=201){
                    this.alert(getNormalErrorAlert("图片上传失败"));
                    return;
                }
                this.data.content+=`[${this.apiUrl+response.data.image_url}]`;
            }
            /** 
             * submit post data
             */
            this.loading=true;
            let response=getNetworkErrorResponse();
            if(this.typeMsg.type=="article"){
                response=await createPostInArticle(this.typeMsg.id,this.data.title,addLinkToPost(this.data.content,this.typeMsg.type,this.typeMsg.id));
            }else if(this.typeMsg.type=="course"){
                response=await createPostInCourse(this.typeMsg.id,this.data.title,addLinkToPost(this.data.content,this.typeMsg.type,this.typeMsg.id));
            }else{
                //test
                response=await createPostInArticle(20,this.data.title,this.data.content);
            }
            if(response.status==200||response.status==201){
                this.alert(getNormalSuccessAlert("帖子创建成功"));
                let tmp={
                    id: response.post_id,
                    title: this.data.title,
                    content: this.data.content,
                    viewNum: 0,
                    replyNum: 0,
                    likeNum:0,
                    authorName: getCookie("userName"),
                    authorId: getCookie("userId"),
                }
                this.$emit("add_post",tmp)
                this.close();
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
            this.loading=false;
        }
    }
}
</script>
<style scoped>
.row-div-scroll{
    display: flex;
    overflow-x: scroll;
    flex-direction: row;
    align-items: center;
}
.row-div{
    display: flex;
    flex-direction: row;
    align-items: center;
}
@media screen and (min-width: 1000px) {
    .card {
        width: 750px;
        border-width: 2px;
        border-color: #8a8a8a;
        padding: 10px;
    }

    .content-div {
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    .bottom-btn-div {
        display: flex;
        flex-direction: row-reverse;
    }

    .btn {
        margin: 5px;
    }

    .item-div {
        display: flex;
        flex-direction: column;
    }
    .title-input{
        width: 100%;
        margin-top: 10px;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        width: 400px;
        border-width: 2px;
        border-color: #8a8a8a;
        padding: 10px;
    }

    .content-div {
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    .bottom-btn-div {
        display: flex;
        flex-direction: row-reverse;
    }

    .btn {
        margin: 5px;
    }

    .item-div {
        display: flex;
        flex-direction: column;
    }
    .title-input{
        width: 100%;
        margin-top: 10px;
    }
}
</style>