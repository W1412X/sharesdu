<!-- this page use to display all the md document -->
<template>
    <div class="full-center">
        <article-display v-if="loadState" :initData="data"/>
    </div>
</template>
<script>
import ArticleDisplay from '@/components/article/ArticleDisplay.vue'
import { getCancelLoadMsg, getLoadMsg } from '@/utils/other';
import { useRoute } from 'vue-router';
export default {
    name: 'DocumentPage',
    components: {
        ArticleDisplay,
    },
    data() {
        let data={
            type:'md',
            content:"## Loading...",
        }
        return {
            data,
            loadState:false,
        }
    },
    created(){
    },
    
    async mounted() {
        this.$emit("set_loading",getLoadMsg("正在加载..."));
        const route = useRoute();
        let doc='';
        if ('name' in route.params) {
            doc = route.params['name'];
        }
        doc+='.md';
        try {
            const response = await fetch('/doc/'+doc);
            if (response.ok) {
                this.data.content = await response.text();
            } else {
                this.data.content = 'Failed to load file.';
            }
        } catch (error) {
            this.data.content = 'Error fetching the file.';
        }
        this.loadState=true;
        this.$emit("set_loading",getCancelLoadMsg());
    },
}
</script>
<style scoped>

@media screen and (min-width: 1000px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
}

@media screen and (max-width: 1000px) {
    .full-center {
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
    }
}
</style>