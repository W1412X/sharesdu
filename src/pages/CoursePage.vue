<template>
    <v-dialog v-model="ifShowDialog" class="full-screen dialog">
        <div class="dialog-card-container">
            <v-card v-if="ifShowCommentEditor" class="comment-editor-card">
                <div class="title-bold">评价此课程</div>
                <v-rating v-model="selfComment.score" size="medium" density="compact" style="margin: 0px; padding: 0px"
                    :color="themeColor" :disabled="false"></v-rating>
                <sensitive-text-area style="margin-top: 10px;" label="添加对此课程的评价(老师，课程难度，作业，意义)" variant="outlined" v-model="selfComment.comment"></sensitive-text-area>
                <div class="dialog-bottom-bar">
                    <v-btn @click="submitComment" class="dialog-bottom-bar-btn" variant="text" >提交</v-btn>
                    <v-btn @click="closeEditor" variant="text" class="dialog-bottom-bar-btn" >取消</v-btn>
                </div>
            </v-card>
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
                    <div class="time-container">
                        <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-clock" size="18"></v-icon>
                        <div class="text-small">
                            {{ course.publishTime }}
                        </div>
                        <v-spacer></v-spacer>
                        <span class="history-text text-small" @click="showHistory">查看历史版本</span>
                    </div>
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
                    <div v-if="this.ifRated===true" class="text-medium self-comment-text">
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
                <v-btn class="load-more-btn" variant="tonal" @click="getCourseCommentList()">加载更多</v-btn>
            </div>
        </div>
    </div>
</template>
<script>
import CourseComment from '@/components/CourseComment.vue';
import SensitiveTextArea from '@/components/SensitiveTextArea.vue';
import { globalProperties } from '@/main.js';
// eslint-disable-next-line
import { getCourseDetail,editRating, rateCourse, getUserCourseEvaluation,getCourseScoreList } from '@/axios/course';
import { computed,ref } from 'vue';
import { copy, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, getProfileUrl } from '@/utils/other';
import { getCookie } from '@/utils/cookie';
import StarButton from '@/components/StarButton.vue';
export default {
    name: 'CoursePage',
    components: {
        CourseComment,
        SensitiveTextArea,
        StarButton,
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const deviceType = globalProperties.$deviceType;
        const smallStarSize = deviceType == 'mobile' ? 20 : 30;
        const barHeight = deviceType == 'mobile' ? 8 : 11;
        const bigScoreBarSize = deviceType == 'mobile' ? 30 : 40;
        const ifShowCommentEditor=ref(false);
        const ifShowDialog=computed(()=>{
            return ifShowCommentEditor.value;
        })
        const setCommentEditorState=(state)=>{
            ifShowCommentEditor.value=state;
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
        }
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
        }
    },
    methods: {
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
            if(this.selfComment.comment==null||this.selfComment.comment.length<5){
                this.alert({
                    state:true,
                    color:'warning',
                    title:'评分失败',
                    content:'评论不可以少于5个字符',
                })
                return;
            }
            this.setLoading(getLoadMsg("正在提交您的评分...",-1));
            let response=null;
            if(this.ifRated){
                //self evaluated  
                response=await editRating({
                    course_id:this.course.id,
                    score:this.selfComment.score,
                    comment:this.selfComment.comment
                })
                this.setLoading(getCancelLoadMsg());
            }else{
                //unevaluated  
                response=await rateCourse({
                    course_id:this.course.id,
                    score:this.selfComment.score,
                    comment:this.selfComment.comment,
                })
                this.setLoading(getCancelLoadMsg());
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
            this.setLoading(getLoadMsg("正在获取评分列表...",-1));
            let response=await getCourseScoreList(this.course.id,this.commentPageNum);
            this.setLoading(getCancelLoadMsg());
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
                            authorProfileUrl:getProfileUrl(response.score_list[ind].scorer_id),
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
        async showHistory(){

        }
    },
    async mounted() {
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
            console.log(this.course);
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
}
.comment-icon-div{
    margin-top: 2px;
}
.icon-right-5px {
    margin-right: 5px;
}
.msg-item {
    min-width: 150px;
    max-width: 100%;
    width: fit-content;
    margin-right: 20px;
    margin-top: 10px;
    white-space: nowrap;
    word-break: break-all;
    overflow: hidden;
    color: grey;
}
.dialog-bottom-bar{
    width: 100%;
    display: flex;
    flex-direction: row-reverse;
}

.dialog-bottom-bar-btn{
    margin-right: 10px;
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
    white-space: normal;
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

@media screen and (min-width: 600px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
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
    }
}

@media screen and (max-width: 600px) {
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
    }
}
</style>