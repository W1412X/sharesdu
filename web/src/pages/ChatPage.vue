<template>
    <div class="full-center">
        <v-navigation-drawer v-if="deviceType == 'mobile' && navVisible" v-model="drawer" :rail='false' permanent
            @click="rail = false">
            <v-divider></v-divider>
            <v-btn size="30" class="menu-btn" :icon="navVisible ? 'mdi-chevron-left' : 'mdi-chevron-right'"
                @click="navVisible = !navVisible"></v-btn>
            <v-list density="compact" nav :color="themeColor" v-model="choose">
                <v-list-item base-color="#dddddd" variant="outlined" @click="selectUser(index)"
                    v-for="(user, index) in chatUsers" :key="index" :value="user.id">
                    <div class="row-div">
                        <avatar-name :clickable="false" :if-show-name="false" :size="45"
                            :init-data="{ id: user.id, name: user.name }"></avatar-name>
                        <div class="column-div">
                            <div class="msg-summary-div text-small-bold">
                                {{ user.name }}
                            </div>
                            <div class="msg-summary-div text-small">
                                {{ (user.lastMsg.isSelf ? '' : user.name + ' : ') + user.lastMsg.content }}
                            </div>
                            <div class="msg-time-div text-min">
                                {{ user.lastMsg.time }}
                            </div>
                        </div>
                    </div>
                    <template v-if="user.msgNum != 0" v-slot:append>
                        <v-badge color="error" :content="user.msgNum" inline></v-badge>
                    </template>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <div class="total-container">
            <div class="top-reciever-div">
                <v-btn v-if="deviceType != 'desktop'" :icon="'mdi-format-list-bulleted'" variant="text"
                    @click="navVisible = true"></v-btn>
                <avatar-name :color="'white'" style="margin-left: 10px;" v-if="deviceType == 'desktop'"
                    :init-data="{ id: selfId, name: selfName }"></avatar-name>
                <v-spacer></v-spacer>
                <span> {{ this.receiverId==null?'':receiverName }}</span>
                <v-spacer></v-spacer>
                <v-btn icon="mdi-home" variant="text" @click="toHomePage"></v-btn>
            </div>
            <div v-if="deviceType == 'mobile'" id="message-container" class="message-container">
                <div class="tip-text-btn">
                    <span v-if="this.receiverId" @click="loadFrontier" class="text-tiny">
                        查看更早的消息
                    </span>
                </div>
                <chat-message @recall="handleRecall" v-for="(message) in messages" :init-data="message" :key="message.id" @alert="alert"
                    @set_loading="setLoading"></chat-message>
            </div>
            <div id="chat-container" v-if="deviceType == 'desktop'" style="display: flex;flex-direction: row;flex:1;">
                <div id="user-list" class="user-list">
                    <v-list density="compact" nav :color="themeColor" v-model="choose">
                        <v-list-item base-color="#dddddd" variant="outlined" @click="selectUser(index)"
                            v-for="(user, index) in chatUsers" :key="index" :value="user.id">
                            <div class="row-div">
                                <avatar-name :clickable="false" :if-show-name="false" :size="45"
                                    :init-data="{ id: user.id, name: user.name }"></avatar-name>
                                <div class="column-div">
                                    <div class="msg-summary-div text-small-bold">
                                        {{ user.name }}
                                    </div>
                                    <div class="msg-summary-div text-small">
                                        {{ (user.lastMsg.isSelf ? '' : user.name + ' : ') + user.lastMsg.content }}
                                    </div>
                                    <div class="msg-time-div text-min">
                                        {{ user.lastMsg.time }}
                                    </div>
                                </div>
                            </div>
                            <template v-if="user.msgNum != 0" v-slot:append>
                                <v-badge color="error" :content="user.msgNum" inline></v-badge>
                            </template>
                        </v-list-item>
                    </v-list>
                </div>
                <div id="desktop-message-editor-container" style="flex:1;display: flex;flex-direction: column;">
                    <div id="message-container" class="message-container">
                        <div class="tip-text-btn">
                            <span v-if="this.receiverId" @click="loadFrontier" class="text-tiny">
                                查看更早的消息
                            </span>
                        </div>
                        <chat-message @recall="handleRecall" v-for="(message) in messages" :init-data="message" :key="message.id"
                            @alert="alert" @set_loading="setLoading"></chat-message>
                    </div>
                    <div class="message-editor row-div">
                        <sensitive-text-area rows="1" variant="outlined" density="compact" v-model="editingMessage" />
                        <div class="send-btn-container">
                            <v-btn @click="send" icon="mdi-send" size="40" :variant="'text'"
                                :color="themeColor"></v-btn>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="deviceType == 'mobile'" class="message-editor row-div">
                <sensitive-text-area rows="1" variant="outlined" density="compact" v-model="editingMessage" />
                <div class="send-btn-container">
                    <v-btn @click="send" icon="mdi-send" size="40" :variant="'text'" :color="themeColor"></v-btn>
                </div>
            </div>
            <!--
            <v-btn class="refresh-btn" icon="mdi-refresh"></v-btn>
            -->
        </div>
    </div>
</template>
<script>
import ChatMessage from '@/components/ChatMessage.vue';
import { getCookie } from '@/utils/cookie';
import { getLoadMsg, getCancelLoadMsg, getNormalErrorAlert, extractTime, getNormalInfoAlert, copy } from '@/utils/other';
import { globalProperties } from '@/main';
import { getChatHistory, getChatUsers, markMessageAsRead, sendPrivateMessage } from '@/axios/chat';
import { ref } from 'vue';
import AvatarName from '@/components/AvatarName.vue';
import SensitiveTextArea from '@/components/SensitiveTextArea.vue';
export default {
    setup() {
        /**
         * get the user id
         */
        const selfId = getCookie('userId');
        const selfName = getCookie('userName');
        const themeColor = globalProperties.$themeColor;
        const deviceType = globalProperties.$deviceType;
        console.log(deviceType);
        const navVisible = ref(false);
        const drawer = ref(true);
        const rail = ref(false);
        return {
            selfId,
            selfName,
            themeColor,
            deviceType,
            navVisible,
            drawer,
            rail,
        }
    },
    components: {
        ChatMessage,
        SensitiveTextArea,
        AvatarName,
    },
    data() {
        let receiverId = null;
        return {
            receiverId,
            receiverName: 'null',
            editingMessage: null,
            messages: [],
            chatUsers: [
            ],
            chatHistoryDict: {

            },
            chatPageDict: {

            }
        }
    },
    watch: {
        receiverId: {
            //eslint-disable-next-line
            async handler(newValue, oldValue) {
                console.log(newValue);
                if (newValue) {
                    if (this.chatHistoryDict[newValue] == null) {
                        //get history  
                        this.setLoading(getLoadMsg('正在获取用户列表...'));
                        let response = await getChatHistory(newValue);
                        this.setLoading(getCancelLoadMsg());
                        if (response.status == 200) {
                            this.messages = [];
                            response.results = response.results.reverse();
                            this.chatPageDict[this.receiverId] = 2;
                            for (let i = 0; i < response.results.length; i++) {
                                this.messages.push({
                                    id: response.results[i].message_id,
                                    content: response.results[i].content,
                                    time: response.results[i].sent_at,
                                    isSelf: response.results[i].is_sender,
                                    ifRead: response.results[i].read,
                                })
                                if (!this.messages[this.messages.length - 1].ifRead&&!this.messages[this.messages.length - 1].isSelf) {
                                    this.setLoading(getLoadMsg('正在处理信息...'))
                                    await markMessageAsRead(this.messages[this.messages.length - 1].id);
                                    this.chatUsers[newValue].msgNum--;
                                    this.messages[this.messages.length - 1].ifRead=true;
                                    this.setLoading(getCancelLoadMsg());
                                }
                                if (response.results[i].is_sender) {
                                    this.messages[this.messages.length - 1]['userName'] = this.selfName;
                                    this.messages[this.messages.length - 1]['userId'] = this.selfId;
                                } else {
                                    this.messages[this.messages.length - 1]['userName'] = this.receiverName;
                                    this.messages[this.messages.length - 1]['userId'] = this.receiverId;
                                }
                            }
                            this.chatHistoryDict[newValue] = this.messages;
                        } else {
                            this.messages = [];
                            this.alert(getNormalErrorAlert(response.message));
                        }
                    } else {
                        this.messages = [];
                        this.messages = this.chatHistoryDict[newValue];
                    }
                }
                this.scrollToBottom();
            },
            immediate: true,
        },
        receiverName: {
            //eslint-disable-next-line
            handler(newVal, oldVal) {
                console.log(newVal);
                document.getElementById('web-title').innerText = '聊天 | ' + newVal;
            },
            immediate: true,
        }

    },
    methods: {
        toHomePage() {
            this.$router.push({
                name: 'IndexPage',
            })
        },
        scrollToBottom(){
            setTimeout(()=>{
                document.getElementById('message-container').scrollTo(0, document.getElementById('message-container').scrollHeight);
            },100);
        },
        scrollToTop(){
            setTimeout(()=>{
                document.getElementById('message-container').scrollTo(0, 0);
            },100);
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        handleRecall(id){
            for(let i=0;i<this.messages.length;i++){
                if(this.messages[i].id==id){
                    this.messages.splice(i,1);
                    break;
                }
            }
        },
        async send() {
            this.setLoading(getLoadMsg("正在发送..."));
            let response = await sendPrivateMessage(this.receiverId, this.editingMessage);
            this.setLoading(getCancelLoadMsg());
            if (response.status == 200) {
                this.messages.push({
                    id: 'sss',
                    content: this.editingMessage,
                    time: new Date().toISOString(),
                    isSelf: true,
                    ifRead: false,
                    userName: this.selfName,
                    userId: this.selfId,
                })
                this.editingMessage = "";
                this.scrollToBottom();
            } else {
                this.alert(getNormalErrorAlert(response.message));
            }
        },
        refresh() {
            this.alert("待实现");
        },
        async loadFrontier() {
            console.log("chatPageDict",this.chatPageDict);
            console.log("recervierId",this.receiverId);
            console.log("page",this.chatPageDict[this.receiverId]);
            this.setLoading(getLoadMsg('正在获取...'));
            let response = await getChatHistory(this.receiverId, this.chatPageDict[this.receiverId]);
            this.setLoading(getCancelLoadMsg());
            if (response.status == 200) {
                this.chatPageDict[this.receiverId]++;
                let tmp=[];
                response.results = response.results.reverse();
                for (let i = 0; i < response.results.length; i++) {
                    tmp.push({
                        id: response.results[i].message_id,
                        content: response.results[i].content,
                        time: response.results[i].sent_at,
                        isSelf: response.results[i].is_sender,
                        ifRead: response.results[i].read,
                        userName: this.receiverName,
                        userId: this.receiverId,
                    })
                    if (!tmp[tmp.length - 1].ifRead&&!tmp[tmp.length-1].isSelf) {
                        this.setLoading(getLoadMsg('正在处理信息...'))
                        await markMessageAsRead(tmp[tmp.length - 1]);
                        //sub the msgNum  
                        this.chatUsers[this.receiverId].msgNum--;
                        this.messages[this.messages.length - 1].ifRead=true;
                        this.setLoading(getCancelLoadMsg());
                    }
                }
                for(let i=0;i<this.messages.length;i++){
                    tmp.push(copy(this.messages[i]));
                }
                this.messages=tmp;
                this.chatHistoryDict[this.receiverId] = this.messages;
                this.scrollToTop();
            }else{
                this.alert(getNormalInfoAlert('无更多信息'))
            }
        },
        selectUser(index) {
            this.receiverId = this.chatUsers[index].id;
            this.receiverName = this.chatUsers[index].name;
        }
    },
    async mounted() {
        //init the view  
        let viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        document.getElementById('message-container').style.maxHeight = String(viewportHeight - 90) + 'px';
        document.getElementById('message-container').style.minHeight = String(viewportHeight - 90) + 'px';
        if (this.deviceType == 'desktop') {
            document.getElementById('user-list').style.maxHeight = String(viewportHeight - 40) + 'px';
            document.getElementById('user-list').style.minHeight = String(viewportHeight - 40) + 'px';
            document.getElementById('desktop-message-editor-container').style.maxHeight = (viewportHeight - 40) + 'px';
            document.getElementById('desktop-message-editor-container').style.minHeight = (viewportHeight - 40) + 'px';
        }
        this.setLoading(getCancelLoadMsg());
        this.receiverId = this.$route.params.id;
        this.receiverName = this.$route.params.name;
        /**
         * get the id from the url
         */
        this.setLoading(getLoadMsg('正在获取聊天信息...', -1));
        let response = await getChatUsers();
        let ifParamIdIn=false;
        if(!this.receiverId){
            ifParamIdIn=true;
        }
        this.setLoading(getCancelLoadMsg());
        if (response.status == 200) {
            for (let i = 0; i < response.chat_users.length; i++) {
                if(this.receiverId==response.chat_users[i].user_id){
                    ifParamIdIn=true;
                }
                this.chatUsers.push({
                    id: response.chat_users[i].user_id,
                    name: response.chat_users[i].username,
                    msgNum: response.chat_users[i].unread_count,
                    lastMsg: {
                        content: response.chat_users[i].last_message.content,
                        time: extractTime(response.chat_users[i].last_message.sent_at),
                        isSelf: response.chat_users[i].last_message.is_sender
                    }
                })
            }
        } else {
            this.alert(getNormalErrorAlert(response.message));
        }
        if(!ifParamIdIn){
            this.chatUsers.push({
                id:this.receiverId,
                name:this.receiverName,
                msgNum:0,
                lastMsg:{
                    content:"新的聊天",
                    time:extractTime(new Date().toISOString()),
                    isSelf:true
                }
            })
        }
        document.getElementById('web-title').innerText = '聊天 | ' + this.receiverName;
    }
}
</script>
<style>
.total-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.row-div {
    display: flex;
    flex-direction: row;
}

.menu-btn {
    position: fixed;
    bottom: 50%;
    right: -15px;
    z-index: 100;
}

.mobile-menu-btn {
    position: fixed;
    bottom: 50%;
    left: 0px;
    z-index: 100;
}

.tip-text-btn {
    width: 100%;
    justify-content: center;
    display: flex;
    margin-top: 10px;
    color: #8a8a8a;
    text-decoration: underline;
}

.send-btn-container {
    height: 100%;
    padding-left: 5px;
    padding-right: 5px;
    align-items: center;
}

.column-div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
}

.user-list {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: scroll;
    width: 350px;
    border-right: 0.5px solid #ccc;
}

.refresh-btn {
    position: fixed;
    bottom: 60px;
    right: 10px;
}

.msg-summary-div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #8a8a8a;
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-top: 2px;
    margin-left: 15px;
}

.msg-time-div {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-left: 15px;
    color: #8a8a8a;
}

@media screen and (min-width: 600px) {
    .full-center {
        width: 800px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
    }

    .top-reciever-div {
        color: white;
        font-size: 18px;
        height: 40px;
        z-index: 999;
        width: 100vw;
        justify-content: center;
        display: flex;
        align-items: center;
        font-weight: bold;
        flex-direction: row;
        background-color: var(--theme-color);
    }

    .message-container {
        width: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
    }

    .message-editor {
        width: 100%;
        display: flex;
        max-height: 50px;
        flex-direction: row;
        padding: 5px;
        bottom: 0px;
        background-color: white;
        border-top: 1px solid #aaaaaa;
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

    .top-reciever-div {
        color: white;
        font-size: 18px;
        height: 40px;
        z-index: 999;
        width: 100vw;
        justify-content: center;
        display: flex;
        align-items: center;
        font-weight: bold;
        flex-direction: row;
        background-color: var(--theme-color);
    }

    .top-bar {
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

    .message-container {
        width: 100vw;
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .message-editor {
        width: 100vw;
        padding: 5px;
        display: flex;
        max-height: 50px;
        bottom: 0px;
        flex-direction: row;
        border-top: 1px solid #aaaaaa;
        background-color: white;
    }
}
</style>