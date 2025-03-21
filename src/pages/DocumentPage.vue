<!-- this page use to display all the md document -->
<template>
    <div class="full-center">
        <article-display :initData="data"/>
    </div>
</template>
<script>
import ArticleDisplay from '@/components/ArticleDisplay.vue'
import {mdContent} from '@/utils/data'
import { useRoute } from 'vue-router';
export default {
    name: 'DocumentPage',
    components: {
        ArticleDisplay,
    },
    data() {
        var data={
            type:'md',
            content:mdContent,
        }
        return {
            data,
        }
    },
    async mounted() {
        const route = useRoute();
        var doc='';
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
    },
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
}

@media screen and (max-width: 600px) {
    .full-center {
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
    }
}
</style>