<template>
    <div class="container">
        <html-editor ref="htmlEditorRef" :init-data="data" v-if="data.type=='html'"  :type="'preview'"></html-editor>
        <div v-if="data.type==='md'" class="md-container">
            <MdPreview v-if="data.type==='md'" :id="mdId" :modelValue="data.content" />
        </div>
    </div>
</template>
<script setup>
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
const mdId = 'preview-only';
</script>
<script>
import HtmlEditor from './HtmlEditor.vue';
import { copy } from '@/utils/other';
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
        HtmlEditor,
     },
    data(){
        return{
            data:{
            },
        }
    },
    methods:{
    },
    mounted(){
        this.data=copy(this.initData);
    }
}
</script>
<style scoped>
@media screen and (min-width: 1000px) {
    .container {
        width: 1000px;
        padding: 5px;
        border: #e0e0e0 1px solid;
        background-color: #ffffff;
    }
    .displayer {
        width: 100%;
        overflow-y: auto;
    }
    .md-container{
        padding:10px;
    }
}

@media screen and (max-width: 1000px) {
    .container {
        width: 100vw;
        background-color: #ffffff;
    }
    .displayer{
        width: 100%;
        overflow-y: auto;
    }
    .md-container{
        padding:5px;
    }
}
</style>