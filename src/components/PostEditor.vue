<!-- question editor -->
<template>
    <v-card class="card">
        <div class="content-div">
            <div class="title-bold">编辑帖子</div>
            <sensitive-text-field class="title-input"  v-model="data.title" label="编辑帖子标题"
                density="compact" rows="1" variant="outlined"></sensitive-text-field>
            <sensitive-text-area v-model="data.content" variant="outlined" rows="3" label="编辑帖子详述"></sensitive-text-area>
            <div class="bottom-btn-div">
                <v-btn @click="submit" variant="text" class="btn" density="compact">发布</v-btn>
                <v-btn variant="text" class="btn" density="compact" @click="close">取消</v-btn>
            </div>
        </div>
    </v-card>
</template>
<script>
import { addLinkToPost, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import SensitiveTextArea from './SensitiveTextArea.vue';
import SensitiveTextField from './SensitiveTextField.vue';
import { createPostInArticle, createPostInCourse } from '@/axios/post';
import { getNetworkErrorResponse } from '@/axios/statusCodeMessages';
import { getCookie } from '@/utils/cookie';
export default {
    name: 'PostEditor',
    props:{
        initData:{
            type: Object,
            default: () => {
                return {
                    id:'',
                    title: '',
                    content:'',
                }
            }
        },
        typeMsg:{
            type:Object,
            default: () => {
                return {
                    type:'post',//article course post
                    id:null,
                }
            }
        }
    },
    setup() {
    },
    components: {
        SensitiveTextField,
        SensitiveTextArea
    },
    data() {
        /**
         * post data (editable)
         */
        const data=this.initData;
        console.log(data)
        return {
            data,
        }
    },
    methods: {
        close() {
            /**
             * close editor
             */
            this.$emit('close');
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        async submit(){
            /** 
             * submit post data
             */
            this.setLoading(getLoadMsg('正在提交帖子...'));
            let response=getNetworkErrorResponse();
            if(this.typeMsg.type=="article"){
                response=await createPostInArticle(this.typeMsg.id,this.data.title,addLinkToPost(this.data.content,this.typeMsg.type,this.typeMsg.id));
            }else if(this.typeMsg.type=="course"){
                response=await createPostInCourse(this.typeMsg.id,this.data.title,addLinkToPost(this.data.content,this.typeMsg.type,this.typeMsg.id));
            }else{
                //test
                response=await createPostInArticle(20,this.data.title,this.data.content);
            }
            if(response.status==200||response.status==201){
                this.alert(getNormalSuccessAlert("帖子创建成功"));
                let tmp={
                    id: response.post_id,
                    title: this.data.title,
                    content: this.data.content,
                    viewNum: 0,
                    replyNum: 0,
                    likeNum:0,
                    authorName: getCookie("userName"),
                    authorId: getCookie("userId"),
                }
                this.$emit("add_post",tmp)
                this.close();
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
            this.setLoading(getCancelLoadMsg());
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

    .item-div {
        display: flex;
        flex-direction: column;
    }
    .title-input{
        width: 100%;
        margin-top: 10px;
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

    .item-div {
        display: flex;
        flex-direction: column;
    }
    .title-input{
        width: 100%;
        margin-top: 10px;
    }
}
</style>