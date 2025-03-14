<template>
    <v-dialog v-model="ifShowDialog" class="full-screen dialog">
        <div class="dialog-card-container">
            <v-card v-if="ifShowCommentEditor" class="comment-editor-card">
                <div class="title-bold">评价此课程</div>
                <v-rating v-model="selfComment.score" size="medium" density="compact" style="margin: 0px; padding: 0px"
                    color="#9c0c13" :disabled="false"></v-rating>
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
                    <v-icon class="icon-right-5px comment-icon-div" icon="mdi-comment" size="20" color="grey"></v-icon>
                    <div class="text-medium top-bar-text">
                        {{ course.commentNum }}
                    </div>
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
                            学分:{{ course.credits }}
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
                <div class="visualize-score-card">
                    <div class="bar-left-container">
                        <div class="actual-score-text">
                            {{ course.avgScore }}
                            <span class="base-score-text">/5</span>
                        </div>
                        <v-rating :size="bigScoreBarSize" :model-value="course.avgScore" color="#9c0c13"
                            :disabled="true" half-increments></v-rating>
                        <div class="score-num-text">{{ course.comment }} 个评分</div>
                    </div>
                    <v-list style="width: 400px" bg-color="transparent" class="d-flex flex-column-reverse"
                        density="compact">
                        <v-list-item v-for="(score, i) in course.scores" :key="i">
                            <div class="linear-bar-container">
                                <v-icon size="20" icon="mdi-star" color="rgba(156,12,19,0.5)"></v-icon>
                                <span class="text-medium before-linear-bar-text">{{ i + 1 }}</span>
                                <v-progress-linear :max="100" :model-value="100 * score / course.comment"
                                    class="linear-bar margin-left-5px" color="#9c0c13" :height="barHeight">
                                </v-progress-linear>
                            </div>
                        </v-list-item>
                    </v-list>
                </div>
                <v-card class="self-comment-container-card" elevation="0">
                    <div class="row-div">
                        <v-rating v-model="selfComment.score" density="compact" :color="selfComment.score===null?'#8a8a8a':themeColor" :disabled="true"></v-rating>
                        <v-spacer />
                        <div v-if="oriSelfComment.score===null" class="title-bold text1">
                            暂未评价此课程
                        </div>
                        <div v-if="oriSelfComment.score!==null" class="title-bold text1">
                            我的评论
                        </div>
                    </div>
                    <div v-if="oriSelfComment.score!==null" class="text-medium self-comment-text">
                        {{ selfComment.comment }}
                    </div>
                    <v-btn @click="setCommentEditorState(true)" class="add-comment-btn" variant="tonal" :color="themeColor">
                        <div v-if="oriSelfComment.score===null" class="title-medium-bold">
                            评价此课程
                        </div>
                        <div v-if="oriSelfComment.score!==null" class="title-medium-bold">
                            修改我的评价
                        </div>
                    </v-btn>
                </v-card>
            </v-card>
            <div class="comments-container">
                <div class="comment-column">
                    <course-comment v-for="(item,index) in courseComments" 
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
import { getCourseDetail,getUserCourseEvaluation,editCourseRating,rateCourse, getCourseEvaluationList } from '@/axios/course';
import { computed,ref } from 'vue';
import { copy, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert } from '@/utils/other';
import { getCookie } from '@/utils/cookie';
import { scCourseDetail, scCourseSelfComment } from '@/axios/api_convert/course';
export default {
    name: 'CoursePage',
    components: {
        CourseComment,
        SensitiveTextArea,
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
                credits:null,
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
            courseComments: [],
            commentPageNum:1,

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
            if(this.selfComment.score!==null){
                //self evaluated  
                response=await editCourseRating({
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
            if(response.status==200){
                this.oriSelfComment=copy(this.selfComment);
                this.alert({
                    state:true,
                    color:'success',
                    title:'提交成功',
                    content:response.message,
                })
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
            let response=await getUserCourseEvaluation({
                user_id:getCookie("userId"),
                course_id:this.course.id,
            })
            this.setLoading(getCancelLoadMsg());
            if(response.status==200){
                this.selfComment=scCourseSelfComment(response);
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async getCourseCommentList(){
            this.setLoading(getLoadMsg("正在获取评分列表...",-1));
            let response=await getCourseEvaluationList(
                this.course.id,
                this.commentPageNum,
            )
            this.setLoading(getCancelLoadMsg());
            if(response.status==200){
                /**
                 * add the comment in to the list and add the page  
                 */
                 for(let ind=0;ind<response.score_list.length;ind++){
                     this.commentList.push(response.score_list[ind]);
                 }
                 this.commentPageNum++;
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        }
    },
    async mounted() {
        /**
         * get the course id from the url
         */
        this.course.id = this.$route.params.id;
        this.setLoading(getLoadMsg('正在获取课程信息...',-1))
        /**
         * get course detail
         */
        let response=await getCourseDetail(this.course.id);
        this.setLoading(getCancelLoadMsg());
        if(response.status==200){
            response=scCourseDetail(response);
            this.course=response.detail;
        }else{
            this.alert(getNormalErrorAlert(response.message));
            //this.$router.push({name:"ErrorPage",reason:"课程信息获取失败"})
            return;
        }
        /**
         * get the self comment  
         */
        await this.getSelfComment();
        await this.getCourseCommentList();
        this.oriSelfComment=copy(this.selfComment);
        console.log(this.oriSelfComment);

    },
}
</script>
<style scoped>
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
    color: grey;
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
        background-color: rgba(156, 12, 19, 0.1);
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
        color: black;
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
        background-color: rgba(156, 12, 19, 0.1);
        border-radius: 10px;
    }

    .base-score-text {
        font-size: 18px;
        color: grey;
    }

    .actual-score-text {
        font-size: 28px;
        color: black;
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