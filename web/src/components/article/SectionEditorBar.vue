<template>
    <v-dialog v-model="ifShowDialog" style="width: 100%;height:100%;justify-content: center;">
      <div v-if="ifShowTagInput" style="width: 100%;height:100%;justify-content: center;display: flex">
        <v-card class="dialog-card">
            <div class="title-bold">
                添加标签
            </div>
            <sensitive-text-area
                v-model="inputingTag"
                label="输入标签"
                rows="1"
                density="compact"
                variant="outlined"
            ></sensitive-text-area>
            <div class="dialog-bottom-btn-bar">
                <v-btn @click="addTag" variant="text">添加</v-btn>
                <v-btn @click="setTagInputState(false)" variant="text">取消</v-btn>
            </div>
        </v-card>
      </div>
    </v-dialog>
    <v-card class="card text-medium section-editor-card">
        <!-- 板块编辑提示横幅 -->
        <div class="section-banner">
            <v-icon icon="mdi-forum" :color="themeColor" size="24"></v-icon>
            <span class="section-banner-text">板块文章编辑</span>
            <v-tooltip activator="parent" location="top" class="tool-tip">
                <div class="tooltip-content">
                    <div class="tooltip-title">什么是板块文章？</div>
                    <div class="tooltip-body">
                        板块文章类似于论坛中的板块，用于创建和管理特定主题的讨论区。
                        当发布为板块文章后，其他用户可以在该板块下发布帖子进行讨论。
                    </div>
                </div>
            </v-tooltip>
            <v-icon type="mdi" icon="mdi-help-circle-outline" color="#8a8a8a" size="18" class="help-icon"></v-icon>
        </div>
        
        <div class="column-div">
            <!-- 板块名称字段 -->
            <div class="row-div section-row">
                <div class="before-container">
                    <span class="before-text section-label">板块名称:</span>
                    <v-tooltip class="tool-tip" activator="parent" location="top">
                        板块名称用于标识这个讨论区，会显示在板块列表和板块详情页。
                        建议使用简洁明了的名称，如"技术讨论"、"学习交流"等。
                    </v-tooltip>
                    <v-icon type="mdi" icon="mdi-help-circle-outline" color="#8a8a8a" size="16"
                        class="before-icon"></v-icon>
                </div>
                <div class="section-input-container">
                    <sensitive-text-field
                        v-model="data.articleSection"
                        label="输入板块名称"
                        variant="outlined"
                        density="compact"
                        :maxlength="50"
                        :counter="50"
                        :rules="sectionRules"
                        class="section-input"
                    ></sensitive-text-field>
                </div>
            </div>
            
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
                <div>
                    <v-btn @click="selectImage()" v-if="this.data.coverLink==''" :color="'grey'" variant="outlined" text="+" :width="160" :height="160"></v-btn>
                    <div  v-else @click="selectImage()">
                        <img-card :width="160" :clickable="false" :height="160" :src="this.data.coverLink"></img-card>
                    </div>
                    
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
                        <br />上传的资源不得超过80MB(如有需求请联系管理员)<br />上传的资源类型仅能为压缩包,PDF,WORD以及PPT</v-tooltip>
                    <v-icon type="mdi" icon="mdi-help-circle-outline" color="#8a8a8a" size="16"
                        class="before-icon"></v-icon>
                </div>
                <div v-if="data.sourceUrl==''" class="before-container">
                    <v-file-upload v-model="this.file" title="" max-height="98" width="98" @change="handleFileChange" clearable variant="compact" density="compact">
                    </v-file-upload>
                </div>
                <div v-if="data.sourceUrl!=''" class="before-container">
                    <div>暂不支持在编辑时上传/修改资源，如有变更需求请编辑新的文章</div>
                </div>
            </div>
        </div>
    </v-card>
</template>
<script>
/**
 * 板块文章编辑器工具栏组件
 * 基于 EditorBar 修改，添加了 article_section 字段
 */
import { globalProperties } from '@/main';
import { computed, defineAsyncComponent, ref } from 'vue';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalWarnAlert } from '@/utils/other';
import { uploadArticleImage } from '@/api/modules/image';
import { compressImage } from '@/utils/imageUtils';
export default {
    name: 'SectionEditorBar',
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    articleSection: "default",
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
        
        // 板块名称验证规则
        const sectionRules = [
            (v) => !!v || '板块名称不能为空',
            (v) => (v && v.length >= 2) || '板块名称至少需要2个字符',
            (v) => (v && v.length <= 50) || '板块名称不能超过50个字符',
            (v) => {
                const validPattern = /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/;
                return validPattern.test(v) || '板块名称只能包含中文、英文、数字、下划线和连字符';
            }
        ];
        
        return {
            themeColor,
            inputingTag,
            ifShowDialog,
            ifShowTagInput,
            setTagInputState,
            sectionRules,
        }
    },
    components: {
        SensitiveTextArea: defineAsyncComponent(() => import('@/components/common/SensitiveTextArea.vue')),
        SensitiveTextField: defineAsyncComponent(() => import('@/components/common/SensitiveTextField.vue')),
        VFileUpload: defineAsyncComponent(async () => {
            const module = await import('vuetify/lib/labs/components.mjs');
            return module.VFileUpload;
        }),
        ImgCard: defineAsyncComponent(() => import('@/components/common/ImgCard.vue')),
    },
    data() {
        let data=this.initData ? JSON.parse(JSON.stringify(this.initData)) : {
            articleSection: "default",
            summary: "",
            type: "",
            tags: [],
            originLink: "",
            coverLink:"",
            sourceUrl:"",
        };
        const file=null;
        return{
            data,
            file,
            tmpCoverImage:null,
        }
    },
    watch: {
        initData: {
            handler(newVal) {
                if (newVal) {
                    this.data = {
                        articleSection: newVal.articleSection || "default",
                        summary: newVal.summary || "",
                        type: newVal.type || "",
                        tags: Array.isArray(newVal.tags) ? [...newVal.tags] : [],
                        originLink: newVal.originLink || "",
                        coverLink: newVal.coverLink || "",
                        sourceUrl: newVal.sourceUrl || "",
                    };
                }
            },
            deep: true,
            immediate: false,
        }
    },
    methods: {
        async selectImage() {
            let input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg, image/png, image/gif';
            input.onchange = async (event) => {
                let image = event.target.files[0];
                if (!image) return;
                try {
                    image = await compressImage(image, 1024 * 4);
                    this.data.coverLink = URL.createObjectURL(image);
                    this.tmpCoverImage = image;
                } catch (error) {
                    console.error('Failed to compress image:', error);
                    this.$emit('alert', { 
                        state: true, 
                        color: 'error', 
                        title: '图片处理失败', 
                        content: error.message || '图片压缩失败，请重试' 
                    });
                }
            };
            input.click();
        },
        handleFileChange(event) {
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
            const maxSize = 80 * 1024 * 1024
            if (selectedFile.size > maxSize) {
                this.$emit('alert', { state: true, color: 'warning', title: '文件大小超过限制', content: '一次最多可以上传一个不多于80MB的文件' })
                this.file = null
                return
            }
            this.file = selectedFile;
        },
        addTag() {
            if(!this.data.tags){
                this.data.tags=[];
            }
            if (this.inputingTag === '') {
                this.alert(getNormalWarnAlert("标签不能为空"));
                return;
            }
            if(this.inputingTag.length>15){
                this.alert(getNormalWarnAlert("标签长度不能超过15个字符"));
            }
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
            let tmp=[];
            let arr=this.data.tags;
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
        async doUpload(){
            let uploadState=true;
             this.setLoading(getLoadMsg("正在上传封面...", -1));
             if (this.tmpCoverImage) {
                let response=await uploadArticleImage(this.tmpCoverImage);
                if(response.status==200||response.status==201){
                    this.data.coverLink=response.image_url;
                }else{
                    uploadState=false;
                }
            }
            if(this.file){
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
}

.before-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: fit-content;
    margin-right: 10px;
    color: #8a8a8a;
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
    align-items: center;
    display: flex;
    flex-direction: row;
    margin:10px;
}
.delete-tag-btn {
    border-radius: 50px;
    height: 15px;
    margin: 5px;
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

/* 板块编辑特有样式 */
.section-editor-card {
    border-left: 4px solid var(--theme-color, #1976d2);
}

.section-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
    border-bottom: 1px solid rgba(25, 118, 210, 0.2);
    margin-bottom: 10px;
}

.section-banner-text {
    font-weight: 600;
    color: var(--theme-color, #1976d2);
    font-size: 16px;
}

.help-icon {
    margin-left: auto;
    cursor: help;
}

.tooltip-content {
    max-width: 300px;
}

.tooltip-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
}

.tooltip-body {
    font-size: 14px;
    line-height: 1.5;
    color: #666;
}

.section-row {
    background-color: rgba(25, 118, 210, 0.03);
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
}

.section-label {
    font-weight: 600;
    color: var(--theme-color, #1976d2);
}

.section-input-container {
    flex: 1;
}

.section-input {
    width: 100%;
}

@media screen and (min-width: 1000px) {
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
    .section-input {
        width: 750px;
    }
}

@media screen and (max-width: 1000px) {
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
    .section-input {
        width: 60vw;
    }
    .section-banner {
        padding: 10px 12px;
    }
    .section-banner-text {
        font-size: 14px;
    }
}
</style>

