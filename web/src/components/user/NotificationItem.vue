<template>
    <v-card class="card" @click="click" :color="this.color" variant="tonal">
        <div class="type-bar">
            <v-icon size="20" class="icon" :color="this.color" type="mdi" :icon="typeIcon"></v-icon>
            <div class="text-small-bold">
                {{ data.type }}
            </div>
            <v-spacer></v-spacer>
        </div>
        <div class="text-medium message-text">
            {{ data.message }}
        </div>
        <div class="time-bar">
            <v-icon style="margin-right: 2px;" size="18" icon="mdi-clock-time-three"/>
            <div class="text-small time-bar">
            {{ data.time }}        
        </div>
        </div>
    </v-card>
</template>
<script>
import { markAsReadNotification } from '@/axios/notification';
import { globalProperties } from '@/main';
import { copy, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, openPage } from '@/utils/other';
import { computed } from 'vue';

export default {
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    id: null,
                    type: null,//
                    message: null,
                    time: null,
                    state: null,
                    relatedItem: {
                        type:null,
                        id:null,
                        preview:null,
                    },
                }
            }
        }
    },
    setup() {
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    data() {
        var data=copy(this.initData);
        const color=computed(()=>{
            if(this.data.state){
                return "grey";
            }else{
                return this.themeColor;
            }
        })
        const typeIcon=computed(()=>{
            switch(this.data.type){
                case "文章有新帖子":
                    return "mdi-note-alert";
                case "评论有新回复":
                    return "mdi-reply-circle";
                case "帖子有新回复":
                    return "mdi-message-reply-text";
                case "新的私信":
                    return "mdi-chat";
                case "系统消息":
                    return "mdi-bell";
                case "课程信息变更":
                    return "mdi-book-alert";
                default:
                    return "mdi-square-rounded-badge";
            }
        })
        return {
            data,
            color,
            typeIcon,
        }
    },
    methods: {
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        async click() {
            this.setLoading(getLoadMsg("获取信息..."));
            let response=await markAsReadNotification([this.data.id]);
            this.setLoading(getCancelLoadMsg());
            if(response.status==200){
                this.data.state=true;
                this.alert(getNormalSuccessAlert("已标记为已读"));
                if(this.data.relatedItem.type=='message'){
                    openPage("url",{url:"#/chat"});
                }else{
                    openPage("url",{url:"#/"+this.data.relatedItem.type+"/"+this.data.relatedItem.id});
                }
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
    },
    mounted() {
        switch(this.data.type){
            case "post_for_your_article":
                this.data.type="文章有新帖子";
                break;
            case "reply_for_your_reply":
                this.data.type="评论有新回复";
                break;
            case "reply_for_your_post":
                this.data.type="帖子有新回复";
                break;
            case "private_message":
                this.data.type="新的私信";
                break;
            case "system_message":
                this.data.type="系统消息";
                break;
            case "course_moderation":
                this.data.type="课程信息变更";
                break;
            default:
                this.data.type="新的消息";
                break;
        }
    },
}
</script>
<style scoped>
    .type-bar{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 5px;
    }
    .icon{
        margin-right: 10px;
    }
    .time-bar{
        align-items: center;
        margin-top: 2px;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
@media screen and (min-width: 1000px) {
    .card {
        width: 750px;
        padding: 10px;
        display: flex;
        margin:2px;
        flex-direction: column;
    }
    .message-text{
        margin-top: 2px;
        margin-bottom: 2px;
        max-width: 650px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-left: 15px;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        width: 100vw;
        padding: 10px;
        display: flex;
        margin:2px;
        flex-direction: column;
    }
    .message-text{
        margin-top: 2px;
        margin-bottom: 2px;
        max-width: 85vw;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-left: 15px;
    }
}
</style>