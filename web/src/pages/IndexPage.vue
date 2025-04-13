<template>
    <v-dialog v-model="ifShowDialog" class="full-screen dialog">
        <div class="dialog-card-container">
        </div>
    </v-dialog>
    <div class="full-screen">
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
                    v-for="(item,index) in this.articleList"
                    :key="index"
                    :init-data="item">
                </article-item>
                <v-btn @click="loadMore('article')" variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
            <div v-if="itemType == 'post'" class="item-container">
                <post-item
                    v-for="(item,index) in this.postList"
                    :key="index"
                    :init-data="item">
                </post-item>
                <v-btn @click="loadMore('post')" variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
            <div v-if="itemType == 'course'" class="item-container">
                <course-item
                    v-for="(item,index) in this.courseList"
                    :key="index"
                    :init-data="item">
                </course-item>
                <v-btn @click="loadMore('course')" variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import { ref, computed } from 'vue';
import ArticleItem from '@/components/ArticleItem.vue';
import CourseItem from '@/components/CourseItem.vue';
import PostItem from '@/components/PostItem.vue';
import { getCookie } from '@/utils/cookie';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert, openNewPage } from '@/utils/other';
import { getArticleList, getPostListByArticleId } from '@/axios/article';
import { getCourseList } from '@/axios/course';
export default {
    name: 'IndexPage',
    components: {
        ArticleItem,
        CourseItem,
        PostItem,
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
        const userName = getCookie('userName');
        const userProfileUrl = getCookie('userProfileUrl');
        /**
         * dialog
         */
        const ifShowDialog = computed(() => {
            return false;
        })
        const userId=getCookie('userId');
        /**
         * control the item type
         * range: article,post,course
         */
        return {
            loadingMsg,
            deviceType,
            ifShowDialog,
            userId,
            userName,
            userProfileUrl,
        }
    },
    watch:{
        itemType: {
            // eslint-disable-next-line
            handler(newVal,oldVal) {
                switch(newVal){
                    case 'article':
                        if(this.articleList.length==0){
                            this.loadMore('article');
                        }
                        break;
                    case 'post':
                        if(this.postList.length==0){
                            this.loadMore('post');
                        }
                        break;
                    case 'course':
                        if(this.courseList.length==0){
                            this.loadMore('course');
                        }
                        break;
                    default:
                        console.log(newVal);
                        this.alert(getNormalErrorAlert('未知错误(页面切换)'));
                }
            },
            immediate: false,
        }
    },
    beforeRouteLeave (to, from, next) {
        //use session storage to save memory now  
        let lastScanMsg={}
        lastScanMsg.itemType=this.itemType;
        lastScanMsg.articleList=this.articleList;
        lastScanMsg.postList=this.postList;
        lastScanMsg.courseList=this.courseList;
        lastScanMsg.articlePageNum=this.articlePageNum;
        lastScanMsg.postPageNum=this.postPageNum;
        lastScanMsg.coursePageNum=this.coursePageNum;
        let scrollPosition = document.scrollingElement.scrollTop;
        lastScanMsg.scrollPosition=scrollPosition;
        sessionStorage.setItem('indexScanMsg', JSON.stringify(lastScanMsg))
        next()
    },
    data() {
        const itemType = 'article';
        return {
            articleList:[],
            courseList:[],
            postList:[],
            articlePageNum:1,
            postPageNum:1,
            coursePageNum:1,
            itemType,
        }
    },
    methods: {
        editArticle(){
            openNewPage("#/editor")
        },
        closeDialog() {
        },
        search(){
            this.alert(getNormalInfoAlert("功能未开放..."))
        },
        async loadMore(itemType){
            if(itemType=='article'){
                this.setLoading(getLoadMsg("正在获取..."));
                let response=await getArticleList('time',null,this.articlePageNum);
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    for(let ind=0;ind<response.article_list.length;ind++){
                        this.articleList.push({
                            id:response.article_list[ind].article_id,
                            title:response.article_list[ind].article_title,
                            summary:response.article_list[ind].article_summary,
                            starNum:response.article_list[ind].star_count,
                            viewNum:response.article_list[ind].view_count,
                            likeNum:response.article_list[ind].like_count,
                            publishTime:response.article_list[ind].publish_time,
                            tags:response.article_list[ind].article_tags,
                            authorName:response.article_list[ind].author_name,
                            authorId:response.article_list[ind].author_id,
                            coverLink:response.article_list[ind].cover_link,
                            type:response.article_list[ind].article_type,
                            hotScore:response.article_list[ind].hot_score
                        });
                    }
                    this.articlePageNum++;
                    this.alert(getNormalSuccessAlert(response.message));
                }else{
                    this.alert(getNormalErrorAlert(response.message));
                }
            }else if(itemType=='course'){
                this.setLoading(getLoadMsg("正在获取..."));
                let response=await getCourseList(this.coursePageNum);
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    for(let ind=0;ind<response.course_list.length;ind++){
                        this.courseList.push({
                            id:response.course_list[ind].course_id,
                            name:response.course_list[ind].course_name,
                            type:response.course_list[ind].course_type,
                            college:response.course_list[ind].college,
                            credit:response.course_list[ind].credits,
                            campus:response.course_list[ind].campus,
                            teacher:response.course_list[ind].teacher,
                            attendMethod:response.course_list[ind].course_method,
                            examineMethod:response.course_list[ind].assessment_method,
                            score:response.course_list[ind].score,
                            scoreSum:response.course_list[ind].all_score,
                            evaluateNum:response.course_list[ind].all_people,
                            publishTime:response.course_list[ind].publish_time,
                            
                        });
                    }
                    this.alert(getNormalSuccessAlert("加载成功"));
                    this.coursePageNum++;
                }else{
                    this.alert(getNormalErrorAlert(response.message));
                }
            }else if(itemType=='post'){
                //get the article 20 template  
                this.setLoading(getLoadMsg("正在获取..."));
                let response=await getPostListByArticleId(20,this.postPageNum);
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    for(let i=0;i<response.post_list.length;i++){
                        this.postList.push({
                            id:response.post_list[i].post_id,
                            title:response.post_list[i].post_title,
                            content:response.post_list[i].post_content,
                            authorId:response.post_list[i].poster_id,
                            authorName:response.post_list[i].poster_name,
                            viewNum:response.post_list[i].view_count,
                            likeNum:response.post_list[i].like_count,
                            replyNum:response.post_list[i].reply_count,
                            publishTime:response.post_list[i].publish_time,
                            ifLike:response.post_list[i].if_like,
                            ifStar:response.post_list[i].if_star
                        });
                    }
                    this.postPageNum++;
                    this.alert(getNormalSuccessAlert(response.message));
                }else{
                    this.alert(getNormalErrorAlert(response.message));
                }
            }
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        addPost(item){
            this.postList.unshift(item);
        }
    },
    async mounted() {
        //use session storage to save memory now  
        try{
            let lastScanMsg=JSON.parse(sessionStorage.getItem("indexScanMsg"))
            this.itemType=lastScanMsg.itemType;
            this.articleList=lastScanMsg.articleList;
            this.postList=lastScanMsg.postList;
            this.courseList=lastScanMsg.courseList;
            this.postPageNum=lastScanMsg.postPageNum;
            this.coursePageNum=lastScanMsg.coursePageNum;
            this.articlePageNum=lastScanMsg.articlePageNum;
            setTimeout(()=>{
                document.scrollingElement.scrollTop=lastScanMsg.scrollPosition;
            },10)
            document.getElementById('web-title').innerText='ShareSDU | 首页';
        }catch(e){
            await this.loadMore(this.itemType)
        }
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
    }
    .row-center{
        display:flex;
        flex-direction: row;
        width: 100vw;
        justify-content: center;
    }
    .item-container{
        margin-bottom: 50px;
        margin-top: 40px;
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
    }
    .row-center{
        display:flex;
        flex-direction: row;
        width: 100vw;
        justify-content: center;
    }
    .item-container{
        margin-bottom: 50px;
        margin-top: 40px;
        display: flex;
        flex-direction: column;
    }
}
</style>