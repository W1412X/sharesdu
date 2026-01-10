<template>
    <div class="container">
        <transition name="editor-fade" mode="out-in">
            <html-editor 
                v-if="data.type=='html'" 
                :key="'html'"
                ref="htmlEditorRef" 
                :init-data="data" 
                :type="'preview'"
            ></html-editor>
            <div v-else-if="data.type==='md'" :key="'md'" class="md-container">
                <MdPreview :id="mdId" :modelValue="data.content" style="border: none;"/>
        </div>
        </transition>
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

/* 编辑器切换过渡动画 */
.editor-fade-enter-active {
  transition: opacity 0.2s ease-in;
}

.editor-fade-leave-active {
  transition: opacity 0.15s ease-out;
}

.editor-fade-enter-from,
.editor-fade-leave-to {
  opacity: 0;
}

.editor-fade-enter-to,
.editor-fade-leave-from {
  opacity: 1;
}
</style>