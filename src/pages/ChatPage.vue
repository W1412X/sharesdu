<template>
    <div class="full-center">
        <v-card class="total-container">
            <div class="top-bar title-bold">
                <v-spacer/>
                {{ receiverName }}
                <v-spacer/>
                <v-btn @click="toHomePage" style="margin-top: 2px;"  icon="mdi-home" variant="text" :color="navIconColor"
                    size="40"></v-btn>
            </div>
            <div class="message-container">
                <chat-message v-for="(message,index) in messages" :init-data="message" :key="index" @alert="alert" @set_loading="setLoading"></chat-message>
             </div>
            <div class="message-editor row-div">
                <sensitive-text-field variant="outlined" density="compact" v-model="editingMessage"/>
                <div class="send-btn-container">
                    <v-btn @click="send" icon="mdi-send" size="40" rounded="false" :color="themeColor"></v-btn>
                </div>
            </div>
            <v-btn class="refresh-btn" icon="mdi-refresh"></v-btn>
        </v-card>
    </div>
</template>
<script>
import ChatMessage from '@/components/ChatMessage.vue';
import SensitiveTextField from '@/components/SensitiveTextField.vue';
import { getCookie } from '@/utils/cookie';
import { getLoadMsg,getCancelLoadMsg, getNormalSuccessAlert, getNormalErrorAlert } from '@/utils/other';
import { globalProperties } from '@/main';
import { sendPrivateMessage } from '@/axios/chat';
export default{
    setup(){
        /**
         * get the user id
         */
        const selfId=getCookie('userId');
        const selfName=getCookie('userName');
        const themeColor=globalProperties.$themeColor;
        return{
            selfId,
            selfName,
            themeColor,
        }
    },
    components:{
        ChatMessage,
        SensitiveTextField,
    },
    data(){
        return{
            receiverId:null,
            receiverName:'null',
            editingMessage:null,
            messages:[],
        }
    },
    methods:{
        toHomePage(){
            this.$router.push({
                name: 'IndexPage',
            })
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        async send(){
            this.setLoading(getLoadMsg('正在发送私信...'));
            let response=await sendPrivateMessage(this.receiverId,this.editingMessage);
            this.setLoading(getCancelLoadMsg());
            if(response.status==200||response.status==201){
                this.alert(getNormalSuccessAlert('发送成功'));
                this.messages.push({
                    id:response.data.message_id,
                    content:this.editingMessage,
                    time: new Date().getTime(),
                    isSelf:true,
                })
            }else{
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        refresh(){
            this.alert("待实现");
        }
    },
    mounted(){
        this.setLoading(getCancelLoadMsg());
        /**
         * get the id from the url
         */
        this.setLoading(getLoadMsg('正在获取聊天信息...',-1));
        this.receiverId=this.$route.params.id;
        this.receiverName=this.$route.params.name;
        /**
         * get the receiver name and avatar  
         */
        
        /**
         * get the chat info
         */   
        this.setLoading(getCancelLoadMsg());
    }
}
</script>
<style>
.total-container{
    display: flex;
    flex-direction: column;
    height: 100%;
}
.row-div{
    display: flex;
    flex-direction: row;
}
.send-btn-container{
    height: 100%;
    padding-left:5px;
    padding-right: 5px;
    align-items: center;
}
.refresh-btn{
    position: fixed;
    bottom: 60px;
    right: 10px;
}
@media screen and (min-width: 600px) {
    .full-center {
        width: 1000px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
    .top-bar{
        position: fixed;
        height: 50px;
        width: 1000px;
        display: flex;
        flex-direction: row;
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color: var(--theme-color);
        justify-content: center;
        color:white;
    }
    .message-container{
        margin-top: 50px;
        width: 1000px;
        display: flex;
        margin-bottom: 50px;
        flex-direction: column;
    }
    .message-editor{
        width: 1000px;
        display: flex;
        max-height: 50px;
        flex-direction: row;
        padding:5px;
        position: fixed;
        bottom: 0px;
        background-color: white;
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
    .top-bar{
        position: fixed;
        height: 50px;
        width: 100vw;
        display: flex;
        flex-direction: row;
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color: var(--theme-color);
        justify-content: center;
        color: white;
    }
    .message-container{
        margin-top: 50px;
        width: 100vw;
        display: flex;
        margin-bottom: 50px;
        flex-direction: column;
    }
    .message-editor{
        width: 100vw;
        padding:5px;
        display: flex;
        max-height: 50px;
        position: fixed;
        bottom: 0px;
        flex-direction: row;
        background-color: white;
    }
}
</style>