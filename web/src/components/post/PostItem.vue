<template>
    <v-card class="card" @click="click()" :variant="data.ifTop?'variant':'none'" :color="data.ifTop?themeColor:'none'" elevation="0">
        <div class="if-top-bar">
            <v-chip v-if="initData.ifTop" variant="text" class="ma-2 text-small-bold" :color="themeColor" prependIcon="mdi-format-vertical-align-top" style="max-height: 28px;" label>
                置顶
            </v-chip>
            <v-spacer></v-spacer>
            <v-btn @click.stop="unTop" :loading="loading.untop" :disabled="loading.untop" v-if="initData.ifTop&&ifParentAuthor" color="grey" variant="text">取消置顶</v-btn>
            <v-btn @click.stop="top" :loading="loading.top" :disabled="loading.top" v-if="!initData.ifTop&&ifParentAuthor" :color="themeColor" variant="text">置顶帖子</v-btn>
        </div>
        <div class="container">
            <div class="text-small bottom-bar avatar-name-column-center">
                <avatar-name v-if="data.authorId" :initData="{id:data.authorId,name:data.authorName}"></avatar-name>
                <v-spacer></v-spacer>
                <div v-if="data.likeNum!=null" class="bottom-item">
                    <v-icon icon="mdi-heart" size="19"></v-icon>
                    <div>{{ data.likeNum }}</div>
                </div>
                <div v-if="data.viewNum!=null" class="bottom-item">
                    <v-icon icon="mdi-eye" size="20"></v-icon>
                    <div>{{ data.viewNum }}</div>
                </div>
                <div v-if="data.replyNum!=null" class="bottom-item">
                    <v-icon icon="mdi-comment" size="18" style="margin-top: 2px;"></v-icon>
                    <div>{{ data.replyNum }}</div>
                </div>
            </div>
            <div class="title title-container key-text">
                <with-link-container :init-data="{'content':data.title,'keywords':this.searchQuery}" :clickable="false">
                </with-link-container>
            </div>
            <!--
             <div class="text-small detail-container">{{ data.content }}</div>
            -->
            <div class="text-medium detail-expand-wrapper">
                <div class="detail-expand-container">
                    <div ref="detailContent"
                        :class="['detail-expand', 'key-text', 'link-text', { collapsed: isContentCollapsed && showContentToggle }]">
                        <with-link-container :init-data="{'content':data.content,'keywords':this.searchQuery}" :clickable="false"
                            :type="'post'">
                        </with-link-container>
                    </div>
                    <div v-if="showContentToggle && isContentCollapsed" class="detail-gradient"></div>
                </div>
                <div v-if="showContentToggle" class="collapse-toggle text-small" :style="{ color: themeColor }"
                    @click.stop="toggleContentCollapse">
                    {{ isContentCollapsed ? '展开' : '收起' }}
                    <v-icon size="18" :icon="isContentCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"></v-icon>
                </div>
            </div>
            <div class="row-div-scroll">
                <img-card v-for="(img,index) in data.imgList" :height="100" :width="100" :src="img" :key="index"></img-card>
            </div>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import AvatarName from '@/components/common/AvatarName.vue';
import { ref } from 'vue';
import { copy, extractImageLinksInBrackets, getLinkInPost, getNormalErrorAlert, getNormalWarnAlert, openPage } from '@/utils/other';
import ImgCard from '@/components/common/ImgCard.vue';
import { setPostTopInArticle, setPostTopInCourse } from '@/api/modules/top';
import WithLinkContainer from '../common/WithLinkContainer.vue';
export default {
    name: 'PostItem',
    components: {
        AvatarName,
        ImgCard,
        // eslint-disable-next-line
        WithLinkContainer
    },
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id: null,
                    title: null,
                    content: null,
                    viewNum: null,
                    replyNum: null,
                    authorName: null,
                    authorId:null,
                }
            }
        },
        ifParentAuthor:{
            type:Boolean,
            default:false,
        },
        searchQuery:{
            type:Array,
            default:()=>{
                return [];
            }
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const lazyImgUrl = globalProperties.$lazyImgUrl;
        const deviceType = globalProperties.$deviceType;
        const loadState=ref(false);
        const setLoadState=(state)=>{
            loadState.value=state;
        }
        return {
            deviceType,
            lazyImgUrl,
            themeColor,
            loadState,
            setLoadState,
        }
    },
    data() {
        return {
            data:{},
            loading:{
                top:false,
                untop:false,
            },
            parent:{
                type:null,//article/course  
                id:null,
            },
            isContentCollapsed: true,
            showContentToggle: false,
        }
    },
    methods:{
        alert(msg){
            this.$emit('alert',msg);
        },
        click(){
            /**
             * to post page
             */
            if(this.data.id==null){//no id param
                openPage("router",{
                    name:'ErrorPage',
                    params:{
                        reason:"未指定资源！"
                    }
                })
                return;
            }
            openPage("url",{url:"#/post/"+this.data.id})
        },
        async top(){
            this.loading.top=true;
            let response=null;
            if(this.parent.type&&this.parent.id){
                switch(this.parent.type){
                    case 'article':
                        response=await setPostTopInArticle(this.data.id,true);                        
                        break;
                    case 'course':
                        response=await setPostTopInCourse(this.data.id,true);
                        break;
                    default:
                        response={
                            status:-1,
                            message:"type error",
                        }
                }
                if(response.status==200){
                    this.$emit("set_post_top",{
                        id:this.data.id,
                        top:true,
                    });
                }else{
                    this.alert(getNormalErrorAlert(response.message))
                }
            }else{
                this.alert(getNormalWarnAlert("请设置父级类型和父级ID"));
            }
            this.loading.top=false;
        },
        async unTop(){
            this.loading.untop=true;
            let response=null;
            if(this.parent.type&&this.parent.id){
                switch(this.parent.type){
                    case 'article':
                        response=await setPostTopInArticle(this.data.id,false);                        
                        break;
                    case 'course':
                        response=await setPostTopInCourse(this.data.id,false);
                        break;
                    default:
                        response={
                            status:-1,
                            message:"type error",
                        }
                }
                if(response.status==200){
                    this.$emit("set_post_top",{
                        id:this.data.id,
                        top:false,
                    });
                }else{
                    this.alert(getNormalErrorAlert(response.message))
                }
            }else{
                this.alert(getNormalWarnAlert("请设置父级类型和父级ID"));
            }
            this.loading.untop=false;
        },
        toggleContentCollapse() {
            if (!this.showContentToggle) {
                return;
            }
            this.isContentCollapsed = !this.isContentCollapsed;
        },
        evaluateDetailContent() {
            this.$nextTick(() => {
                if (typeof window === 'undefined') {
                    return;
                }
                const el = this.$refs.detailContent;
                if (!el) {
                    this.showContentToggle = false;
                    this.isContentCollapsed = false;
                    return;
                }
                const computedStyle = window.getComputedStyle(el);
                let lineHeightValue = parseFloat(computedStyle.lineHeight);
                if ((!lineHeightValue || isNaN(lineHeightValue)) && computedStyle.fontSize) {
                    const fontSize = parseFloat(computedStyle.fontSize);
                    if (fontSize && !isNaN(fontSize)) {
                        lineHeightValue = fontSize * 1.2;
                    }
                }
                if (!lineHeightValue || isNaN(lineHeightValue)) {
                    this.showContentToggle = false;
                    this.isContentCollapsed = false;
                    return;
                }
                const maxVisibleHeight = lineHeightValue * 3 + 1;
                const scrollHeight = el.scrollHeight;
                const needCollapse = scrollHeight - maxVisibleHeight > 1;
                const previousShowToggle = this.showContentToggle;
                this.showContentToggle = needCollapse;
                if (!needCollapse) {
                    this.isContentCollapsed = false;
                } else if (!previousShowToggle) {
                    this.isContentCollapsed = true;
                }
            });
        }
    },
    watch:{
        'data.content':{
            handler(){
                this.evaluateDetailContent();
            },
            immediate:true,
        }
    },
    mounted(){
        this.evaluateDetailContent();
    },
    beforeMount(){
        this.data =copy(this.initData);
        let link=getLinkInPost(this.data.content);
        let imgList=extractImageLinksInBrackets(this.data.content);
        this.data.link=link;
        this.data.imgList=imgList;
        if(link){
            this.parent.type=link.split('/')[1];
            this.parent.id=link.split('/')[2];
        }
    },
}
</script>
<style scoped>
.avatar-name-column-center{
    display: flex;
    align-items: center;
    margin-top:5px;
    margin-bottom:5px;
}
.detail-expand-wrapper{
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
}
.detail-expand.collapsed{
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    
}
.detail-expand-container{
    position: relative;
    width: 100%;
}
.detail-gradient{
    pointer-events: none;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 32px;
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,1) 100%);
}
.collapse-toggle{
    display: flex;
    align-items: center;
    width: fit-content;
    cursor: pointer;
    margin-top: 4px;
    gap: 2px;
}
.row-div-scroll{
    margin: 5px;
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    width: 100%;
}
.if-top-bar{
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
}
@media screen and (min-width: 1000px) {
    .card {
        width: 750px;
        margin-top: 5px;
        border-bottom: #eeeeee 1px solid;
        border-radius: 0px;
    }
    .card:hover {
        background-color: rgba(0, 0, 0, 0.04);
    }
    .container {
        display: flex;
        flex-direction: column;
        padding-top: 5px;
        padding-left: 5px;
        padding-right: 5px;
        padding-bottom: 15px;
    }
    .title-container {
        max-width: 700px;
        height: 27px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .detail-container {
        max-width: 730px;
        white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        text-overflow: ellipsis;
    }
    .detail-expand{
        max-width: 730px;
        white-space: pre-line;
        word-break: break-all;
        color: #6a6a6a;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
    }
    .detail-gradient{
        background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 65%, rgba(255,255,255,1) 100%);
    }
    .bottom-bar {
        width: 740px;
        display: flex;
        flex-direction: row;
        color: #8a8a8a;
        margin-left: 5px;
    }
    .author{
        color: var(--theme-color);
    }
    .bottom-item {
        align-items: center;
        display: flex;
        flex-direction: row;
        margin-right: 20px;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        border-bottom: #eeeeee 1px solid;
        border-radius: 0px;
        width: 100vw;
        margin-top: 1px;
    }
    .card:hover {
        background-color: rgba(0, 0, 0, 0.04);
    }
    .container {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding-top: 5px;
        padding-left: 1vw;
        padding-right: 1vw;
        padding-bottom: 15px;
    }
    .title-container {
        max-width: 90vw;
        height: 27px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .detail-container {
        color: #8a8a8a;
        padding-top: 2px;
        white-space: pre-line;
        word-break: break-all;
        overflow: hidden;
        color: #8a8a8a;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        text-overflow: ellipsis;
    }
    .detail-expand{
        color: #6a6a6a;
        padding-top: 2px;
        white-space: pre-line;
        word-break: break-all;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
    }
    .detail-gradient{
        background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,1) 100%);
    }
    .bottom-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #8a8a8a;
        margin-left: 5px;
        margin-top: 8px;
    }
    .author{
        color:var(--theme-color);
    }
    .bottom-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 10px;
    }
}
</style>