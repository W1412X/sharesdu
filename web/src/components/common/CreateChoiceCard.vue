<template>
    <v-card class="card">
        <div class="content-div">
            <v-card class="btn-card" @click="to('article')" :color="themeColor" variant="text">
                <div class="column-div">
                    <div class="icon-container">
                        <v-icon :icon="'mdi-file-edit-outline'" size="33"></v-icon>
                    </div>
                    <div class="text-small">创作文章</div>
                </div>
            </v-card>
            <v-card class="btn-card" @click="to('post')" :color="themeColor" variant="text">
                <div class="column-div">
                    <div class="icon-container">
                        <v-icon :icon="'mdi-comment-question-outline'" size="33"></v-icon>
                    </div>
                    <div class="text-small">发布帖子</div>
                </div>
            </v-card>
            <v-card class="btn-card" @click="to('course')" :color="themeColor" variant="text">
                <div class="column-div">
                    <div class="icon-container">
                        <v-icon :icon="'mdi-book-plus-outline'" size="33"></v-icon>
                    </div>
                    <div class="text-small">添加课程</div>
                </div>
            </v-card>
            <v-card class="btn-card" @click="to('service')" :color="themeColor" variant="text">
                <div class="column-div">
                    <div class="icon-container">
                        <v-icon :icon="'mdi-xml'" size="33"></v-icon>
                    </div>
                    <div class="text-small">创建服务</div>
                </div>
            </v-card>
        </div>
        <v-btn variant="tonal" class="width-100" :color="themeColor">前往创作中心</v-btn>
    </v-card>
</template>
<script>
import { openPage } from '@/utils/other';
import { getCurrentInstance } from 'vuetify/lib/util';

export default {
    name: 'CreateChoiceCard',
    props: {
    },
    components:{
    },
    setup(){
        const types=getCurrentInstance().appContext.config.globalProperties.$courseTypes;
        const colleges=getCurrentInstance().appContext.config.globalProperties.$colleges;
        const campus=getCurrentInstance().appContext.config.globalProperties.$campus;
        const teachMethods=getCurrentInstance().appContext.config.globalProperties.$teachMethods;
        const examineMethods=getCurrentInstance().appContext.config.globalProperties.$examineMethods;
        const themeColor=getCurrentInstance().appContext.config.globalProperties.$themeColor;
        return{
            types,
            colleges,
            campus,
            teachMethods,
            examineMethods,
            themeColor
        }
    },
    data(){
        return {
        }
    },
    methods: {
        to(choice){
            switch(choice){
                case 'article':
                    openPage('url',{url:"#/editor"});
                    break;
                case 'post':
                    this.$emit('show','post');
                    break;
                case 'course':
                    this.$emit('show','course');
                    break;
                case 'service':
                    openPage('url','#/service')
                    break;
            }
        },
        close() {
            this.$emit('close')
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
.column-div{
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.row-div{
        align-items: center;
        display: flex;
        flex-direction: row;
}
.icon-container{
    width: 100%;
    height: fit-content;
    align-items: center;
    margin: 10px;
}
.width-100{
    width: 100%;
}
.btn-card{
    padding: 5px;
    margin: 2px;
}
.btn-card:hover {
  transform: translateY(-0.5px);
}
.content-div {
    justify-content: center;
    display: flex;
    flex-direction: row;
}
@media screen and (min-width: 1000px) {
    .card {
        width: 330px;
        padding: 10px;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        width: 330px;
        padding: 10px;
    }
    .icon-container{
        width: fit-content;
        height: 100%;
        align-items: center;
        margin: 10px;
    }

}
</style>