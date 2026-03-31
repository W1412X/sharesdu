<!-- this page use to display all the md document -->
<template>
    <div class="full-center">
        <share-sdu-breath-view
            v-if="!loadState"
            :min-height="'520px'"
        />
        <transition name="fade" mode="out-in">
            <article-display 
                v-if="loadState" 
                :key="docName"
                :initData="data"
            />
        </transition>
    </div>
</template>
<script>
import ArticleDisplay from '@/components/article/ArticleDisplay.vue'
import ShareSduBreathView from '@/components/common/ShareSduBreathView.vue';
export default {
    name: 'DocumentPage',
    components: {
        ArticleDisplay,
        ShareSduBreathView,
    },
    data() {
        let data={
            type:'md',
            content:"## Loading...",
        }
        return {
            data,
            loadState:false,
            docName:'',
        }
    },
    created(){
    },
    
    async mounted() {
        const route = this.$route;
        let doc='';
        if ('name' in route.params) {
            doc = route.params['name'];
        }
        this.docName = doc;
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

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}
</style>
