<!-- question editor -->
<template>
    <v-card class="card">
        <!-- 普通帖子编辑模式 -->
        <div v-if="mode === 'normal'" class="content-div">
            <div class="title-bold">编辑帖子</div>
            <sensitive-text-field class="title-input" v-model="data.title" label="编辑帖子标题"
                density="compact" rows="1" variant="outlined"></sensitive-text-field>
            <div class="row-div">
                <sensitive-text-area v-model="data.content" variant="outlined" rows="3" label="编辑帖子详述"></sensitive-text-area>
            </div>
            <v-btn :loading="loading" :disabled="loading" @click="triggerFileInput" variant="text" :color="themeColor" prepend-icon="mdi-plus" text="添加图片"></v-btn>
            <div class="row-div-scroll">
                <img-card :editable="true" @delete_img="removeImage" v-for="(src,index) in imgSrcList" :key="index" :src="src" :width="100" :height="100">
                </img-card>
            </div>
            <div class="bottom-controls">
                <v-btn @click="switchToHtmlMode" variant="text" :color="themeColor" prepend-icon="mdi-code-tags" size="small" class="switch-mode-btn">
                    编辑HTML帖子
                </v-btn>
                <div class="bottom-btn-div">
                    <v-btn :loading="loading" :disabled="loading" @click="submitNormal" variant="text" class="btn">发布</v-btn>
                    <v-btn variant="text" class="btn" @click="close">取消</v-btn>
                </div>
            </div>
        </div>

        <!-- HTML 帖子编辑模式 -->
        <div v-else-if="mode === 'html'" class="content-div">
            <div class="title-bold">编辑HTML帖子</div>
            <sensitive-text-field 
                class="title-input" 
                v-model="data.title" 
                label="编辑帖子标题"
                density="compact" 
                rows="1" 
                variant="outlined">
            </sensitive-text-field>
            <sensitive-text-area 
                v-model="htmlContent" 
                variant="outlined" 
                rows="10" 
                label="输入HTML代码"
                class="html-content-input">
            </sensitive-text-area>
            <div class="html-tip text-small">
                <v-icon size="16" color="info">mdi-information</v-icon>
                <span>提示：PC端最佳宽度700px，移动端最佳宽度98vw。样式过宽会采用滚动条，过窄会靠左对齐。</span>
            </div>
            <div class="bottom-btn-div">
                <v-btn @click="switchToNormalMode" variant="outlined" class="btn" prepend-icon="mdi-arrow-left">
                    返回
                </v-btn>
                <v-btn @click="previewHtml" variant="outlined" :color="themeColor" class="btn" prepend-icon="mdi-eye">
                    预览
                </v-btn>
                <v-btn :loading="loading" :disabled="loading" @click="submitHtml" variant="flat" :color="themeColor" class="btn" prepend-icon="mdi-publish">
                    发布
                </v-btn>
            </div>
        </div>
    </v-card>

    <!-- 预览对话框 -->
    <v-dialog v-model="showPreview" max-width="800" scrollable>
        <div class="preview-dialog-container">
            <div class="preview-dialog-header">
                <span class="title-bold">预览效果</span>
                <v-btn variant="text" icon="mdi-close" class="preview-close-btn" @click="showPreview = false" aria-label="关闭">
                    <v-icon size="20">mdi-close</v-icon>
                </v-btn>
            </div>
            <div class="preview-dialog-content">
                <post-item :clickable="false" :init-data="previewData"></post-item>
            </div>
        </div>
    </v-dialog>
</template>
<script>
import { addLinkToPost, getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import { createPostInArticle, createPostInCourse } from '@/api/modules/post';
import { getNetworkErrorResponse } from '@/api/modules/statusCodeMessages';
import { getCookie } from '@/utils/cookie';
import { globalProperties } from '@/main';
import ImgCard from '@/components/common/ImgCard.vue';
import { uploadArticleImage } from '@/api/modules/image';
import { compressImage } from '@/utils/imageUtils';
import PostItem from '@/components/post/PostItem/index.vue';

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
        ImgCard,
        PostItem,
    },
    data() {
        /**
         * post data (editable)
         */
        const data = { ...this.initData };
        // 检测是否为 HTML 帖子
        const isHtmlPost = data.content && data.content.startsWith('SELF-DEFINE-HTML');
        const initialMode = isHtmlPost ? 'html' : 'normal';
        const htmlContent = isHtmlPost ? data.content.substring(16) : '';
        
        return {
            imgDict:{},
            imgSrcList:[],
            data,
            loading:false,
            mode: initialMode, // 'normal' or 'html'
            htmlContent: htmlContent,
            showPreview: false,
        }
    },
    computed: {
        previewData() {
            return {
                id: this.data.id || 'preview',
                title: this.data.title || '预览标题',
                content: 'SELF-DEFINE-HTML' + this.htmlContent,
                viewNum: 0,
                replyNum: 0,
                likeNum: 0,
                authorName: getCookie("userName") || '预览用户',
                authorId: getCookie("userId") || 'preview',
                imgList: [],
                publishTime: '刚刚',
                ifTop: false,
            };
        }
    },
    methods: {
        switchToHtmlMode() {
            // 如果当前内容不是 HTML 帖子，且 htmlContent 为空，则清空
            if (!this.data.content.startsWith('SELF-DEFINE-HTML') && !this.htmlContent) {
                this.htmlContent = '';
            }
            this.mode = 'html';
        },
        switchToNormalMode() {
            this.mode = 'normal';
        },
        previewHtml() {
            if (!this.data.title || this.data.title.trim().length === 0) {
                this.alert(getNormalErrorAlert('请输入标题'));
                return;
            }
            if (!this.htmlContent || this.htmlContent.trim().length === 0) {
                this.alert(getNormalErrorAlert('请输入HTML内容'));
                return;
            }
            this.showPreview = true;
        },
        triggerFileInput() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.addEventListener('change', this.handleFileChange);
            input.click();
        },
        async handleFileChange(event) {
            const files = Array.from(event.target.files);
            for(let i=0;i<files.length;i++){
                try {
                    files[i] = await compressImage(files[i],1024*4);
                } catch (error) {
                    console.error(`Failed to compress image ${i}:`, error);
                    // 如果压缩失败，使用原始文件
                }
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
        async submitNormal(){
            /**
             * submit normal post
             */
            if(!this.data.title||this.data.title.length<=2){
                this.alert(getNormalErrorAlert('标题过短'));
                return;
            }
            if(!this.data.content||this.data.content.length<=2){
                this.alert(getNormalErrorAlert('内容过短'));
                return;
            }
            this.loading=true;
            let imgNum=this.imgSrcList.length;
            for(let i=0;i<imgNum;i++){
                this.loading=true;
                let img=this.imgSrcList[i];
                let file=this.imgDict[img];
                try {
                    file = await compressImage(file,4*1024);
                } catch (error) {
                    console.error(`Failed to compress image ${i} before upload:`, error);
                    // 如果压缩失败，使用原始文件继续上传
                }
                let response=await uploadArticleImage(file);
                if(response.status!=200&&response.status!=201){
                    this.alert(getNormalErrorAlert(response.message));
                    this.loading=false;
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
                response=await createPostInArticle(20,this.data.title,this.data.content);
            }
            if(response.status==200||response.status==201){
                this.alert(getNormalSuccessAlert("帖子创建成功"));
                let tmp={
                    id: response.post_id,
                    title: this.data.title,
                    content: this.typeMsg?addLinkToPost(this.data.content,this.typeMsg.type,this.typeMsg.id):this.data.content,
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
        },
        async submitHtml(){
            /**
             * submit html post
             */
            if(!this.data.title||this.data.title.length<=2){
                this.alert(getNormalErrorAlert('标题过短'));
                return;
            }
            if(!this.htmlContent||this.htmlContent.trim().length===0){
                this.alert(getNormalErrorAlert('HTML内容不能为空'));
                return;
            }
            this.loading=true;
            
            // 自动添加 SELF-DEFINE-HTML 前缀
            const htmlPostContent = 'SELF-DEFINE-HTML' + this.htmlContent;
            
            /** 
             * submit post data
             */
            let response=getNetworkErrorResponse();
            if(this.typeMsg.type=="article"){
                response=await createPostInArticle(this.typeMsg.id,this.data.title,addLinkToPost(htmlPostContent,this.typeMsg.type,this.typeMsg.id));
            }else if(this.typeMsg.type=="course"){
                response=await createPostInCourse(this.typeMsg.id,this.data.title,addLinkToPost(htmlPostContent,this.typeMsg.type,this.typeMsg.id));
            }else{
                response=await createPostInArticle(20,this.data.title,htmlPostContent);
            }
            if(response.status==200||response.status==201){
                this.alert(getNormalSuccessAlert("帖子创建成功"));
                let tmp={
                    id: response.post_id,
                    title: this.data.title,
                    content: this.typeMsg?addLinkToPost(htmlPostContent,this.typeMsg.type,this.typeMsg.id):htmlPostContent,
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
    overflow-x: auto;
    flex-direction: row;
    align-items: center;
}
.row-div{
    display: flex;
    flex-direction: row;
    align-items: center;
}

.bottom-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.switch-mode-btn {
    align-self: flex-start;
    margin-top: 8px;
}

.html-content-input {
    margin-top: 10px;
}

.html-tip {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 8px;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 4px;
    color: #666;
}

/* 预览对话框样式 */
.preview-dialog-container {
    background-color: white;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-height: 90vh;
    height: 90vh;
}

.preview-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e0e0e0;
    flex-shrink: 0;
}

.preview-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    transition: color 0.2s;
    min-width: 32px;
    min-height: 32px;
}

.preview-close-btn:hover {
    color: #333;
}

.preview-close-btn span {
    font-size: 24px;
    line-height: 1;
    font-weight: normal;
}

.preview-dialog-content {
    padding: 20px;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    min-height: 0;
    -webkit-overflow-scrolling: touch;
}

/* 确保 PostItem 在预览对话框中正确显示 */
.preview-dialog-content :deep(.card) {
    width: 100%;
    max-width: 100%;
    margin: 0;
}

@media screen and (max-width: 1000px) {
    .preview-dialog-container {
        max-height: 95vh;
        height: 95vh;
    }
    
    .preview-dialog-header {
        padding: 12px 16px;
    }
    
    .preview-dialog-content {
        padding: 16px;
    }
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
        gap: 8px;
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
        gap: 8px;
        flex-wrap: wrap;
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
