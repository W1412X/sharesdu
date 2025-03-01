<template>
    <div class="full-center">
        <v-card class="column-list">
            <div class="row-div padding-10px title-bold">
                <div class="name">
                    <avatar-name :init-data="{name:author.name,avatar:null}"></avatar-name>
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
                    <v-btn prepend-icon="mdi-send-outline" variant="text" :rounded="false" :color="themeColor" class="load-btn">
                        私信
                    </v-btn>
                </v-card>
            </div>
            <div class="row-div text-small-bold">
                <div class="msg-margin msg-text">
                    收藏量: {{ author.star }}
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
             * not set yet
             */
            this.alert({
                color:'warning',
                title:'功能尚未开放',
                content:'关注功能并未开放，敬请期待！',
                state:true
            })
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
                var response=null;
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
                    /**
                     * not set yet  
                     */
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
        /**
         * check the user id
         * must contain the id params
         * what's more,also need to ensure the id params is not as same as the user's  
         */
        if(this.$route.params.id!=null&&this.$route.params.id!=this.userId){
            window.alert('请勿非法访问');
        }
        /**
         * get the author message
         * not set yet
         */
    },
    created(){

    }
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
@media screen and (min-width: 600px) {
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
@media screen and (max-width: 600px) {
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