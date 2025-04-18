<template>
    <v-dialog v-model="ifShowDialog" class="full-screen dialog">
        <div class="dialog-card-container">
            <v-card v-if="ifShowCommentEditor" class="comment-editor-card">
                <div class="title-bold">评价此课程</div>
                <v-rating v-model="selfComment.score" size="medium" density="compact" style="margin: 0px; padding: 0px"
                    :color="themeColor" :disabled="false"></v-rating>
                <div class="row-div">
                    <sensitive-text-area style="margin-top: 10px;" label="添加对此课程的评价(老师，课程难度，作业，意义)" variant="outlined" v-model="selfComment.comment"></sensitive-text-area>
                    <emoji-picker @emoji="addEmoji"></emoji-picker>
                </div>
                <div class="dialog-bottom-bar">
                    <v-btn :loading="loading.submitEvaluation" :disabled="loading.submitEvaluation" @click="submitComment" class="dialog-bottom-bar-btn" variant="text" >发表</v-btn>
                    <v-btn @click="closeEditor" variant="text" class="dialog-bottom-bar-btn" >取消</v-btn>
                </div>
            </v-card>
            <post-editor v-if="ifShowPostEditor" @add_post="addPost" @close="closePostEditor" @alert="alert" @set_loading="setLoading" :type-msg="{type:'course',id:this.course.id}"></post-editor>
            <course-editor v-if="ifShowCourseEditor" @alert="alert" @set_loading="setLoading" :init-data="this.course" @close="setCourseEditorState(false)"></course-editor>
            <course-history-card v-if="ifShowHistory" :id="this.course.id" @close="setHistoryState(false)" @set_loading="setLoading" @alert="alert"></course-history-card>
        </div>
    </v-dialog>
    <div class="full-center">
        <div class="column-div">
            <v-card class="course-card">
                <div class="row-div">
                    <div class="course-name">
                        {{ course.name }}
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn @click="setCourseEditorState(true)" style="margin-right:10px;max-width: 25px;max-height: 25px;border-radius: 100%;" elevation="0" icon variant="text">
                        <v-icon icon="mdi-book-edit-outline" size="22" :color="'#8a8a8a'"></v-icon>
                        <v-tooltip activator="parent">如课程信息有误，您可以提交修改</v-tooltip>
                    </v-btn>
                    <star-button :id="this.course.id" :type="'course'" @alert="alert" @set_loading="setLoading" :state="this.course.ifStar"></star-button>
                    <!--
                    <v-icon class="icon-right-5px" icon="mdi-star" size="22" color="grey"></v-icon>
                    <div class="text-medium top-bar-text">
                        {{ course.star }}
                    </div>
                    -->
                </div>
                <div class="msg-container">
                    <div class="row-div">
                        <div class="msg-item">
                            课程类型:{{ course.type }}
                        </div>
                        <div class="msg-item">
                            授课教师:{{ course.teacher }}
                        </div>
                        <div class="msg-item">
                            教学方式:{{ course.attendMethod }}
                        </div>
                        <div class="msg-item">
                            学分:{{ course.credit }}
                        </div>
                    </div>
                    <div class="row-div">
                        <div class="msg-item">
                            开设校区:{{ course.campus }}
                        </div>
                        <div class="msg-item">
                            开设学院:{{ course.college }}
                        </div>
                        <div class="msg-item">
                            考核方式:{{ course.examineMethod }}
                        </div>
                    </div>
                </div>
                <div class="time-container">
                        <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-clock" size="18"></v-icon>
                        <div class="text-small">
                            {{ course.publishTime }}
                        </div>
                        <v-spacer></v-spacer>
                        <span class="history-text text-small" @click="showHistory">查看历史版本</span>
                </div>
                <div class="visualize-score-card">
                    <div class="bar-left-container">
                        <div class="actual-score-text">
                            {{ course.avgScore }}
                            <span class="base-score-text">/5</span>
                        </div>
                        <v-rating :size="bigScoreBarSize" :model-value="course.avgScore" :color="themeColor"
                            :disabled="true" half-increments></v-rating>
                        <div class="score-num-text">{{ course.evaluateNum }} 个评分</div>
                    </div>
                    <v-list style="width: 400px" bg-color="transparent" class="d-flex flex-column-reverse"
                        density="compact">
                        <v-list-item v-for="(score, i) in course.scoreDistribution" :key="i">
                            <div class="linear-bar-container">
                                <v-icon size="20" icon="mdi-star" :color="themeColor"></v-icon>
                                <span class="text-medium before-linear-bar-text">{{ i + 1 }}</span>
                                <v-progress-linear :max="100" :model-value="100 * score / course.evaluateNum"
                                    class="linear-bar margin-left-5px" :color="themeColor" :height="barHeight">
                                </v-progress-linear>
                            </div>
                        </v-list-item>
                    </v-list>
                </div>
                <v-card class="self-comment-container-card" elevation="0">
                    <div class="row-div">
                        <v-rating v-model="selfComment.score" density="compact" :color="selfComment.score===null?'#8a8a8a':themeColor" :disabled="true"></v-rating>
                        <v-spacer />
                        <div v-if="this.ifRated===false" class="title-bold text1">
                            暂未评价此课程
                        </div>
                        <div v-if="this.ifRated===true" class="title-bold text1" :color="themeColor">
                            我的评论
                        </div>
                    </div>
                    <div v-if="this.ifRated===true" class="text-medium self-comment-text support-line-feed">
                        {{ selfComment.comment }}
                    </div>
                    <v-btn @click="setCommentEditorState(true)" class="add-comment-btn" variant="tonal" :color="themeColor">
                        <div v-if="this.ifRated===false" class="title-medium-bold">
                            评价此课程
                        </div>
                        <div v-if="this.ifRated===true" class="title-medium-bold">
                            修改我的评价
                        </div>
                    </v-btn>
                </v-card>
            </v-card>
            <div class="comments-container">
                <div class="comment-column">
                    <course-comment v-for="(item,index) in commentList" 
                        :init-data="item"
                        :key="index"    
                    ></course-comment>
                </div>
                <v-btn :loading="loading.loadEvaluation" :disabled="loading.loadEvaluation" class="load-more-btn" variant="tonal" @click="getCourseCommentList()">加载更多</v-btn>
            </div>
            <div class="bottom-bar">
                <div class="column-center user-name text-medium">
                    {{ userName }}
                </div>
                <v-spacer class="spacer"></v-spacer>
                <div class="row-reverse">
                    <div class="column-center padding-right-5px">
                        <alert-button :id="this.course.id" :type="'course'"></alert-button>
                    </div>
                    <!-- wait to do
                    <div class="column-center padding-right-5px">
                        <v-btn elevation="0" @click="setCourseEditorState(true)" icon class="bottom-btn">
                            <v-icon icon="mdi-pencil-outline" size="24"></v-icon>
                        </v-btn>
                    </div>
                    -->
                    <div class="column-center padding-right-10px">
                        <v-btn elevation="0" @click="showPost" icon class="bottom-btn">
                            <v-icon icon="mdi-comment-outline" size="24"></v-icon>
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <v-overlay v-model="ifShowPost" class="posts-dialog">
        <div id="post-container" class="posts-container">
            <div style="display: flex;flex-direction: column;width: 100%;">
                <v-btn @click="setPostEditorState(true)" variant="tonal" :color="themeColor">
                    发表帖子
                </v-btn>
                <post-item v-for="(item,index) in postItems" :init-data="item" :key="index">
                </post-item>
                <v-btn @click="loadMorePost" :loading="loading.post" :disabled="loading.post" v-if="this.postItems.length!==0" variant="tonal" class="load-btn">加载更多</v-btn>
            </div>
        </div>
    </v-overlay>
</template>
<script>
import CourseComment from '@/components/CourseComment.vue';
import SensitiveTextArea from '@/components/SensitiveTextArea.vue';
import { globalProperties } from '@/main.js';
// eslint-disable-next-line
import { getCourseDetail,editRating, rateCourse, getUserCourseEvaluation,getCourseScoreList, getCoursePostList } from '@/axios/course';
import { computed,ref } from 'vue';
import { copy, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import { getCookie } from '@/utils/cookie';
import StarButton from '@/components/StarButton.vue';
import PostEditor from '@/components/PostEditor.vue';
import PostItem from '@/components/PostItem.vue';
import AlertButton from '@/components/AlertButton.vue';
import CourseEditor from '@/components/CourseEditor.vue';
import { addHistory } from '@/utils/history';
import EmojiPicker from '@/components/EmojiPicker.vue';
import CourseHistoryCard from '@/components/CourseHistoryCard.vue';
export default {
    name: 'CoursePage',
    components: {
        CourseComment,
        SensitiveTextArea,
        StarButton,
        PostEditor,
        PostItem,
        AlertButton,
        CourseEditor,
        EmojiPicker,
        CourseHistoryCard,
    },
    setup() {
        const userName=getCookie("userName");
        const themeColor = globalProperties.$themeColor;
        const deviceType = globalProperties.$deviceType;
        const smallStarSize = deviceType == 'mobile' ? 20 : 30;
        const barHeight = deviceType == 'mobile' ? 8 : 11;
        const bigScoreBarSize = deviceType == 'mobile' ? 30 : 40;
        const ifShowCommentEditor=ref(false);
        const ifShowPostEditor=ref(false);
        const ifShowPost=ref(false);
        const ifShowCourseEditor=ref(false);
        const ifShowHistory=ref(false);
        const setPostEditorState=(state)=>{
            ifShowPostEditor.value=state;
        };
        const setPostState=(state)=>{
            ifShowPost.value=state;
        };
        const setHistoryState=(state)=>{
            ifShowHistory.value=state;
        };
        const ifShowDialog=computed(()=>{
            return ifShowCommentEditor.value || ifShowPostEditor.value || ifShowCourseEditor.value || ifShowHistory.value;
        })
        const setCommentEditorState=(state)=>{
            ifShowCommentEditor.value=state;
        }
        const setCourseEditorState=(state)=>{
            ifShowCourseEditor.value=state;
        }
        return {
            themeColor,
            deviceType,
            smallStarSize,
            barHeight,
            bigScoreBarSize,
            ifShowCommentEditor,
            ifShowDialog,
            setCommentEditorState,
            ifShowPost,
            setPostEditorState,
            ifShowPostEditor,
            userName,
            setPostState,
            ifShowCourseEditor,
            setCourseEditorState,
            ifShowHistory,
            setHistoryState,
        }
    },
    beforeRouteLeave (to, from, next) {
        //use session storage to save memory now  
        let scanMsg={};
        scanMsg.course=this.course;
        scanMsg.commentList=this.commentList;
        scanMsg.commentPageNum=this.commentPageNum;
        scanMsg.postItems=this.postItems;
        scanMsg.postPageNum=this.postPageNum;
        scanMsg.selfComment=this.selfComment;
        scanMsg.oriSelfComment=this.oriSelfComment;
        scanMsg.scrollTop=document.scrollingElement.scrollTop;
        scanMsg.postState=this.ifShowPost;
        if(scanMsg.postState){
            scanMsg.postScrollTop=document.getElementById("post-container").scrollTop;
        }
        let key='courseScanMsg|'+this.course.id;
        scanMsg.ifRated=this.ifRated;
        sessionStorage.setItem(key,JSON.stringify(scanMsg));
        next()
    },
    data() {
        return {
            course: {
                id: null,
                name: null,
                type: null,
                campus: null,
                college: null,
                teacher: null,
                credit:null,
                examineMethod: null,//examine method
                attendMethod: null,//attend class method
                score: null,
                scores: null,//array from 1 to 5 []
                commentNum: null,
                star: null,//wait to do
                publishTime:null,
                relative_articles:null,//list
            },
            selfComment: {
                score:null,
                comment: null,
            },
            oriSelfComment:{
                score:null,
                comment: null,
            },
            commentList: [],
            commentPageNum:1,
            ifRated:false,
            postItems:[],
            postPageNum:1,
            loading:{
                loadEvaluation:false,
                post:false,
                submitEvaluation:false,
            }
        }
    },
    methods: {
        addEmoji(emoji) {
            this.selfComment.comment+=emoji;
        },
        async showPost(){
            this.loadMorePost();
            this.setPostState(true);
        },
        async loadMorePost(){
            this.loading.post=true;
            let response=await getCoursePostList(this.course.id,this.postPageNum);
            if(response.status==200){
                for(let i=0;i<response.post_list.length;i++){
                    this.postItems.push({
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
            }else{
                this.alert(getNormalErrorAlert(response.data.message));
            }
            this.loading.post=false;
        },
        closeEditor(){
            this.selfComment=copy(this.oriSelfComment);
            this.setCommentEditorState(false);
        },
        async submitComment(){
            if(this.selfComment.score==0||this.selfComment.score==null){
                this.alert({
                    state:true,
                    color:'warning',
                    title:'评分失败',
                    content:'请选择您的评分',
                })
                return;
            }
            this.loading.submitEvaluation=true;
            let response=null;
            if(this.ifRated){
                //self evaluated  
                response=await editRating({
                    course_id:this.course.id,
                    score:this.selfComment.score,
                    comment:this.selfComment.comment
                })
                this.loading.submitEvaluation=false;
            }else{
                //unevaluated  
                response=await rateCourse({
                    course_id:this.course.id,
                    score:this.selfComment.score,
                    comment:this.selfComment.comment,
                })
                this.loading.submitEvaluation=false;
            }
            if(response.status==200||response.status==201){
                this.oriSelfComment=copy(this.selfComment);
                this.alert(getNormalSuccessAlert("提交成功"));
                this.ifRated=true;
            }else{
                this.selfComment=copy(this.oriSelfComment);
                this.alert(getNormalErrorAlert(response.message));
            }
            this.setCommentEditorState(false);
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        async getSelfComment(){
            this.setLoading(getLoadMsg("正在加载您的评分...", -1));
            let response=await getUserCourseEvaluation(getCookie("userId"),this.course.id)
            this.setLoading(getCancelLoadMsg());
            if(response.status==200){
                this.selfComment={
                    score:response.score,
                    comment:response.comment,
                }
                this.oriSelfComment=copy(this.selfComment);
                this.alert(getNormalSuccessAlert("成功获取您的评分"));
                this.ifRated=true;
            }else{
                //do nothing
            }
        },
        async getCourseCommentList(){
            this.loading.loadEvaluation=true;
            let response=await getCourseScoreList(this.course.id,this.commentPageNum);
            this.loading.loadEvaluation=false;
            if(response.status==200){
                /**
                 * add the comment in to the list and add the page  
                 */
                 for(let ind=0;ind<response.score_list.length;ind++){
                    if(response.score_list[ind].scorer_id!=getCookie("userId")){
                        this.commentList.push({
                            id:response.score_list[ind].review_id,
                            authorId:response.score_list[ind].scorer_id,
                            authorName:response.score_list[ind].scorer_name,
                            score:response.score_list[ind].score,
                            comment:response.score_list[ind].comment,
                            time:response.score_list[ind].publish_time,
                        });
                    }
                 }
                 this.commentPageNum++;
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        showHistory(){
            this.setHistoryState(true)
        },
        addPost(item){
            this.postItems.unshift(item);
        },
        closePostEditor(){
            this.setPostEditorState(false);
        }
    },
    async mounted() {
        if(sessionStorage.getItem('courseScanMsg|'+this.$route.params.id)){
            let scanMsg=JSON.parse(sessionStorage.getItem('courseScanMsg|'+this.$route.params.id));
            this.course=scanMsg.course;
            this.postItems=scanMsg.postItems;
            this.postPageNum=scanMsg.postPageNum;
            this.commentList=scanMsg.commentList;
            this.commentPageNum=scanMsg.commentPageNum;
            this.selfComment=scanMsg.selfComment;
            this.oriSelfComment=scanMsg.oriSelfComment;
            this.ifRated=scanMsg.ifRated;
            this.setPostState(scanMsg.postState);
            await addHistory("course",this.course.id,this.course.name);
            document.getElementById('web-title').innerText='课程 | '+this.course.name;
            setTimeout(()=>{
                document.scrollingElement.scrollTop=scanMsg.scrollTop;
                if(scanMsg.postState){
                    document.getElementById("post-container").scrollTop=scanMsg.postScrollTop;
                }
            },10);
            return;
        }
        this.setLoading(getCancelLoadMsg());
        /**
         * get the course id from the url
         */
        /**
         * get course detail
         */
        this.course.id = this.$route.params.id;
        this.setLoading(getLoadMsg('正在获取课程信息...',-1))
        let response=await getCourseDetail(this.course.id);
        this.setLoading(getCancelLoadMsg());
        if(response.status==200){
            let avgScore=0;
            if(response.course_detail.all_people!=0){
                avgScore=response.course_detail.all_score/response.course_detail.all_people;
            }
            this.course={
                id:response.course_detail.course_id,
                name:response.course_detail.course_name,
                type:response.course_detail.course_type,
                credit:response.course_detail.credits,
                teacher:response.course_detail.course_teacher	,
                attendMethod:response.course_detail.course_method,
                examineMethod:response.course_detail.assessment_method,
                publishTime:response.course_detail.publish_time,
                campus:response.course_detail.campus,
                college:response.course_detail.college,
                evaluateNum:response.course_detail.all_people,
                avgScore:avgScore,
                scoreDistribution:response.course_detail.score_distribution,
            }
            await addHistory("course",this.course.id,this.course.name);
            document.getElementById('web-title').innerText='课程 | '+this.course.name;
            this.alert(getNormalSuccessAlert("获取课程信息成功"));
        }else{
            this.alert(getNormalErrorAlert(response.message));
            //this.$router.push({name:"ErrorPage",reason:"课程信息获取失败"})
            return;
        }
        await this.getSelfComment();
        await this.getCourseCommentList();
    },
}
</script>
<style scoped>
.time-container{
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 10px;
    color: #8a8a8a;
}
.history-text{
    color: #8a8a8a;
    text-decoration: underline;
    margin-left: 10px;
    margin-right: 10px;
}
.before-linear-bar-text {
    color: grey;
    font-size: 14px;
}
.row-div {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.column-scroll-div{
    display: flex;
}
.comment-icon-div{
    margin-top: 2px;
}
.icon-right-5px {
    margin-right: 5px;
}
.bottom-btn{
    width: 23px;
    height: 23px;
    color:#8a8a8a;
    background-color:rgba(0, 0, 0,0);
}
.msg-item {
    width: fit-content;
    margin-right: 20px;
    margin-top: 10px;
    white-space: nowrap;
    word-break: break-all;
    color: grey;
}
.dialog-bottom-bar{
    width: 100%;
    display: flex;
    flex-direction: row-reverse;
}
.column-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}
.dialog-bottom-bar-btn{
    margin-right: 10px;
}


.column-div{
    display: flex;
    flex-direction: column;
}

.msg-container {
    width: 100%;
    overflow-x: scroll;
    display: flex;
    flex-direction: column;
}
.load-more-btn{
    width: 100%;
}
.dialog-card-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.self-comment-text{
    width: 100%;
    white-space: pre-line;
    margin-top: 10px;
    word-break: break-all;
    overflow: hidden;
}

.text1 {
    margin-top: 5px;
    margin-right: 5px;
    color: var(--theme-color);
}

.top-bar-text{
    margin-right: 10px;
    color: grey;
}

.padding-right-5px {
    padding-right: 5px;
}
.padding-right-10px {
    padding-right: 10px;
}

@media screen and (min-width: 1000px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
    .bottom-bar {
        display: flex;
        width: 800px;
        flex-direction: row;
        position: fixed;
        bottom: 0;
        height: 40px;
        z-index:99;
        border: #8a8a8a 1px solid;
        background-color: #ffffff;
    }
    .comment-editor-card{
        display: flex;
        width: 600px;
        flex-direction: column;
        padding:10px;
    }
    .course-name {
        font-weight: bold;
        font-size: 22px;
        padding-left: 10px;
        width: 750px;
        white-space: normal;
        word-break: break-all;
        overflow: hidden;
    }
    .user-name {
        margin-left: 10px;
        max-width: 300px;
        color: var(--theme-color);
    }
    .course-card {
        width: 800px;
        padding: 15px;
        display: flex;
        flex-direction: column;
    }

    .visualize-score-card {
        margin-top: 20px;
        background-color: var(--theme-color-transparent);
        border-radius: 10px;
        width: 770px;
        display: flex;
        flex-direction: row;
    }

    .base-score-text {
        color: grey;
        font-size: 20px;
    }

    .posts-dialog{
        padding:0px;
        display: flex;
        flex-direction: row-reverse;
    }
    .posts-container{
        background-color: #ffffff;
        border-top: #8a8a8a 1px solid;
        width: 752px;
        padding:1px;
        height: 100vh;
        overflow-y: scroll;
    }

    .actual-score-text {
        font-size: 36px;
        color: var(--theme-color);
    }

    .score-num-text {
        margin-top: 5px;
        color: grey;
        font-size: 16px;
    }

    .linear-bar-container {
        align-items: center;
        width: 440px;
        display: flex;
        flex-direction: row;
    }

    .bar-left-container {
        width: 330px;
        display: flex;
        height: 216px;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .margin-left-5px {
        margin-left: 5px;
    }

    .linear-bar {
        width: 450px;
    }

    .self-comment-container-card {
        margin-top: 10px;
        padding: 10px;
        width: 770px;
        display: flex;
        flex-direction: column;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 10px;
    }

    .add-comment-btn {
        margin-top: 10px;
        width: 100%;
    }

    .comments-container {
        background-color: #ffffff;
        border-top: #8a8a8a 1px solid;
        width: 100%;
        padding: 1px;
        margin-bottom: 40px;
        height: fit-content;
        overflow-y: scroll;
    }

    .comment-column{
        max-width: 800px;
        display: flex;
        flex-direction: column;
        background-color: white;
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

    .course-card {
        width: 100vw;
        padding: 1vw;
        display: flex;
        flex-direction: column;
    }
    .comment-editor-card{
        display: flex;
        width: 80vw;
        flex-direction: column;
        padding:10px;
    }
    .bottom-bar {
        display: flex;
        width: 100vw;
        flex-direction: row;
        position: fixed;
        bottom: 0;
        height: 40px;
        z-index:99;
        border: #8a8a8a 1px solid;
        background-color: #ffffff;
    }
    .user-name {
        margin-left: 2vw;
        width: 30vw;
        color: var(--theme-color);
    }
    .visualize-score-card {
        margin-top: 10px;
        width: 98vw;
        display: flex;
        flex-direction: row;
        background-color: var(--theme-color-transparent);
        border-radius: 10px;
    }

    .base-score-text {
        font-size: 18px;
        color: grey;
    }

    .actual-score-text {
        font-size: 28px;
        color: var(--theme-color);
    }

    .score-num-text {
        margin-top: 5px;
        color: grey;
        font-size: 14px;
    }

    .linear-bar-container {
        align-items: center;
        width: 55vw;
        display: flex;
        flex-direction: row;
    }

    .bar-left-container {
        width: 45vw;
        height: 216px;
        align-items: center;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    .margin-left-5px {
        margin-left: 5px;
    }

    .course-name {
        font-size: 20px;
        font-weight: bold;
        padding-left: 10px;
        width: 85vw;
        white-space: normal;
        word-break: break-all;
        overflow: hidden;
    }

    .self-comment-container-card {
        margin-top: 10px;
        padding: 10px;
        width: 98vw;
        display: flex;
        flex-direction: column;
        background-color: grey;
        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0.05);
    }

    .linear-bar {
        width: 45vw;
    }

    .add-comment-btn {
        margin-top: 10px;
        width: 100%;
    }

    .comments-container {
        background-color: #ffffff;
        border-top: #8a8a8a 1px solid;
        width: 100%;
        padding: 1px;
        margin-bottom: 40px;
        height: fit-content;
        overflow-y: scroll;
    }
    .comment-column{
        width: 100vw;
        display: flex;
        flex-direction: column;
        background-color: white;
    }
    .posts-dialog{
        padding:0px;
        display: flex;
        flex-direction: column-reverse;
    }
    .posts-container{
        background-color: #ffffff;
        border-top: #8a8a8a 1px solid;
        width: 100vw;
        height: 60vh;
        overflow-y: scroll;
        border-radius: 5px;
    }
}
</style>