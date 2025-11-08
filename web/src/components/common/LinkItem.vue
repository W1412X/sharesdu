<template>
    <span style="padding-left: 2px;padding-right:2px;" prepend-icon="mdi-link-variant" :style="{'color':color}"
        @click="click()">
        <v-tooltip activator="parent" style="white-space: pre-line;">{{ this.detail }}</v-tooltip>
        <v-progress-circular v-if="loadState" :size="18" :rotate="360" indeterminate :color="themeColor" style="margin-right: 5px;margin-left: 5px;" :width="2"></v-progress-circular> 
        <span>
            <v-icon v-if="!loadState&&type=='link'" :color="color" icon="mdi-link-variant" size="18" ></v-icon>
            <v-icon v-if="!loadState&&type=='article'" :color="color" icon="mdi-file-document-outline" size="18" ></v-icon>
            <v-icon v-if="!loadState&&type=='post'" :color="color" icon="mdi-comment-question-outline" size="18" ></v-icon>
            <v-icon v-if="!loadState&&type=='course'" :color="color" icon="mdi-book-outline" size="18" ></v-icon>
            <v-icon v-if="!loadState&&type=='debug'" :color="color" icon="mdi-bug-outline" size="18" ></v-icon>
        </span>
        {{ text }}
    </span>
</template>
<script>
import { getAuthorInfo } from '@/api/modules/account';
import { getArticleDetail } from '@/api/modules/article';
import { getCourseDetail } from '@/api/modules/course';
import { getPostDetailById } from '@/api/modules/post';
import { globalProperties } from '@/main';
import { isExactlySameOrigin, openPage, roundNumber } from '@/utils/other';
export default {
    name: 'LinkItem',
    setup() {
        let themeColor = globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                }
            }
        },
        clickable: {
            type: Boolean,
            default: true
        }
    },
    data() {
        let data = this.initData;
        return {
            type: "link",
            data,
            color: this.themeColor,
            text:"加载中...",
            loadState:true,
            detail:"",
        }
    },
    methods: {
        async checkLink(url) {
            try {
                const response = await fetch(url, {
                    method: 'HEAD'
                });
                if (response.ok) {
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                console.error(`Error fetching link: ${url}`, error);
                return false;
            }

        },
        click(){
            if(this.clickable){
                if(!isExactlySameOrigin(this.data.link)){
                    if(window.confirm("此链接为外部链接，是否跳转？")){
                        openPage("url",{url:this.data.link});
                    }
                }else{
                    openPage("url",{url:this.data.link});
                }
            }else{
                return;
            }
        },
        async setTextByFetchLink(type,id){
            try{
                this.loadState=true;
                let response=null;
                switch(type){
                    case 'article':
                        response=await getArticleDetail(id);
                        if(response.status==200){
                            this.text=response.article_detail.article_title;
                            this.detail=response.article_detail.article_title+"\n 浏览量 "+response.article_detail.view_count+"\n @"+response.article_detail.author_name;
                        }else{
                            this.text='本站文章';
                        }
                        break;
                    case 'course':
                        response=await getCourseDetail(id);
                        if(response.status==200){
                            this.text=response.course_detail.course_name;
                            this.detail=response.course_detail.course_name+"\n 评分: "+ roundNumber(response.course_detail.all_score/response.course_detail.all_people,1)+"\n 评价人数: "+response.course_detail.all_people+"\n 课程类型: "+response.course_detail.course_type+"\n 课程学分: "+response.course_detail.credits+"\n 授课方式: "+response.course_detail.course_method+"\n 授课老师: "+response.course_detail.course_teacher;
                        }else{
                            this.text='本站课程';
                        }
                        break;
                    case 'post':
                        response=await getPostDetailById(id);
                        if(response.status==200){
                            this.text=response.post_detail.post_title;
                            this.detail='来自 @'+response.post_detail.poster_name+' 的帖子\n'+response.post_detail.post_title+'\n'+response.post_detail.post_content;
                        }else{
                            this.text='本站帖子';
                        }
                        break;
                    case 'author':
                        response=await getAuthorInfo(id);
                        if(response.status==200){
                            this.text='＠'+response.data.user_name;
                            this.detail='昵称: '+response.data.user_name+'\n等级: '+response.data.reputation_level+'\n校区: '+response.data.campus+' \n 学院: '+response.data.college+' \n专业: '+response.data.major;
                        }else{
                            this.text='@ 未知用户';
                        }
                        break;
                    case 'debug':
                        this.text="进入调试模式"
                        break;
                    default:
                        break;

                }
            }catch (e) {
                this.text='本站链接';
            }finally{
                this.loadState=false;
            }
        }
    },
    async mounted() {
        this.text="检测中...";
        this.detail=this.data.link;
        this.loadState=false;
        try{
            if(isExactlySameOrigin(this.initData.link)){
                let type = this.initData.link.match(/#\/([^/]+)\//)[1];
                let id=this.initData.link.match(/#\/[^/]+\/([^/]+)/)[1];
                await this.setTextByFetchLink(type,id);
                if(type){
                    switch (type) {
                        case 'post':
                            this.type='post';
                            break;
                        case 'article':
                            this.type='article';
                            break;
                        case 'course':
                            this.type='course';
                            break;
                        case 'author':
                            this.type='author';
                            break;
                        case 'debug':
                            this.type='debug';
                            break;
                        default:
                            this.text='内部链接';
                            break;
                    }
                }else{
                    this.text='内部链接';
                }
            }else{
                this.text='外部链接';
            }
        }catch (e) {
            this.text='未知链接';
        }
        this.color=this.themeColor;
    }
}
</script>
<style scoped> 

.span{
    padding:2px;
    width: fit-content;
    height: 100%;
}
</style>