<template>
    <div class="container">
        <Editor 
            v-if="data.type==='html'"
            :mode="mode"
            v-model="data.content" :defaultConfig="editorConfig"
            @onCreated="handleCreated"
            class="displayer">
        </Editor>
        <div v-if="data.type==='md'" class="md-container">
            <MdPreview v-if="data.type==='md'" :id="mdId" :modelValue="data.content" />
        </div>
    </div>
</template>
<script setup>
import { Editor } from '@wangeditor/editor-for-vue';
import { MdPreview } from 'md-editor-v3';
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import 'md-editor-v3/lib/preview.css';
const mdId = 'preview-only';
</script>
<script>
import { computed, onBeforeUnmount, shallowRef } from 'vue'

//import { Boot } from '@wangeditor/editor'
//import formulaModule from '@wangeditor/plugin-formula'
export default {
    name: 'ArticleDisplay', 
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    type: null,//md/html
                    content: null,
                }
            }
        }
    },
    components: { 
        Editor
     },
    setup() {
        //Boot.registerModule(formulaModule);
        // editor instance shallowRef
        const editorRef = shallowRef()
        // dispose editor when the component is unmounted
        onBeforeUnmount(() => {
            const editor = editorRef.value
            if (editor == null) return
            editor.destroy()
        })
        const handleCreated = (editor) => {
            editorRef.value = editor // record the editor instance
            editor.disable();
        }
        return {
            editorRef,
            mode: 'default', // simple
            handleCreated,
        };
    },
    data(){
        const data=computed(()=>{
            return this.initData;
        });
        return{
            data,
        }
    },
    mounted(){

    }
}
</script>
<style scoped>
@media screen and (min-width: 600px) {
    .container {
        width: 1000px;
        padding: 5px;
        border: #8a8a8a 1px solid;
    }
    .displayer {
        width: 100%;
        overflow-y: scroll;
    }
    .md-container{
        padding:10px;
    }
}

@media screen and (max-width: 600px) {
    .container {
        width: 100vw;
    }
    .displayer{
        width: 100%;
        overflow-y: scroll;
    }
    .md-container{
        padding:5px;
    }
}
</style>