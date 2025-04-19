<template>
    <div style="border: 1px solid #ccc">
        <Toolbar v-if="type=='edit'" class="tool-bar" :editor="editorRef" :defaultConfig="toolbarConfig"
            :mode="mode" />
        <Editor class="editor" v-model="data.content" :defaultConfig="editorConfig" :mode="mode"
            @onCreated="handleCreated" />
    </div>
</template>
<script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, shallowRef, defineComponent } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { Boot } from '@wangeditor/editor'
import formulaModule from '@wangeditor/plugin-formula'
import { uploadArticleImage } from '@/axios/image';
import { getCancelLoadMsg, getLoadMsg } from '@/utils/other'
import { compressImage } from '@/utils/image'
export default defineComponent({
    name: 'HtmlEditor',
    props: {
        initData:{
            type:Object,
            default: () => {
                return {
                    content:null,
                }
            }
        },
        type:{
            type:String,
            default: "edit",//edit/preview
        }
    },
    components: { Editor, Toolbar },
    setup(props) {
        try{
            Boot.registerModule(formulaModule);
        }catch(e){
            console.log(e);
        }
        //use shallowRef
        const editorRef = shallowRef();
        //exclude fullScreen and uploadVideo
        const toolbarConfig = {
            index:0,
            excludeKeys: ['fullScreen', 'uploadVideo'],
            insertKeys: {
                index: 0,
                keys: [
                    'insertFormula',
                ],
            },
        };

        onBeforeUnmount(() => {
            const editor = editorRef.value;
            if (editor == null) return;
            editor.destroy();
        });

        const handleCreated = (editor) => {
            editorRef.value = editor; // record the editor instance
            console.log(props);
            if(props.type=="edit"){
                return;
            }else{
                editor.disable();
            }
        };
        var imageDict={};
        const customUpload =async (file, insertFn) => {
            const image =await compressImage(file,1024*4);
            const tmpUrl=URL.createObjectURL(image);
            insertFn(tmpUrl);
            imageDict[tmpUrl]=image;
        };
        const editorConfig = {
            hoverbarKeys: {
            formula: {
                    menuKeys: ['editFormula'], // “编辑公式”菜单
                },
            },
            scroll: false,
            MENU_CONF: {
                uploadImage: {
                    customUpload,
                    // eslint-disable-next-line
                    onProgress(progress) {
                    },
                    // eslint-disable-next-line
                    onSuccess(file, res) {
                    },
                    // eslint-disable-next-line
                    onFailed(file, res) {
                    },
                    // eslint-disable-next-line
                    onError(file, err, res) {
                    },
                },
            }
        };
        return {
            editorRef,
            mode: '', // 或 'simple'
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
                    // eslint-disable-next-line
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
@media screen and (min-width: 1000px) {
    .tool-bar{
        border-bottom: 1px solid #ccc;
        width: 980px;
    }
    .editor{
        width:980px;
        min-height: 800px;
    }
}

@media screen and (max-width: 1000px) {
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