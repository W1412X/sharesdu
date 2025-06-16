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
            <v-pull-to-refresh :pull-down-threshold="64" @load="refresh" style="margin-top: 40px;">
                <div v-if="itemType == 'article'" class="item-container">
                    <div class="sort-method-bar">
                        <v-spacer />
                        <v-btn variant="tonal" class="text-small sort-btn" @click="articleSortMethod = 'time'"
                            type="mdi" :color="articleSortMethod == 'time' ? themeColor : 'grey'"
                            prepend-icon="mdi-sort-clock-ascending-outline" :text="'最近发布'">
                        </v-btn>
                        <v-spacer />
                        <v-btn variant="tonal" class="text-small sort-btn" @click="articleSortMethod = 'star'"
                            type="mdi" :color="articleSortMethod == 'star' ? themeColor : 'grey'"
                            prepend-icon="mdi-star-check-outline" :text="'最多收藏'">
                        </v-btn>
                        <v-spacer />
                        <v-btn variant="tonal" class="text-small sort-btn" @click="articleSortMethod = 'view'"
                            type="mdi" :color="articleSortMethod == 'view' ? themeColor : 'grey'"
                            prepend-icon="mdi-eye-outline" :text="'最多浏览'">
                        </v-btn>
                        <v-spacer />
                        <v-btn variant="tonal" class="text-small sort-btn" @click="articleSortMethod = 'hot'" type="mdi"
                            :color="articleSortMethod == 'hot' ? themeColor : 'grey'" prepend-icon="mdi-fire"
                            :text="'最高热度'">
                        </v-btn>
                        <v-spacer />
                    </div>
                    <article-item v-for="item in this.articleList[articleSortMethod]" :key="item.id" :init-data="item">
                    </article-item>
                    <v-btn @click="loadMore('article')" variant="tonal" :loading="loading.article"
                        class="load-btn">加载更多</v-btn>
                </div>
                <div v-if="itemType == 'post'" class="item-container">
                    <post-item v-for="item in this.postList" :key="item.id" :init-data="item">
                    </post-item>
                    <v-btn @click="loadMore('post')" variant="tonal" :loading="loading.post"
                        class="load-btn">加载更多</v-btn>
                </div>
                <div v-if="itemType == 'course'" class="item-container">
                    <course-item v-for="item in this.courseList" :key="item.id" :init-data="item">
                    </course-item>
                    <v-btn @click="loadMore('course')" variant="tonal" :loading="loading.course"
                        class="load-btn">加载更多</v-btn>
                </div>
            </v-pull-to-refresh>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import { ref, computed } from 'vue';
import ArticleItem from '@/components/article/ArticleItem.vue';
import CourseItem from '@/components/course/CourseItem.vue';
import PostItem from '@/components/post/PostItem.vue';
import { getCookie } from '@/utils/cookie';
import { getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert, openNewPage } from '@/utils/other';
import { getArticleList, getPostListByArticleId } from '@/axios/article';
import { getCourseList } from '@/axios/course';
import { VPullToRefresh } from 'vuetify/lib/labs/components.mjs';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
export default {
    name: 'IndexPage',
    components: {
        ArticleItem,
        CourseItem,
        PostItem,
        VPullToRefresh,
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
        const themeColor = globalProperties.$themeColor;
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
        const userId = getCookie('userId');
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
            themeColor,
        }
    },
    watch: {
        itemType: {
            // eslint-disable-next-line
            handler(newVal, oldVal) {
                if(!this.ifMounted){
                    return;
                }
                switch (newVal) {
                    case 'article':
                        if (this.articleList[this.articleSortMethod].length == 0) {
                            this.loadMore('article');
                        }
                        break;
                    case 'post':
                        if (this.postList.length == 0) {
                            this.loadMore('post');
                        }
                        break;
                    case 'course':
                        if (this.courseList.length == 0) {
                            this.loadMore('course');
                        }
                        break;
                    default:
                        this.alert(getNormalErrorAlert('未知错误(页面切换)'));
                }
            },
            immediate: true,
        },
        articleSortMethod: {
            handler(newVal, oldVal) {
                if (newVal == oldVal) {
                    return;
                }
                if (this.articleList[this.articleSortMethod].length == 0) {
                    this.loadMore(this.itemType);
                }
            },
            immediate: false,
        }
    },
    beforeRouteLeave(to, from, next) {
        try{
            //use session storage to save memory now  
            if(!getCookie("userName")){
                next();
                return;
            }
            let lastScanMsg = {}
            lastScanMsg.itemType = this.itemType;
            lastScanMsg.pageNum={
                article:this.articlePageNum,
                post:this.postPageNum,
                course:this.coursePageNum,
            }
            let scrollPosition = document.scrollingElement.scrollTop;
            lastScanMsg.scrollPosition = scrollPosition;
            lastScanMsg.articleSortMethod = this.articleSortMethod;
            selfDefinedSessionStorage.setItem('indexScanMsg', JSON.stringify(lastScanMsg))
            next()
        }catch(e){
            next();
        }
    },
    data() {
        const itemType = 'article';
        return {
            ifMounted: false,
            articleList: {
                time: [],
                star: [],
                view: [],
                hot: [],
            },
            courseList: [],
            postList: [],
            articlePageNum: {
                time: 1,
                star: 1,
                view: 1,
                hot: 1,
            },
            postPageNum: 1,
            coursePageNum: 1,
            itemType,
            articleSortMethod: 'time',
            loading: {
                article: false,
                course: false,
                post: false,
            },
            lastPageNum:null,
        }
    },
    methods: {
        editArticle() {
            openNewPage("#/editor")
        },
        async refresh({ done }) {
            let response = null;
            switch (this.itemType) {
                case 'article':
                    response = await getArticleList(this.articleSortMethod, null, 1,false);
                    if (response.status == 200) {
                        this.articlePageNum[this.articleSortMethod] = 2;
                        this.articleList[this.articleSortMethod] = [];
                        for (let ind = 0; ind < response.article_list.length; ind++) {
                            this.articleList[this.articleSortMethod].push({
                                id: response.article_list[ind].article_id,
                                title: response.article_list[ind].article_title,
                                summary: response.article_list[ind].article_summary,
                                starNum: response.article_list[ind].star_count,
                                viewNum: response.article_list[ind].view_count,
                                likeNum: response.article_list[ind].like_count,
                                publishTime: response.article_list[ind].publish_time,
                                tags: response.article_list[ind].article_tags,
                                authorName: response.article_list[ind].author_name,
                                authorId: response.article_list[ind].author_id,
                                coverLink: response.article_list[ind].cover_link,
                                type: response.article_list[ind].article_type,
                                hotScore: response.article_list[ind].hot_score,
                                ifTop: response.article_list[ind].if_top,
                            });
                        }
                    } else {
                        this.alert(getNormalErrorAlert(response.message));
                    }
                    break;
                case 'post':
                    response = await getPostListByArticleId(20, 1,false);
                    if (response.status == 200) {
                        this.postPageNum = 2;
                        this.postList = [];
                        for (let i = 0; i < response.post_list.length; i++) {
                            this.postList.push({
                                id: response.post_list[i].post_id,
                                title: response.post_list[i].post_title,
                                content: response.post_list[i].post_content,
                                authorId: response.post_list[i].poster_id,
                                authorName: response.post_list[i].poster_name,
                                viewNum: response.post_list[i].view_count,
                                likeNum: response.post_list[i].like_count,
                                replyNum: response.post_list[i].reply_count,
                                publishTime: response.post_list[i].publish_time,
                                ifLike: response.post_list[i].if_like,
                                ifStar: response.post_list[i].if_star
                            });
                        }
                    } else {
                        this.alert(getNormalErrorAlert(response.message));
                    }
                    break;
                case 'course':
                    response = await getCourseList(1,false);
                    if (response.status == 200) {
                        this.coursePageNum = 2;
                        this.courseList = [];
                        for (let ind = 0; ind < response.course_list.length; ind++) {
                            this.courseList.push({
                                id: response.course_list[ind].course_id,
                                name: response.course_list[ind].course_name,
                                type: response.course_list[ind].course_type,
                                college: response.course_list[ind].college,
                                credit: response.course_list[ind].credits,
                                campus: response.course_list[ind].campus,
                                teacher: response.course_list[ind].teacher,
                                attendMethod: response.course_list[ind].course_method,
                                examineMethod: response.course_list[ind].assessment_method,
                                score: response.course_list[ind].score,
                                scoreSum: response.course_list[ind].all_score,
                                evaluateNum: response.course_list[ind].all_people,
                                publishTime: response.course_list[ind].publish_time,

                            });
                        }
                    } else {
                        this.alert(getNormalErrorAlert(response.message));
                    }
                    break;
            }
            done('ok');
        },
        closeDialog() {
        },
        search() {
            this.alert(getNormalInfoAlert("功能未开放..."))
        },
        async loadMore(itemType) {
            if (itemType == 'article') {
                this.loading.article = true;
                let response = await getArticleList(this.articleSortMethod, null, this.articlePageNum[this.articleSortMethod]);
                this.loading.article = false;
                if (response.status == 200) {
                    for (let ind = 0; ind < response.article_list.length; ind++) {
                        this.articleList[this.articleSortMethod].push({
                            id: response.article_list[ind].article_id,
                            title: response.article_list[ind].article_title,
                            summary: response.article_list[ind].article_summary,
                            starNum: response.article_list[ind].star_count,
                            viewNum: response.article_list[ind].view_count,
                            likeNum: response.article_list[ind].like_count,
                            publishTime: response.article_list[ind].publish_time,
                            tags: response.article_list[ind].article_tags,
                            authorName: response.article_list[ind].author_name,
                            authorId: response.article_list[ind].author_id,
                            coverLink: response.article_list[ind].cover_link,
                            type: response.article_list[ind].article_type,
                            hotScore: response.article_list[ind].hot_score,
                            ifTop:response.article_list[ind].if_top,
                        });
                    }
                    this.articlePageNum[this.articleSortMethod]++;
                    this.alert(getNormalSuccessAlert(response.message));
                } else {
                    this.alert(getNormalErrorAlert(response.message));
                }
            } else if (itemType == 'course') {
                this.loading.course = true;
                let response = await getCourseList(this.coursePageNum);
                this.loading.course = false;
                if (response.status == 200) {
                    for (let ind = 0; ind < response.course_list.length; ind++) {
                        this.courseList.push({
                            id: response.course_list[ind].course_id,
                            name: response.course_list[ind].course_name,
                            type: response.course_list[ind].course_type,
                            college: response.course_list[ind].college,
                            credit: response.course_list[ind].credits,
                            campus: response.course_list[ind].campus,
                            teacher: response.course_list[ind].teacher,
                            attendMethod: response.course_list[ind].course_method,
                            examineMethod: response.course_list[ind].assessment_method,
                            score: response.course_list[ind].score,
                            scoreSum: response.course_list[ind].all_score,
                            evaluateNum: response.course_list[ind].all_people,
                            publishTime: response.course_list[ind].publish_time,

                        });
                    }
                    this.alert(getNormalSuccessAlert("加载成功"));
                    this.coursePageNum++;
                } else {
                    this.alert(getNormalErrorAlert(response.message));
                }
            } else if (itemType == 'post') {
                //get the article 20 template  
                this.loading.post = true;
                let response = await getPostListByArticleId(20, this.postPageNum);
                this.loading.post = false;
                if (response.status == 200) {
                    for (let i = 0; i < response.post_list.length; i++) {
                        this.postList.push({
                            id: response.post_list[i].post_id,
                            title: response.post_list[i].post_title,
                            content: response.post_list[i].post_content,
                            authorId: response.post_list[i].poster_id,
                            authorName: response.post_list[i].poster_name,
                            viewNum: response.post_list[i].view_count,
                            likeNum: response.post_list[i].like_count,
                            replyNum: response.post_list[i].reply_count,
                            publishTime: response.post_list[i].publish_time,
                            ifLike: response.post_list[i].if_like,
                            ifStar: response.post_list[i].if_star
                        });
                    }
                    this.postPageNum++;
                    this.alert(getNormalSuccessAlert(response.message));
                } else {
                    this.alert(getNormalErrorAlert(response.message));
                }
            }
            /**
             * restore the last scan state
             */
            if(this.lastPageNum!=null){
                switch(itemType){
                    case "article":
                        while(this.lastPageNum.article[this.articleSortMethod]>this.articlePageNum[this.articleSortMethod]){
                            await this.loadMore(itemType);
                        }
                        break;
                    case "post":
                        while(this.lastPageNum.post>this.postPageNum){
                            await this.loadMore(itemType);
                        }
                        break;
                    case "course":
                        while(this.lastPageNum.course>this.coursePageNum){
                            await this.loadMore(itemType);
                        }
                        break;
                    default:
                        break;
                }
            }
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        addPost(item) {
            this.postList.unshift(item);
        }
    },
    async mounted() {
        //use session storage to save memory now
        let lastScanMsg = JSON.parse(selfDefinedSessionStorage.getItem("indexScanMsg"));
        if(lastScanMsg){
            this.itemType = lastScanMsg.itemType;
            this.lastPageNum=lastScanMsg.pageNum;
            this.articleSortMethod = lastScanMsg.articleSortMethod;
            await this.loadMore(this.itemType);
            setTimeout(() => {
                document.scrollingElement.scrollTop = lastScanMsg.scrollPosition;
            }, 10)
        }else{
            await this.loadMore(this.itemType);
        }
        document.getElementById('web-title').innerText = 'ShareSDU | 首页';
        this.ifMounted=true;
    }
}
</script>
<style scoped>
.load-btn {
    height: 30px;
    width: 100%;
    margin-top: 5px;
}

.sort-btn {
    margin-left: 10px;
    max-height: 25px;
}

/** desktop */
@media screen and (min-width: 1000px) {
    .full-screen {
        width: 100%;
        height: 100%;
    }

    .sort-method-bar {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
        overflow-x: scroll;
        padding: 5px;
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

    .row-center {
        display: flex;
        flex-direction: row;
        width: 100vw;
        justify-content: center;
    }

    .item-container {
        margin-bottom: 50px;
        display: flex;
        width: 750px;
        flex-direction: column;
        background-color: white;
    }
}

/** mobile */
@media screen and (max-width: 1000px) {
    .full-screen {
        width: 100vw;
        height: 100vh;
    }

    .sort-method-bar {
        width: 100vw;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
        overflow-x: scroll;
        padding: 5px;
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

    .row-center {
        display: flex;
        flex-direction: row;
        width: 100vw;
        justify-content: center;
    }

    .item-container {
        margin-bottom: 50px;
        display: flex;
        flex-direction: column;
        background-color: white;
    }
}
</style>