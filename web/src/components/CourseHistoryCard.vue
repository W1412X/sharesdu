<template>
    <v-card class="card">
        <div class="row-reverse-div">
            <v-btn size="20" style="margin-bottom: 10px;" color="#8a8a8a" variant="text" icon="mdi-close"
                @click="close"></v-btn>
        </div>
        <div class="column-div-scroll">
            <div class="column-div">
                <v-card v-for="(course, index) in this.courses" class="course-item" :key="index">
                    <div class="row-div text-tiny tip-text">
                        <avatar-name :init-data="{ name: course.operator, id: course.operator_id }" size="22" color="grey"
                            :name-size="14"></avatar-name>
                        <div class="text-small" style="margin-left: 5px;"> 于 {{ course.time }} 提交修改 </div>
                    </div>
                    <div class="text-title-bold" style="margin-top: 5px;">
                        {{ course.preview.course_name }}
                    </div>
                    <div class="row-div">
                        <div class="text-medium tip-text msg-div">
                            学分 : {{ course.preview.credits }}
                        </div>
                        <div class="text-medium  tip-text msg-div">
                            教师 : {{ course.preview.course_teacher }}
                        </div>
                        <div class="text-medium  tip-text msg-div">
                            考核 : {{ course.preview.assessment_method }}
                        </div>
                    </div>
                    <div class="text-tiny-bold row-div tip-text">
                        <div @click="rollback(course.version)" v-if="type=='admin'" class="text-tiny-bold">
                            <span>回滚</span>
                            <v-tooltip>
                                回滚此课程至版本 {{ course.version }}
                            </v-tooltip>
                        </div>
                        <v-spacer />
                        <span>{{ '版本 : ' + course.version }}</span>
                    </div>
                </v-card>
                <v-btn @click="loadMore" v-if="this.courses.length>=10" variant="tonal" width="100%" color="grey">加载更多</v-btn>
            </div>
        </div>
    </v-card>
</template>
<script>
import { extractTime, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import AvatarName from './AvatarName.vue';
import { getCourseHistory, rollbackCourse } from '@/axios/course';

export default {
    props: {
        id: {
            type: String,
            default: null
        },
        type: {
            type: String,
            default: 'user',//user/admin
        }
    },
    setup() {

    },
    components: {
        AvatarName,
    },
    data() {
        return {
            courses: [
            ],
            page: 1,
        }
    },
    methods: {
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        close() {
            this.$emit('close');
        },
        async rollback(version){
            this.setLoading(getLoadMsg("正在回滚..."));
            let response=await rollbackCourse(this.id,version);
            this.setLoading(getCancelLoadMsg());
            if(response.status==200){
                this.alert(getNormalSuccessAlert("回滚成功"));
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async loadMore(){
            this.setLoading(getLoadMsg('正在加载课程历史记录...'))
            let response = await getCourseHistory(this.id, this.page);
            this.setLoading(getCancelLoadMsg());
            if (response.status == 200) {
                this.page++;
                for (let i = 0; i < response.data.histories.length; i++) {
                    this.courses.push({
                        operator: response.data.histories[i].operator,
                        time: extractTime(response.data.histories[i].modified_at),
                        preview: response.data.histories[i].snapshot_preview,
                        version: response.data.histories[i].version,
                        operator_id: response.data.histories[i].operator_id,
                    })
                }
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        }
    },
    async mounted() {
        await this.loadMore();
    },
}
</script>
<style scoped>
.course-item {
    margin: 3px;
    padding: 10px;
}

.tip-text {
    color: grey;
}

.msg-div {
    margin-right: 20px;
    width: fit-content;
}

.preview-div {
    margin: 5px;
    width: 100%;
    white-space: pre-line;
    word-break: break-all;
    overflow: hidden;
}

.column-div {
    display: flex;
    flex-direction: column;
    height: fit-content;
}

.row-reverse-div {
    margin-top: 5px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    margin-bottom: 5px;
}

.row-div {
    display: flex;
    flex-direction: row;
    height: 100%;
    align-items: center;
    overflow-x: scroll;
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
</style>