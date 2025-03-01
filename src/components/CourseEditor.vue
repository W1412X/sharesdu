<template>
    <v-card class="card">
        <div class="content-div">
            <div class="title-bold">编辑课程</div>
            <sensitive-text-field v-model="data.name" class="title-input" label="课程名称" variant="outlined" density="compact"></sensitive-text-field>
            <div class="item-div">
                <sensitive-text-area
                    v-model="data.course_teacher"
                    label="授课教师"
                    variant="outlined"
                    density="compact"
                    rows="1"
                    max-rows="1"
                    max-width="300px"
                    class="item"
                ></sensitive-text-area>
                <v-select
                    v-model="data.course_type"
                    variant="outlined"
                    density="compact"
                    class="item"
                    :items="types"
                    multiple
                    chips
                    label="课程类型"
                ></v-select>
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
                    v-model="data.assessment_method"
                    variant="outlined"
                    density="compact"
                    class="item"
                    :items="examineMethods"
                    label="考核方式"
                ></v-select>
                <v-select
                    v-model="data.course_method"
                    variant="outlined"
                    density="compact"
                    class="item"
                    :items="teachMethods"
                    label="上课方式"
                ></v-select>
            </div>
            <div class="bottom-btn-div">
                <v-btn variant="text" class="btn" density="compact" @click="submit">发布</v-btn>
                <v-btn variant="text" class="btn" density="compact" @click="close">取消</v-btn>
            </div>
        </div>
    </v-card>
</template>
<script>
import { getCurrentInstance } from 'vue';
import SensitiveTextArea from './SensitiveTextArea.vue';
import SensitiveTextField from './SensitiveTextField.vue';
import { createCourse, getCourseDetail,editCourse } from '@/axios/course';
import { getCancelLoadMsg, getLoadMsg } from '@/utils/other';

export default {
    name: 'CourseEditor',
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    course_id: null,
                    course_name: null,
                    course_teacher: null,
                    course_type: null,//course type
                    college: null,
                    campus: null,
                    assessment_method:null,
                    course_method:null,//method to take course  
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
            data
        }
    },
    methods: {
        close() {
            this.$emit('close')
        },
        async submit() {
            /**
             * submit the course
             * if id is null,then create the course
             * else edit
             */
            this.setLoading(getLoadMsg('正在提交...',-1));
            var response=null;
            if(this.data.id==null){
                response=await createCourse(this.data);
            }else{
                response=await editCourse(this.data);
            }
            if(response.status==200){
                /**
                 * success,close and alert
                 */
                this.close();
                this.alert({color:'success',state:true,title:'发布成功',content:response.message});
            }else{
                /**
                 * failed because other reasons 
                 */
                this.alert({color:'error',state:true,title:null,content:response.message})
            }
            this.setLoading(getCancelLoadMsg());
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
    },
    async mounted(){
        /**
         * if id is not null,then get the data from the server
         * else do nothing
         */
        if(this.data.course_id!=null){
            this.data=await getCourseDetail(this.data.course_id);
        }else{
            //eslint-disable-next-line no-console
        }
    }
}
</script>
<style scoped>
@media screen and (min-width: 600px) {
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

@media screen and (max-width: 600px) {
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