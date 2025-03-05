<template>
    <v-dialog v-model="ifShowDialog" class="full-screen dialog">
        <div class="dialog-card-container">
            <post-editor v-if="ifShowPostEditor" @close="closeDialog" @alert="alert" @set_loading="setLoading"></post-editor>
            <course-editor v-if="ifShowCourseEditor" @close="closeDialog"  @alert="alert" @set_loading="setLoading"></course-editor>
        </div>
    </v-dialog>
    <div class="full-screen">
        <div class="top-bar">
            <v-btn :to="'/self/'+userId" target="_" icon="mdi-account-circle-outline" variant="text" color="#ffffff" size="40"></v-btn>
            <v-spacer></v-spacer>
            <v-text-field v-model="searchContent" density="compact" label="搜索文章/帖子/课程" :items="['平台使用说明']"
                variant="outlined" color="#ffffff">
            </v-text-field>
            <div class="search-btn-container">
                <v-btn icon="mdi-magnify" variant="text" color="#ffffff" size="40"></v-btn>
            </div>
            <v-spacer></v-spacer>
            <div class="top-bar-right">
                <v-btn @click="setPostEditorState(true)" icon="mdi-comment-question-outline" variant="text"
                    color="#ffffff" size="40"></v-btn>
                <v-btn to="/editor" icon="mdi-file-edit-outline" variant="text" color="#ffffff" size="40"></v-btn>
                <v-btn @click="setCourseEditorState(true)" icon="mdi-book-plus-outline" variant="text" color="#ffffff"
                    size="40"></v-btn>
            </div>
        </div>
        <div class="row-center">
            <v-tabs v-model="itemType" fixed-tabs class="select-bar">
                <v-tab
                    :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'article' ? '#000000' : '#8a8a8a' }"
                    height="40px" value="article" text="文章"></v-tab>
                <v-tab
                    :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'post' ? '#000000' : '#8a8a8a' }"
                    height="40px" value="post" text="帖子"></v-tab>
                <v-tab
                    :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'course' ? '#000000' : '#8a8a8a' }"
                    height="40px" value="course" text="课程"></v-tab>
            </v-tabs>
        </div>
        <div class="row-center">
            <div v-if="itemType == 'article'" class="item-container">
                <article-item
                    v-for="(item,index) in this.articleItems"
                    :key="index"
                    :init-data="item">
                </article-item>
                <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
            <div v-if="itemType == 'post'" class="item-container">
                <post-item
                    v-for="(item,index) in this.postItems"
                    :key="index"
                    :init-data="item">
                </post-item>
                <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
            <div v-if="itemType == 'course'" class="item-container">
                <course-item
                    v-for="(item,index) in this.courseItems"
                    :key="index"
                    :init-data="item">
                </course-item>
                <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import { ref, computed } from 'vue';
import PostEditor from '@/components/PostEditor.vue';
import CourseEditor from '@/components/CourseEditor.vue';
import ArticleItem from '@/components/ArticleItem.vue';
import CourseItem from '@/components/CourseItem.vue';
import PostItem from '@/components/PostItem.vue';
import { getCookie } from '@/utils/cookie';
export default {
    name: 'IndexPage',
    components: {
        PostEditor,
        CourseEditor,
        ArticleItem,
        CourseItem,
        PostItem
    },
    setup() {
        /**
         * loading message
         */
        const loadingMsg = ref({});
        loadingMsg.value = {
            state: false,
            text: '加载中...',
            progress: -1
        }
        /**
         * get device type
         */
        const deviceType = globalProperties.$deviceType;
        /**
         * dialog
         */
        const ifShowPostEditor = ref(false);
        const ifShowCourseEditor = ref(false);
        const ifShowNotice = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowPostEditor.value || ifShowCourseEditor.value || ifShowNotice.value;
        })
        const setPostEditorState = (state) => {
            ifShowPostEditor.value = state;
        }
        const setCourseEditorState = (state) => {
            ifShowCourseEditor.value = state;
        }
        const setNoticeState = (state) => {
            ifShowNotice.value = state;
        }
        const userId=getCookie('userId');
        /**
         * control the item type
         * range: article,post,course
         */
        return {
            loadingMsg,
            deviceType,
            ifShowDialog,
            ifShowPostEditor,
            ifShowCourseEditor,
            ifShowNotice,
            setPostEditorState,
            setCourseEditorState,
            setNoticeState,
            userId,
        }
    },
    data() {
        const itemType = 'article';
        return {
            articleItems:[],
            courseItems:[],
            postItems:[],
            itemType,
        }
    },
    methods: {
        closeDialog() {
            this.setCourseEditorState(false);
            this.setNoticeState(false);
            this.setPostEditorState(false);
        },
        loadMore(){
            /**
             * load more item
             */
            if(this.itemType==='article'){
                // eslint-disable-next-line
                
            }else if(this.itemType==='course'){
                // eslint-disable-next-line
            }else if(this.itemType==='post'){
                // eslint-disable-next-line
            }
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
    },
    mounted() {
        this.$emit('alert',{
            state:true,
            color:'success',
            title:'TEST',
            content:'this is a test'
        })
    }
}
</script>
<style scoped>
.load-btn{
    height: 30px;
    width: 100%;
    margin-top: 5px;
}
/** desktop */
@media screen and (min-width: 600px) {
    .full-screen {
        width: 100%;
        height: 100%;
    }

    .top-bar {
        z-index: 1000;
        position: fixed;
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
        padding: 5px;
        max-height: 55px;
        background-color: var(--theme-color);
    }

    .search-btn-container {
        width: fit-content;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .dialog-card-container {
        display: flex;
        justify-content: center;
    }
    .select-bar {
        z-index: 1000;
        position: fixed;
        width: 750px;
        height: 40px;
        margin-top: 55px;
    }
    .row-center{
        display:flex;
        flex-direction: row;
        width: 100vw;
        justify-content: center;
    }
    .item-container{
        margin-top: 95px;
        display: flex;
        flex-direction: column;
    }
}

/** mobile */
@media screen and (max-width: 600px) {
    .full-screen {
        width: 100vw;
        height: 100vh;
    }

    .top-bar {
        z-index: 1000;
        position: fixed;
        width: 100vw;
        height: fit-content;
        display: flex;
        flex-direction: row;
        padding: 5px;
        max-height: 55px;
        background-color: var(--theme-color);
    }

    .search-btn-container {
        width: fit-content;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .dialog-card-container {
        display: flex;
        justify-content: center;
    }

    .select-bar {
        z-index: 1000;
        width: 100vw;
        position: fixed;
        height: 40px;
        margin-top: 55px;
    }
    .row-center{
        display:flex;
        flex-direction: row;
        width: 100vw;
        justify-content: center;
    }
    .item-container{
        margin-top: 95px;
        display: flex;
        flex-direction: column;
    }
}
</style>