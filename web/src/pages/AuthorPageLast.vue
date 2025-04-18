<template>
    <div class="full-center">
        <v-card class="column-list">
            <div class="row-div padding-10px title-bold">
                <div class="name">
                    <avatar-name v-if="author.id" :init-data="{name:author.name,avatar:null}"></avatar-name>
                </div>
                <v-spacer></v-spacer>
                <v-btn @click="follow" variant="tonal" :color="followState?'grey':themeColor" class="load-btn" rounded>
                    {{ followState ? '已关注' : '关注' }}
                </v-btn>
                <v-btn variant="text" size="40" color="grey" @click="setMoreCardState(!this.ifShowMoreCard)" icon="mdi-dots-vertical">
                </v-btn>
                <v-card v-if="ifShowMoreCard" class="more-card">
                    <v-btn prepend-icon="mdi-block-helper" @click="block" variant="text" :rounded="false" :color="blockState?'grey':'black'" class="load-btn">
                        {{ blockState ? '已拉黑' : '拉黑' }}
                    </v-btn>
                    <v-btn :to="'/chat/'+String(this.author.id)" prepend-icon="mdi-send-outline" variant="text" :rounded="false" :color="themeColor" class="load-btn">
                        私信
                    </v-btn>
                </v-card>
            </div>
            <div class="row-div text-small-bold">
                <div class="msg-margin msg-text">
                    荣誉等级: {{ author.reputationLevel }}
                </div>
                <div class="msg-margin msg-text">
                    注册年份: {{ author.registrationYear }}
                </div>
            </div>
            <!-- some bug here(wait for solving), use deviceType to solve the differences between desktop and mobile -->
            <v-tabs v-if="deviceType==='desktop'" v-model="itemType" class="select-bar">
                <v-tab
                    class="tab"
                    :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'article' ? '#000000' : '#8a8a8a' }"
                    height="40px" value="article" text="文章"></v-tab>
                <v-tab
                    class="tab"
                    :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'post' ? '#000000' : '#8a8a8a' }"
                    height="40px" value="post" text="帖子"></v-tab>
            </v-tabs>
            <v-tabs v-if="deviceType==='mobile'" v-model="itemType" fixed-tabs class="select-bar">
                <v-tab
                    class="tab"
                    :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'article' ? '#000000' : '#8a8a8a' }"
                    height="40px" value="article" text="文章"></v-tab>
                <v-tab
                    class="tab"
                    :style="{ background: 'rgba(255,255,255,1)', 'color': this.itemType == 'post' ? '#000000' : '#8a8a8a' }"
                    height="40px" value="post" text="帖子"></v-tab>
            </v-tabs>
            <div v-if="itemType == 'article'" class="item-container">
                <article-item
                    v-for="(item,index) in this.articles"
                    :key="index"
                    :init-data="item">
                </article-item>
                <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
            <div v-if="itemType == 'post'" class="item-container">
                <post-item
                    v-for="(item,index) in this.posts"
                    :key="index"
                    :init-data="item">
                </post-item>
                <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
        </v-card>
    </div>
</template>
<script>
import ArticleItem from '@/components/ArticleItem.vue';
import PostItem from '@/components/PostItem.vue';
import { ref } from 'vue';
import AvatarName from '@/components/AvatarName.vue';
import { globalProperties } from '@/main';
import {blockUser,unblockUser} from '@/axios/block';
import {getCancelLoadMsg, getLoadMsg} from '@/utils/other.js';
import { getCookie } from '@/utils/cookie';
import { getAuthorInfo } from '@/axios/account';
import { scAuthorInfo } from '@/axios/api_convert/account';
import { getNetworkErrorResponse } from '@/axios/statusCodeMessages';
export default{
    name:'AuthorPage',
    setup(){
        const itemType = ref('article');
        const themeColor=globalProperties.$themeColor;
        var ifShowMoreCard=ref(false);
        var setMoreCardState=(state)=>{
            ifShowMoreCard.value=state;
        }
        const deviceType=globalProperties.$deviceType;
        /**
         * here to get the user id
         */
        const userId=getCookie('used_id');
        return{
            itemType,
            themeColor,
            deviceType,
            ifShowMoreCard,
            setMoreCardState,
            userId,
        }
    },
    components:{
        PostItem,
        ArticleItem,
        AvatarName,
    },
    data(){
        return{
            followState:false,
            lastFollowTime:0,//prevent user from clicking frequently
            author:{},
            posts:[],
            articles:[],
            blockState:false,
            lastBlockTime:0,//same function as above
            clickThreshold:3000,//ms
        }
    },
    methods:{
        async follow(){
            /**
             * follow state
             */
            const currentTime=new Date().getTime();
            if(currentTime-this.lastFollowTime>this.clickThreshold){
                /**
                 * set follow state
                 */
                this.followState=!this.followState;
            }else{
                window.alert('请勿频繁点击');
            }
            this.lastFollowTime=currentTime;
            /**
             * not set yet
             */
            this.followState=false;
        },
        async block(){
            /**
             * block state  
             */
            this.setLoading(getLoadMsg('正在设置',-1))
            const currentTime=new Date().getTime();
            if(currentTime-this.lastBlockTime>this.clickThreshold){
                /**
                 * set block state
                 */
                var response=getNetworkErrorResponse();
                if(this.blockState){//already block  
                    response=await unblockUser(this.author.id);
                    
                }else{
                    response=await blockUser(this.author.id);
                }
                if(response.status==200){
                    this.alert({
                        color: 'success',
                        title: '设置成功',
                        state: true,
                        content: response.message,
                    });
                    this.blockState=!this.blockState;
                }else{
                    this.alert({
                        color: 'error',
                        title: '设置失败',
                        state: true,
                        content: response.message,
                    });
                }
            }else{
                window.alert('请勿频繁点击');
            }
            this.setLoading(getCancelLoadMsg());
            this.lastBlockTime=currentTime;
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        alert(msg){
            this.$emit('alert',msg);
        }
    },
    async mounted(){
        this.setLoading(getCancelLoadMsg());
        /**
         * if the user is the author,then go to self page instead  
         */
        if(this.$route.params.id==getCookie("userId")){
            this.$router.push({name:'SelfPage',params:{id:getCookie("userId")}})
            return;
        }
        /**
         * already ensure the id is not the author's id  
         * get the author message
         */
        const response=await getAuthorInfo(this.$route.params.id);
        if(response.status==200){
            const tmp=scAuthorInfo(response.info);
            if(tmp.blockStatus){
                //if the user is blocked  
                this.alert({
                    color:"warning",
                    title:"用户已被屏蔽",
                    content:"用户已被屏蔽，无法查看该用户信息",
                    state:true
                })
                this.$router.push({name:'ErrorPage',params:{
                    reason:"访问的用户状态异常"
                }});
                return;
            }else{
                /**
                 * set the got data
                 */
                this.author=tmp;
            }
        }else{
            /**
             * error
             * to error page and show the alert
             */
            this.alert({color:"error",title:"加载失败",content:response.message,state:true})
            //this.$router.push({name:'ErrorPage',params:{reason:"无法找到此用户"}});
        }
    },
}
</script>
<style scoped>
.row-div{
    width: 100%;
    display: flex;
    flex-direction: row;
}
.padding-10px{
    padding: 10px;
}
.select-bar{
    margin-top: 10px;
    border-top: var(--theme-color) 2px solid;
}
.name{
    font-weight: bold;
}
.msg-margin{
    margin-left: 20px;
}
.msg-text{
    color:grey;
}
.item-container{
    display: flex;
    flex-direction: column;
}
.more-card{
    display: fixed;
    display: flex;
    flex-direction: column;
}
@media screen and (min-width: 1000px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
    .column-list{
        width: 750px;
        display: flex;
        flex-direction: column;
    }
    .tab{
        width: 375px;
        margin: 0px;
    }
}
@media screen and (max-width: 1000px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
    .column-list{
        width: 100%;
        display: flex;
        flex-direction: column;
    }
    .tab{
        min-width: 50vw;
    }
}
</style>