<template>
    <v-dialog v-model="ifShowDialog" style="width: 100%;height:100%;justify-content: center;">
      <div v-if="ifShowTagInput" style="width: 100%;height:100%;justify-content: center;display: flex">
        <v-card class="dialog-card">
            <div class="title-bold">
                添加标签
            </div>
            <v-autocomplete
                v-model="inputingTag"
                label="输入标签"
                :items="this.recommendTags"
                density="compact"
                variant="outlined"
            ></v-autocomplete>
            <div class="dialog-bottom-btn-bar">
                <v-btn @click="addTag" variant="text">添加</v-btn>
                <v-btn @click="setTagInputState(false)" variant="text">取消</v-btn>
            </div>
        </v-card>
      </div>
    </v-dialog>
    <v-card class="card">
        <div class="column-div">
            <div class="row-div">
                <div class="before-container">
                    <span class="before-text">文章标签:</span>
                    <v-tooltip activator="parent" class="tool-tip" location="top">添加标签方便检索以使你的文章更容易被精确搜索</v-tooltip>
                    <v-icon type="mdi" icon="mdi-help-circle-outline" color="#8a8a8a" size="16"
                        class="before-icon"></v-icon>
                </div>
                <div class="tags-container">
                    <!--add btn-->
                    <v-btn :color="themeColor" @click="setTagInputState(true)" variant="tonal" class="add-tag-btn">
                        +
                    </v-btn>
                    <!--delete btn-->
                    <v-btn v-for="(tag, index) in this.data.tags" :key="index" :color="themeColor" :text="tag" variant="tonal"
                        class="tag-btn">{{ tag }}
                        <v-spacer></v-spacer>
                        <v-btn @click="deleteTag(tag)" size="15" variant="tonal" class="delete-tag-btn">
                            ✕
                        </v-btn>
                    </v-btn>
                </div>
            </div>
            <div class="row-div">
                <div class="before-container">
                    <span class="before-text">文章封面:</span>
                    <v-tooltip class="tool-tip" activator="parent" location="top">添加封面图使你的文章更具吸引力</v-tooltip>
                    <v-icon type="mdi" icon="mdi-help-circle-outline" color="#8a8a8a" size="16"
                        class="before-icon"></v-icon>
                </div>
                <div @click="selectImage()" >
                    <img-card :width="160" :clickable="false" :height="160" :src="data.coverLink"></img-card>
                </div>
            </div>
            <div class="row-div">
                <div class="before-container">
                    <span class="before-text">文章摘要:</span>
                    <v-tooltip class="tool-tip" activator="parent" location="top">添加文章摘要为你的文章添加简介</v-tooltip>
                    <v-icon type="mdi" icon="mdi-help-circle-outline" color="#8a8a8a" size="16"
                        class="before-icon"></v-icon>
                </div>
                <div>
                    <sensitive-text-area class="detail-input" label="添加不多于200字的简介" variant="outlined"
                        v-model="data.summary"></sensitive-text-area>
                </div>
            </div>
            <div class="row-div">
                <div class="before-container">
                    <span class="before-text">文章类型:</span>
                    <v-tooltip class="tool-tip" activator="parent" location="top">创作类型声明，会展示在文章头部等明显位置<br />•
                        原创：平台鼓励和保护原创内容<br />•
                        转载：转载请确认原文允许转载，或者您已经获得原文作者授权</v-tooltip>
                    <v-icon type="mdi" icon="mdi-help-circle-outline" color="#8a8a8a" size="16"
                        class="before-icon"></v-icon>
                </div>

                <div>
                    <div style="display: flex">
                        <div style="margin-bottom: 10px;">
                            <v-btn variant="tonal" :color="data.type == '原创' ? themeColor : '#8a8a8a'"
                                :style="{ 'margin': '5px', 'width': '20px', 'height': '25px' }" @click="data.type = '原创'">
                                原创
                            </v-btn>
                            <v-btn variant="tonal" :color="data.type == '转载' ? themeColor : '#8a8a8a'"
                                :style="{ 'margin': '5px', 'width': '20px', 'height': '25px' }" @click="data.type = '转载'">
                                转载
                            </v-btn>

                        </div>
                    </div>
                    <sensitive-text-area density="compact" v-if="data.type == '转载'" v-model="data.originLink" label="转载文章url"
                        row-height="10" rows="1" variant="outlined" auto-grow></sensitive-text-area>
                </div>
            </div>
            <div class="row-div">
                <div class="before-container">
                    <span class="before-text">上传资源:</span>
                    <v-tooltip activator="parent" class="tool-tip" location="top">上传你的文章的绑定资源
                        <br />上传的资源不得超过100MB<br />上传的资源类型仅能为压缩包,PDF,WORD以及PPT</v-tooltip>
                    <v-icon type="mdi" icon="mdi-help-circle-outline" color="#8a8a8a" size="16"
                        class="before-icon"></v-icon>
                </div>
                <div class="before-container">
                    <v-file-input v-model="this.file" @change="handleFileChange" width="250px" density="compact"
                        label="File input"></v-file-input>
                </div>
            </div>
        </div>
    </v-card>
</template>
<script>
/**
 * this component doesn't involved any network request
 */
import SensitiveTextArea from './SensitiveTextArea.vue';
import { globalProperties } from '@/main';
import { computed, ref } from 'vue';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert } from '@/utils/other';
import { uploadArticleImage } from '@/axios/image';
import { extractTags } from '@/utils/keyword';
import ImgCard from './ImgCard.vue';
export default {
    name: 'EditorBar',
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    summary: "",
                    type: "",
                    tags: [],//[]/""
                    originLink: "",
                    coverLink:"",
                    sourceUrl:"",
                }
            },
        },
        title:{
            type: String,
            default: "",
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const inputingTag=ref("");
        const ifShowTagInput=ref(false);
        const ifShowDialog=computed(()=>{
            return ifShowTagInput.value;
        })
        const setTagInputState=(state)=>{
            ifShowTagInput.value=state;
        }
        return {
            themeColor,
            inputingTag,
            ifShowDialog,
            ifShowTagInput,
            setTagInputState
        }
    },
    components: {
        SensitiveTextArea,
        ImgCard,
    },
    data() {
        var data=this.initData;
        const file=null;
        const recommendTags=computed(()=>{
            return extractTags(this.title);
        })
        return{
            data,
            file,
            tmpCoverImage:null,
            recommendTags,
        }
    },
    methods: {
        async selectImage() {
            let input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg, image/png, image/gif';
            input.onchange = async (event) => {
                if(!this.data.coverLink){
                    //release it
                    URL.revokeObjectURL(this.data.coverLink);
                }
                let image = event.target.files[0];
                this.data.coverLink = URL.createObjectURL(image);
                this.tmpCoverImage=image;
            };
            input.click();
        },
        handleFileChange(event) {
            /**
             * only select file, upload the file in editor page
             */
            // temporarily disable uploading resources
            // eslint-disable-next-line
            const selectedFile = event.target.files[0]
            if (!selectedFile) {
                this.$emit('alert', { state: true, color: 'warning', title: '为选择文件', content: '如果需要上传相关资源，请重新上传' })
                return
            }
            const allowTypes = [
                'application/zip',
                'application/pdf',
                'application/msword',
                'application/vnd.ms-powerpoint'
            ]
            if (!allowTypes.includes(selectedFile.type)) {
                this.$emit('alert', { state: true, color: 'warning', title: '不支持此文件类型', content: '目前仅支持上传pdf,word,ppt以及压缩包类型的文件' })
                this.file = null
                return
            }
            const maxSize = 100 * 1024 * 1024 // max 100MB
            if (selectedFile.size > maxSize) {
                this.$emit('alert', { state: true, color: 'warning', title: '文件大小超过限制', content: '一次最多可以上传一个不多于100m的文件' })
                this.file = null
                return
            }
            this.file = selectedFile;
        },
        addTag() {
            if(!this.data.tags){
                this.data.tags=[];
            }
            /**
             * if tag is empty
             */
            if (this.inputingTag === '') {
                return;
            }
            /**
             * tag can only contain chinese and english
             */
             const validTagPattern = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
            if (!validTagPattern.test(this.inputingTag)) {
                const msg={
                    state:true,
                    title:"标签只能包含中文、英文以及数字",
                    content:"",
                    color:"warning"
                }
                this.alert(msg);
                return;
            }
            /**
             * can not add repeated tag
             */
            if (this.data.tags.includes(this.inputingTag)) {
                const msg = {
                    state: true,
                    title: '不可以添加重复的标签',
                    content: '',
                    color: 'warning'
                };
                this.alert(msg);
                return;
            }
            /**
             * some sensitive tags can not be added
             */
            if (this.data.tags.includes('测试标签')) {
                const msg = {
                    state: true,
                    title: '请删除测试标签之后添加标签',
                    content: '',
                    color: 'warning'
                };
                this.alert(msg);
                return;
            }
            //max 10 tags
            if (this.data.tags.length >= 10) {
                const msg = {
                    state: true,
                    title: '最多可添加 10 个标签',
                    content: '',
                    color: 'warning'
                };
                this.alert(msg);
                return;
            }
            this.data.tags.push(this.inputingTag);
            this.inputingTag = '';
            this.ifShowTagInput = false;
        },

        deleteTag(text) {
            var tmp=[];
            var arr=this.data.tags;
            for (let i=0;i<arr.length;i++) {
                if(arr[i]!=text){
                    tmp.push(arr[i]);
                }
            }
            this.data.tags=tmp;
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        //called by the parent
        async doUpload(){
            /**
             * upload operation do here
             */
            let uploadState=true;
             this.setLoading(getLoadMsg("正在上传封面...", -1));
             //upload cover
             if (this.tmpCoverImage) {
                let response=await uploadArticleImage(this.tmpCoverImage);
                if(response.status==200||response.status==201){
                    this.data.coverLink=response.image_url;
                }else{
                    uploadState=false;
                }
            }
            //upload resource
            if(this.file){
                //to do  
                this.setLoading(getLoadMsg("正在上传资源文件...", -1));
                this.alert(getNormalErrorAlert("资源上传暂未实现"));
            }
            this.setLoading(getCancelLoadMsg());
            if(uploadState){
                return{
                    status:200,
                    message:"上传成功",
                }
            }else{
                return{
                    status:-1,
                    message:"上传失败",
                }
            }
        }
    },
}
</script>
<style scoped>
.before-text {
    color: #8a8a8a;
    font-size: 16px;
}

.before-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: fit-content;
    margin-right: 10px;
}
.column-div{
    display: flex;
    flex-direction: column;
}
.tool-tip {
    margin-left: 2px;
    margin-bottom: 8px;
}

.add-tag-btn {
    max-height: 25px;
    min-width: 25px;
    padding: 1px;
    margin-bottom: 5px;
    margin-left: 3px;
    margin-right: 3px;
}

.tag-btn {
    height: 28px;
    min-width: 0px;
    padding-top: 0px;
    padding-right: 3px;
    padding-bottom: 1px;
    margin-bottom: 5px;
    margin-left: 3px;
    margin-right: 3px;
}
.before-icon{
    padding-top: 0px;
    margin-bottom: 0px;
    margin-left: 5px; 
}
.dialog-bottom-btn-bar{
    padding:10px;
    display: flex;
    flex-direction: row-reverse;
}
.row-div{
    display: flex;
    flex-direction: row;
    margin:10px;
}
.delete-tag-btn {
    border-radius: 50px;
    height: 15px;
    margin: 5px;
    font-size: 12px;
    color: #8a8a8a;
    font-weight: 600;
    padding-top: 0px;
    margin-right: 0px;
    padding-right: 0px;
    margin-left: 10px;
}
.dialog-card{
    padding: 20px;
    display: flex;
    flex-direction: column;
}
@media screen and (min-width: 600px) {
    .card {
        margin-top: 10px;
        width: 980px;
        padding: 10px;
        border: 1px solid #8a8a8a;
    }
    .detail-input{
        width: 750px;
    }
    .tags-container{
        width: 750px;
        overflow:auto;
    }
}

@media screen and (max-width: 600px) {
    .card {
        margin-top: 10px;
        width: 99vw;
        padding: 10px;
        border: 1px solid #8a8a8a;
    }
    .detail-input{
        width: 60vw;
    }
    .tags-container{
        width: 60vw;
        overflow:auto;
    }
}
</style>