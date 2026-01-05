<template>
    <v-card class="card">
        <loading-content-wrapper :load-state="loadState" loading-text="正在获取创作信息...">
          <v-tabs v-model="itemType" fixed-tabs class="select-bar">
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'article' ? '#000000' : '#8a8a8a' }"
            height="40px" value="article" text="文章"></v-tab>
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'post' ? '#000000' : '#8a8a8a' }"
            height="40px" value="post" text="帖子"></v-tab>
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'reply' ? '#000000' : '#8a8a8a' }"
            height="40px" value="reply" text="回复"></v-tab>
        </v-tabs>
          <transition name="tab-fade" mode="out-in">
            <div v-if="itemType == 'article'" :key="'article'" class="column-div-scroll">
          <div class="column-div">
            <template v-if="articleList.length > 0">
                <star-item :if-star-type="false" v-for="(item, index) in this.articleList" :key="index" :init-data="item">
                </star-item>
            </template>
            <v-btn :disabled="loading.article" :loading="loading.article" v-if="this.type=='all'&&this.articleList.length>0" width="100%"  @click="loadMore('article')" variant="tonal" class="load-btn">加载更多</v-btn>
            <nothing-view v-else-if="articleList.length == 0"
                icon="mdi-book-open-outline" 
                text="暂无文章" 
                :icon-size="80"
                text-size="18px"
                min-height="300px"></nothing-view>
          </div>
        </div>
          <div v-else-if="itemType == 'post'" :key="'post'" class="column-div-scroll">
            <div class="column-div">
                <template v-if="postList.length > 0">
                    <star-item :if-star-type="false" v-for="(item, index) in this.postList" :key="index" :init-data="item">
                    </star-item>
                </template>
                <v-btn :loading="loading.post" :disabled="loading.post" v-if="this.type=='all'&&this.postList.length>0" width="100%"  @click="loadMore('post')" variant="tonal" class="load-btn">加载更多</v-btn>
                <nothing-view v-else
                    icon="mdi-forum-outline" 
                    text="暂无帖子" 
                    :icon-size="80"
                    text-size="18px"
                    min-height="300px"></nothing-view>
            </div>
        </div>
          <div v-else-if="itemType == 'reply'" :key="'reply'" class="column-div-scroll">
          <div class="column-div">
            <template v-if="replyList.length > 0">
                <star-item :if-star-type="false" v-for="(item, index) in this.replyList" :key="index" :init-data="item" :postId="item.postId" :if-preview="true">
                </star-item>
            </template>
            <v-btn :loading="loading.reply" :disabled="loading.reply" v-if="this.type=='all'&&this.replyList.length>0" width="100%"  @click="loadMore('reply')" variant="tonal" class="load-btn">加载更多</v-btn>
            <nothing-view v-else
                icon="mdi-comment-outline" 
                text="暂无回复" 
                :icon-size="80"
                text-size="18px"
                min-height="300px"></nothing-view>
          </div>
        </div>
          </transition>
        </loading-content-wrapper>
    </v-card>
</template>
<script>
import { formatRelativeTime, getNormalInfoAlert } from '@/utils/other';
import { getUserContent, getUserPreview } from '@/api/modules/account';
import StarItem from '@/components/star/StarItem.vue';
import LoadingContentWrapper from '@/components/common/LoadingContentWrapper.vue';
import NothingView from '@/components/common/NothingView.vue';

export default{
    props:{
        userId:{
            type:String,
            default:null,
        },
        type:{
            type:String,
            default:"preview",//all/preview
        }
    },
    components:{
        StarItem,
        LoadingContentWrapper,
        NothingView,
    },
    data() {
        return {
            itemType: 'article',
            articleList: [],
            postList: [],
            replyList: [],
            articlePageNum: 1,
            postPageNum: 1,
            replyPageNum: 1,
            loading:{
                article: false,
                post: false,
                reply: false,
            },
            loadState:false,
        }
    },
    watch:{
        itemType:{
            //eslint-disable-next-line
            handler(newValue,oldValue){
                if(this.type=='preview'){
                    return;
                }
                switch(newValue){
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
                    case 'reply':
                        if(this.replyList.length==0){
                            this.loadMore('reply');
                        }
                        break;
                }
            },
            immediate:false,
        }
    },
    methods:{
        async loadMore(type=null){
            let response;
            if(type==null){
                type=this.itemType;
            }
            switch(type){
                case 'article':
                    this.loading.article=true;
                    response=await getUserContent('article', this.userId, this.articlePageNum);
                    this.loading.article=false;
                    if(response.status==200){
                        for(let i=0;i<response.results.length;i++){
                            this.articleList.push({
                                type:'article',
                                id:response.results[i].id,
                                title:response.results[i].title,
                                summary:response.results[i].summary,
                                hotScore:response.results[i].hot_score,
                                replyNum:response.results[i].reply_count,
                                time:formatRelativeTime(response.results[i].publish_time),
                            })
                        }
                        this.articlePageNum++;
                    }else{
                        this.alert(getNormalInfoAlert('无更多文章'));
                    }
                    break;
                case 'post':
                    this.loading.post=true;
                    response=await getUserContent('post', this.userId, this.postPageNum);
                    this.loading.post=false;
                        if(response.status==200){
                            for(let i=0;i<response.results.length;i++){
                                this.postList.push({
                                    type:'post',
                                    id:response.results[i].id,
                                    title:response.results[i].title,
                                    content:response.results[i].content_preview,
                                    time:formatRelativeTime(response.results[i].publish_time)
                               })
                            }
                            this.postPageNum++;
                        }else{
                            this.alert(getNormalInfoAlert('无更多帖子'));
                        }
                    break;
                case 'reply':
                    this.loading.reply=true;
                    response=await getUserContent('reply', this.userId, this.replyPageNum);
                    this.loading.reply=false;
                    if(response.status==200){
                        for(let i=0;i<response.results.length;i++){
                            this.replyList.push({
                                type:'reply',
                                id:response.results[i].id,
                                title:response.results[i].content_preview,
                                time:formatRelativeTime(response.results[i].publish_time),
                                postId:response.results[i].post_id,
                            })
                            this.replyPageNum++;
                        }
                    }else{
                        this.alert(getNormalInfoAlert('无更多回复'));
                    }
                    break;
                default:
                    this.alert(getNormalInfoAlert('未知错误'));
            }
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
    },
    async mounted(){
        if(this.type=='preview'){
            let response=await getUserPreview(this.userId);
            if(response.status==200){
                for(let i=0;i<response.articles.length;i++){
                    this.articleList.push({
                        type:'article',
                        id:response.articles[i].id,
                        title:response.articles[i].title,
                        summary:response.articles[i].summary,
                        hotScore:response.articles[i].hot_score,
                        replyNum:response.articles[i].reply_count,
                        time:formatRelativeTime(response.articles[i].publish_time),
                    })
                }
                for(let i=0;i<response.posts.length;i++){
                    this.postList.push({
                        type:'post',
                        id:response.posts[i].id,
                        title:response.posts[i].title,
                        content:response.posts[i].content_preview,
                        time:formatRelativeTime(response.posts[i].publish_time)
                   })
                }
                for(let i=0;i<response.replies.length;i++){
                    this.replyList.push({
                        type:'reply',
                        id:response.replies[i].id,
                        title:response.replies[i].content_preview,
                        time:formatRelativeTime(response.replies[i].publish_time),
                        postId:response.replies[i].post_id,
                    })
                }
            }
        }else{
            await this.loadMore();
        }
        this.loadState=true;
    }
}
</script>
<style scoped>
.column-div{
    display: flex;
    flex-direction: column;
}
@media screen and (min-width: 1000px) {
    .card {
        width: 750px;
        max-height: 800px;
        height: fit-content;
        padding: 10px;
    }
    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 650px;
        height: fit-content;
        overflow: auto;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        width: 100vw;
        max-height: 90vh;
        padding: 10px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 80vh;
        height: fit-content;
        overflow: auto;
    }
}

/* 选项卡切换过渡动画 */
.tab-fade-enter-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}

.tab-fade-leave-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.tab-fade-enter-to,
.tab-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>