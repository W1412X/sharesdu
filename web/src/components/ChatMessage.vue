<template>
    <v-dialog v-model="ifShowMore" style="width: 100%;height:100%;justify-content: center;">
      <div v-if="ifShowMore" style="width: 100%;height:100%;justify-content: center;display: flex">
        <v-card class="column-div-reverse message-more-card">
            <v-btn density="compact" width="100px" class="text-medium" prepend-icon="mdi-alert-circle-outline" text="举报" variant="text"></v-btn>
            <v-btn @click="recall" density="compact" width="100px" class="text-medium" prepend-icon="mdi-email-arrow-left-outline" text="撤回" variant="text"></v-btn>
        </v-card>
      </div>
    </v-dialog>
    <div class="container">
        <!--
            <div class="avatar">
                <img :src="initData.avatar" alt="">
            </div>
        -->
        <div v-if="data.isSelf" class="row-div-reverse">
            <avatar-name :if-show-name="false" :init-data="{id:data.userId,name:''}" style="margin: 10px;"></avatar-name>
            <div style="display: flex;flex-direction: column;">
                <span class="text-min" :style="{color:'#aaaaaa'}">
                {{ data.time }}
                </span>
                <div class="row-div-reverse">
                    <v-card class="message-card"  elevation="1">
                        <div class="message-text text-medium">
                            {{data.content}}
                        </div>
                    </v-card>
                </div>
            </div>
            <div class="column-div-reverse">
                <v-icon class="more-btn" variant="text" size="15" density="compact" color="grey" @click="setShowMoreState(!this.ifShowMore)" icon="mdi-dots-vertical">
                </v-icon>
            </div>
        </div>
        <div v-if="!data.isSelf" class="row-div">
            <avatar-name :if-show-name="false" :init-data="{id:data.userId,name:''}" style="margin: 10px;"></avatar-name>
            <div style="display: flex;flex-direction: column;">
                <span class="text-min" :style="{color:'#aaaaaa'}">
                {{ data.time }}
                </span>
                <div class="row-div">
                    <v-card class="message-card"  elevation="1">
                        <div class="message-text text-medium">
                            {{data.content}}
                        </div>
                    </v-card>
                </div>
            </div>
            <div class="column-div-reverse">
                <v-icon class="more-btn" variant="text" size="15" density="compact" color="grey" @click="setShowMoreState(!this.ifShowMore)" icon="mdi-dots-vertical">
                </v-icon>
            </div>
        </div>
        <div v-if="!data.isSelf" class="text-min-bold read-div" :style="{'color':!data.ifRead?themeColor:'#8a8a8a'}">
            <span>{{ data.ifRead?'已读':'未读' }}</span>
        </div>
        <div v-if="data.isSelf" class="text-min-bold read-div-reverse" :style="{'color':!data.ifRead?themeColor:'#8a8a8a'}">
            <span>{{ data.ifRead?'已读':'未读' }}</span>
        </div>
    </div>
</template>
<script>
import { deletePrivateMessage } from '@/axios/chat';
import { extractTime, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import { ref } from 'vue';
import AvatarName from './AvatarName.vue';
import { globalProperties } from '@/main';
export default {
    name: 'ChatMessage',
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    id:null,
                    content: null,
                    userId: null,
                    userName:null,
                    time: null,
                    isSelf: true,//bool
                    ifRead: true,
                }
            },
        },
    },
    setup(){
        var ifShowMore=ref(false);
        const themeColor=globalProperties.$themeColor;
        const setShowMoreState=(state)=>{
            ifShowMore.value=state;
        }
        return{
            ifShowMore,
            setShowMoreState,
            themeColor
        }
    },
    components:{
        AvatarName,
    },
    data(){
        var data=this.initData;
        data.time=extractTime(data.time);
        return{
            data,
        }
    },
    methods: {
        alert(msg){
            this.$emit("alert",msg);
        },
        setLoading(msg){
            this.$emit("set_loading",msg);
        },
        async recall(){
            this.setLoading(getLoadMsg("正在撤回..."));
            let response=await deletePrivateMessage(this.data.id);
            this.setLoading(getCancelLoadMsg());
            if(response.status==200){
                this.alert(getNormalSuccessAlert("撤回成功"));
                this.$emit("recall",this.data.id);
            }
            else{
                this.alert(getNormalErrorAlert(response.message));
            }
        }
    },
    mounted(){
        console.log(this.data);
    }
}
</script>
<style scoped>
.avatar{
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    img{
        width: 100%;
        height: 100%;
    }
}
.read-div{
    display: flex;
    flex-direction: row;
    margin-top: 3px;
    margin-left: 40px;
}
.read-div-reverse{
    display: flex;
    flex-direction: row-reverse;
    margin-top: 3px;
    align-items: start;
    margin-right: 45px;
}
.row-div{
    display: flex;
    flex-direction: row;
    align-items: start;
    bottom:5px;
}
.row-div-reverse{
    display: flex;
    flex-direction: row-reverse;
    align-items: start;
    bottom:5px;
}
.message-text{
    white-space: pre-line;
    color: black;
}
.message-more-card{
    position: fixed;
    margin-left: 30px;
    padding:10px;
}
.bottom-bar{
    display: flex;
    flex-direction: row;
    margin-top: 2px;
    margin-left: 0px;
}
.bottom-bar-reverse{
    display: flex;
    flex-direction: row;
    margin-top: 2px;
    flex-direction: row-reverse;
}
.time-text{
    color: grey;
}
.more-btn{ 
    margin-bottom: 5px;
}
.column-div-reverse{
    display: flex;
    flex-direction: column-reverse;
}
@media screen and (min-width: 1000px) {
    .container {
        width: 100%;
        display: flex;
        padding:10px;
        flex-direction: column;
    }
    .message-card{
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 10px;
        padding-right: 10px;
        width: fit-content;
        max-width: 800px;   
    }
}

@media screen and (max-width: 1000px) {
    .container {
        width: 100vw;
        display: flex;
        padding:10px;
        flex-direction: column;
    }
    .message-card{
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 10px;
        padding-right: 10px;
        width: fit-content;
        max-width: 70vw;        
    }
}
</style>