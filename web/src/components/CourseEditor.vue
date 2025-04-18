<template>
    <v-card class="card">
        <div class="content-div">
            <div class="title-bold">编辑课程</div>
            <sensitive-text-field v-model="data.name" class="title-input" label="课程名称" variant="outlined" density="compact"></sensitive-text-field>
            <div class="item-div">
                <sensitive-text-area
                    v-model="data.teacher"
                    label="授课教师"
                    variant="outlined"
                    density="compact"
                    rows="1"
                    max-rows="1"
                    max-width="300px"
                    class="item"
                ></sensitive-text-area>
                <v-select
                    v-model="data.type"
                    variant="outlined"
                    density="compact"
                    class="item"
                    :items="types"
                    chips
                    label="课程类型"
                ></v-select>
                <sensitive-text-area
                    v-model="data.credit"
                    label="课程学分(整数/小数)"
                    variant="outlined"
                    density="compact"
                    rows="1"
                    max-rows="1"
                    max-width="300px"
                    class="item"
                ></sensitive-text-area>
            </div>
            <div class="item-div">
                <v-select
                    v-model="data.college"
                    variant="outlined"
                    density="compact"
                    class="item"
                    :items="colleges"
                    label="开设学院"
                ></v-select>
                <v-select
                    v-model="data.campus"
                    variant="outlined"
                    density="compact"
                    class="item"
                    :items="campus"
                    label="开设校区"
                ></v-select>
            </div>
            <div class="item-div">
                <v-select
                    v-model="data.examineMethod"
                    variant="outlined"
                    density="compact"
                    class="item"
                    :items="examineMethods"
                    label="考核方式"
                ></v-select>
                <v-select
                    v-model="data.attendMethod"
                    variant="outlined"
                    density="compact"
                    class="item"
                    :items="teachMethods"
                    label="上课方式"
                ></v-select>
            </div>
            <div class="bottom-btn-div">
                <v-btn variant="text" :loading="loading" :disabled="loading" class="btn" density="compact" @click="submit">{{ this.data.id?'提交修改':'发布' }}</v-btn>
                <v-btn variant="text" class="btn" density="compact" @click="close">取消</v-btn>
            </div>
        </div>
    </v-card>
</template>
<script>
import { getCurrentInstance } from 'vue';
import SensitiveTextArea from './SensitiveTextArea.vue';
import SensitiveTextField from './SensitiveTextField.vue';
import { createCourse,/*, getCourseDetail,editCourse*/ 
editCourse} from '@/axios/course';
import { getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';

export default {
    name: 'CourseEditor',
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id: null,
                    name: null,
                    teacher: null,
                    type: null,//course type
                    college: null,
                    campus: null,
                    examineMethod:null,
                    attendMethod:null,//method to take course  
                    credit:null,
                }
            }
        }
    },
    components:{
        SensitiveTextArea,
        SensitiveTextField
    },
    setup(){
        const types=getCurrentInstance().appContext.config.globalProperties.$courseTypes;
        const colleges=getCurrentInstance().appContext.config.globalProperties.$colleges;
        const campus=getCurrentInstance().appContext.config.globalProperties.$campus;
        const teachMethods=getCurrentInstance().appContext.config.globalProperties.$teachMethods;
        const examineMethods=getCurrentInstance().appContext.config.globalProperties.$examineMethods;
        return{
            types,
            colleges,
            campus,
            teachMethods,
            examineMethods
        }
    },
    data(){
        const data=this.initData;
        return {
            data,
            loading:false,
        }
    },
    methods: {
        close() {
            this.$emit('close')
        },
        async submit() {
            if(this.data.id){
                await this.edit();
            }else{
                await this.create();
            }
        },
        async create(){
            this.loading=true;
            let type=null;
            switch(this.data.type){
                case "必修课":
                    type='compulsory';
                    break;
                case "选修课":
                    type='elective';
                    break;
                case "限选课":
                    type='restricted_elective';
                    break;
                default:
                    type='other';
                    break;
            }
            let attendMethod=null;
            switch (this.data.attendMethod) {
                case "线下":
                    attendMethod='offline';
                    break;
                case "线上":
                    attendMethod='online';
                    break;
                case "混合":
                    attendMethod='hybrid';
                    break;
                default:
                    attendMethod='other';
                    break;
            }
            let response=await createCourse({
                course_name:this.data.name,
                course_type:type,
                college:this.data.college,
                campus:this.data.campus,
                course_teacher:this.data.teacher,
                course_method:attendMethod,
                assessment_method:this.data.examineMethod,
                credits:this.data.credit,
            })
            this.loading=false;
            if(response.status==200||response.status==201){
                this.alert(getNormalSuccessAlert("课程创建成功"));
                this.close();
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        async edit(){
            this.loading=true;
            let type=null;
            switch(this.data.type){
                case "必修课":
                    type='compulsory';
                    break;
                case "选修课":
                    type='elective';
                    break;
                case "限选课":
                    type='restricted_elective';
                    break;
                default:
                    type='other';
                    break;
            }
            let attendMethod=null;
            switch (this.data.attendMethod) {
                case "线下":
                    attendMethod='offline';
                    break;
                case "线上":
                    attendMethod='online';
                    break;
                case "混合":
                    attendMethod='hybrid';
                    break;
                default:
                    attendMethod='other';
                    break;
            }
            let response=await editCourse({
                id:this.data.id,
                course_name:this.data.name,
                course_type:type,
                college:this.data.college,
                campus:this.data.campus,
                course_teacher:this.data.teacher,
                course_method:attendMethod,
                assessment_method:this.data.examineMethod,
                credits:this.data.credit,
            })
            this.loading=false;
            if(response.status==200||response.status==201){
                this.alert(getNormalSuccessAlert("课程修改成功"));
                this.close();
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
    },
    async mounted(){
    }
}
</script>
<style scoped>
@media screen and (min-width: 1000px) {
    .card {
        width: 750px;
        border-width: 2px;
        border-color: #8a8a8a;
        padding: 10px;
    }

    .content-div {
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    .bottom-btn-div {
        display: flex;
        flex-direction: row-reverse;
    }
    .btn {
        margin: 5px;
    }
    .title-input{
        width: 100%;
        margin-top: 10px;
    }
    .item-div{
        display: flex;
        flex-direction: row;
    }
    .item{
        margin-right: 15px;
        max-width: 300px;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        width: 400px;
        border-width: 2px;
        border-color: #8a8a8a;
        padding: 10px;
    }

    .content-div {
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    .bottom-btn-div {
        display: flex;
        flex-direction: row-reverse;
    }

    .btn {
        margin: 5px;
    }
    .title-input{
        width: 100%;
        margin-top: 10px;
    }
    .item-div{
        display: flex;
        flex-direction: row;
    }
    .item{
        margin-right: 15px;
        max-width: 300px;
    }
}
</style>