<template>
    <div style="border: 1px solid #ccc">
        <Toolbar class="tool-bar" :editor="editorRef" :defaultConfig="toolbarConfig"
            :mode="mode" />
        <Editor class="editor" v-model="data.content" :defaultConfig="editorConfig" :mode="mode"
            @onCreated="handleCreated" />
    </div>
</template>
<script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, shallowRef, inject, defineComponent } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { Boot } from '@wangeditor/editor'
import formulaModule from '@wangeditor/plugin-formula'
import { DomEditor } from '@wangeditor/editor'
import { uploadArticleImage } from '@/axios/image';
import { getCancelLoadMsg, getLoadMsg } from '@/utils/other'
export default defineComponent({
    name: 'HtmlEditor',
    props: {
        initData:{
            type:Object,
            default: () => {
                return {
                    content:`<p><span style="color: rgb(0, 0, 0); font-size: 24px; font-family: 楷体;"><strong>图片与视频：</strong></span></p>...`,
                }
            }
        }
    },
    components: { Editor, Toolbar },
    setup() {
        const store = inject('store');
        if (!store.state.ifRegisterEditor) {
            Boot.registerModule(formulaModule);
            store.commit('registerEditor');
        }

        //use shallowRef
        const editorRef = shallowRef();
        //exclude fullScreen and uploadVideo
        const toolbarConfig = {
            excludeKeys: ['fullScreen', 'uploadVideo']
        };

        onBeforeUnmount(() => {
            const editor = editorRef.value;
            if (editor == null) return;
            editor.destroy();
        });

        const handleCreated = (editor) => {
            editorRef.value = editor; // record the editor instance
        };
        var imageDict={};
        const customUpload = (file, insertFn) => {
            const image = file;
            const tmpUrl=URL.createObjectURL(image);
            insertFn(tmpUrl);
            imageDict[tmpUrl]=image;
        };

        const editorConfig = {
            hoverbarKeys: {
                formula: {
                    menuKeys: ['editFormula'],
                },
            },
            scroll: false,
            excludeKeys: ['uploadVideo'],
            MENU_CONF: {
                uploadImage: {
                    customUpload,
                    onProgress(progress) {
                    },
                    onSuccess(file, res) {
                    },
                    onFailed(file, res) {
                    },
                    onError(file, err, res) {
                    },
                },
            }
        };
        return {
            editorRef,
            mode: 'default', // 或 'simple'
            toolbarConfig,
            handleCreated,
            editorConfig,
            imageDict,
        };
    },
    data() {
        /**
         * used to the map the local url to the server url
         */
        return {
            data:null,
        }
    },
    methods: {
        test() {
            const toolbar = DomEditor.getToolbar(this.editorRef);
            const curToolBarConfig = toolbar.getConfig();
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        async doUpload(){
            let uploadState=true;
            let oriLocalUrls=JSON.parse(JSON.stringify(Object.keys(this.imageDict)));
            let validLocalUrls=[];
            for(let i=0;i<oriLocalUrls.length;i++){
                if(oriLocalUrls[i] in this.data.content){
                    validLocalUrls.push(oriLocalUrls[i]);
                }
            }
            this.setLoading(getLoadMsg("正在上传图片 0/"+String(validLocalUrls.length)));
            for(let i=0;i<validLocalUrls.length;i++){
                this.setLoading(getLoadMsg("正在上传图片 "+(i+1)+"/"+String(validLocalUrls.length)));
                let response=await uploadArticleImage(this.imageDict[validLocalUrls[i]]);
                if(response.status==200||response.status==201){
                    this.data.content=this.data.content.replaceAll(validLocalUrls[i],response.image_url);
                }else{
                    uploadState=false;
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
                }
                return {
                    status:200,
                    message:"所有图片上传成功"
                }
            }else{
                return {
                    status:-1,
                    message:"图片上传失败"
                }
            }
        }
    },
    created() {
        this.data=this.initData;
    },
    mounted() {
    }
});
</script>
<style scoped>
@media screen and (min-width: 600px) {
    .tool-bar{
        border-bottom: 1px solid #ccc;
        width: 980px;
    }
    .editor{
        width:980px;
        min-height: 800px;
    }
}

@media screen and (max-width: 600px) {
    .tool-bar{
        border-bottom: 1px solid #ccc;
        width: 100vw;
    }
    .editor{
        width:100vw;
        min-height: 600px;
    }
}
</style>