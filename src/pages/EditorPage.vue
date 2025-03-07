<template>
    <div class="full-center">
        <v-card elevation="0" class="full-card">
            <v-btn @click="shiftEditorType" class="editor-type-btn" variant="tonal">{{ editorBtnText }}</v-btn>
            <sensitive-text-field 
                class="title-input"
                :density="deviceType=='mobile'?'compact':'comfortable'"
                variant="outlined"
                label="编辑文章标题"
                rows="1"
                v-model="data.title"
                :error="data.title.length>20"
                :error-messages="data.title.length>20?'标题长度不能超过20个字符':''"
                :counter="20"
                :counter-value="data.title.length"
            ></sensitive-text-field>
            <html-editor 
                ref="htmlEditorRef"
                :init-data="htmlData"
                v-if="editorType=='html'"
            ></html-editor>
            <md-editor
                ref="mdEditorRef"
                :init-data="mdData"
                v-if="editorType=='md'"
            ></md-editor>
            <editor-bar ref="editorBarRef" @set_loading="setLoading" @alert="alert"></editor-bar>
            <v-btn class="submit-btn" :color="themeColor" variant="outlined">发布文章</v-btn>
        </v-card>
    </div>
</template>
<script>
import EditorBar from '@/components/EditorBar.vue';
import HtmlEditor from '@/components/HtmlEditor.vue';
import MdEditor from '@/components/MdEditor.vue';
import SensitiveTextField from '@/components/SensitiveTextField.vue';
import { globalProperties } from '@/main';
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
        return{
            deviceType,
            editorBtnText,
            editorType,
            themeColor,
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
            data:{
                title:'',
                content:'',
                editor:'',//hide in content  
            },
            htmlData:{
                content:'',
            },
            mdData:{
                content:'',
            },
        }
    },
    methods: {
        shiftEditorType(){
            if(this.editorType === 'html'){
                this.editorType = 'md';
                //save the html content
                this.htmlData.content=this.$refs.htmlEditorRef.$data.data.content;
            }else{
                this.editorType = 'html';
                //save the md content
                this.mdData.content=this.$refs.mdEditorRef.$data.data.content;
            }
        },
        submit(){
            /**
             * get the bar data and post  
             */
            console.log(this.$refs.editorBarRef.$data);
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        }
    },
    async mounted() {
        /**
         * check if with id
         * if yes, get the data and set the data,which means editing 
         * else do nothing
         */
        console.log("ss")
    }
}
</script>
<style scoped>
@media screen and (min-width: 600px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
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