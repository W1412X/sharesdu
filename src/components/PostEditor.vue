<!-- question editor -->
<template>
    <v-card class="card">
        <div class="content-div">
            <div class="title-bold">编辑帖子</div>
            <sensitive-text-field class="title-input"  v-model="data.title" label="编辑帖子标题"
                density="compact" rows="1" variant="outlined"></sensitive-text-field>
            <sensitive-text-area v-model="data.content" variant="outlined" rows="3" label="编辑帖子详述"></sensitive-text-area>
            <div class="text-tiny">如果帖子涉及到一些其他的网页，可以在此处添加链接(在文章/课程下发表的帖子会自动添加相关链接)</div>
            <sensitive-text-field class="title-input"  v-model="data.link" label="添加帖子关联链接"
                :disabled="type!=='post'"
                density="compact" rows="1" variant="outlined"></sensitive-text-field>
            <div class="bottom-btn-div">
                <v-btn variant="text" class="btn" density="compact">发布</v-btn>
                <v-btn variant="text" class="btn" density="compact" @click="close">取消</v-btn>
            </div>
        </div>
    </v-card>
</template>
<script>
import SensitiveTextArea from './SensitiveTextArea.vue';
import SensitiveTextField from './SensitiveTextField.vue';
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
                    link:'',
                }
            }
        },
        type:{
            type:String,
            default:'post',//post,article,course
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
        submit(){
            /** 
             * submit post data
             */
            
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