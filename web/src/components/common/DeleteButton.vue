<!--alert button-->
<template>
    <v-btn :loading="loading" :disabled="loading" elevation="0" @click="click" icon :style="{
        'width': size+'px',
        'height': size+'px',
        'color': color,
        'background-color': 'rgba(0,0,0,0)',
    }">
        <v-icon :size="size" icon="mdi-delete-outline"></v-icon>
        <v-tooltip activator="parent">删除此项</v-tooltip>
    </v-btn>
</template>
<script>
import { deleteArticle } from '@/axios/article';
import { deleteCourse } from '@/axios/course';
import { deletePostById, deleteReplyById } from '@/axios/post';
import { getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
export default {
    props: {
        id: {
            type: String,
            default: '00000000',
        },
        type: {
            type: String,
            default: 'article',
        },
        size: {
            type: String,
            default: '25',
        },
        color: {
            type: String,
            default: '#8a8a8a',
        }
    },
    setup() {
    },
    data(){
        return {
            loading: false,
        }
    },
    methods: {
        setLoading(msg) {
            this.$emit('set_loading', msg)
        },
        alert(msg) {
            this.$emit('alert', msg)
        },
        async click() {
            this.loading=true;
            let response={status:-1,message:"网络错误"};
            switch(this.type){
                case 'article':
                    response=await deleteArticle(this.id);
                    break;
                case 'post':
                    response=await deletePostById(this.id);
                    break;
                case 'course':
                    response=await deleteCourse(this.id);
                    break;
                case 'reply':
                    response=await deleteReplyById(this.id);
                    break;
               default:
                    this.alert(getNormalErrorAlert("未知的删除类型"));
                    return;
            }
            this.loading=false;
            if(response.status==200){
                this.alert(getNormalSuccessAlert('删除成功'));
                this.$emit('delete');
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
    }
}
</script>