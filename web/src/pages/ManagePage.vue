<template>
        <div class="full-center">
            <v-dialog v-model="ifShowDialog" class="dialog">
                <div class="dialog-card-container">
                    <div v-if="ifShowWebCard" style="display: flex;flex-direction: column;justify-content: center;">
                        <web-card :url="nowShowUrl"></web-card>
                        <div style="display: flex;flex-direction: row;">
                            <v-spacer></v-spacer>
                            <v-btn :color="themeColor" @click="confirm" text="确认操作"/>
                            <v-spacer></v-spacer>
                            <v-btn :color="themeColor" @click="setWebCardState(false)" text="取消操作"/>
                            <v-spacer></v-spacer>
                        </div>
                    </div>
                    <course-history-card v-if="ifShowCourseHistory" :id="this.itemId" :type="'admin'" @close="setCourseHistoryState(false)" @set_loading="setLoading" @alert="alert"></course-history-card>
                </div>
            </v-dialog>
            <v-card class="card column-div-scroll">
                <v-select  label="对象类型" density="compact" variant="outlined" :items="['article','user','course']" v-model="itemType"></v-select>
                <v-textarea  label="ID" rows="1" density="compact" variant="outlined" v-model="itemId" :hint="'ID'"></v-textarea>
                <v-textarea
                    v-if="itemType === 'user'"
                    label="封禁时间（整数1-90）"
                    rows="1"
                    density="compact"
                    variant="outlined"
                    v-model="blockDays"
                />
                <v-textarea  v-if="itemType=='article'" label="封禁原因" rows="2" density="compact" variant="outlined" v-model="blockReason"></v-textarea>
                <div style="display: flex;flex-direction: row-reverse;align-items: center;">
                    <v-btn v-if="itemType=='article'||itemType=='user'" variant="outlined" @click="showConfirm" :color="themeColor" prepend-icon="mdi-lock">封禁</v-btn>
                    <v-btn v-if="itemType=='article'||itemType=='user'" variant="outlined" style="margin-right: 10px;" @click="unblock" :color="themeColor"  prepend-icon="mdi-lock-open-variant">解封</v-btn>
                    <v-btn v-if="itemType=='course'" variant="outlined" style="margin-right: 10px;" @click="showConfirm" :color="themeColor"  prepend-icon="mdi-lock">冻结</v-btn>
                    <v-btn v-if="itemType=='course'" variant="outlined" style="margin-right: 10px;" @click="unfreeze" :color="themeColor"  prepend-icon="mdi-lock-open-variant">解冻</v-btn>
                    <v-btn v-if="itemType=='course'" variant="outlined" style="margin-right: 10px;" @click="rollback" :color="themeColor"  prepend-icon="mdi-undo">回滚</v-btn>
                    <v-spacer></v-spacer>
                    <span style="color: #8a8a8a;" class="text-medium"></span>    
                </div>
                <div style="display: flex;flex-direction: row;align-items: center;padding: 10px;">
                    <v-btn @click="showUserList" variant="text">查看用户列表</v-btn>
                    <v-btn @click="showBlockUserList" variant="text">查看封禁用户</v-btn>
                </div>
                <v-card v-if="ifShowUserList" variant="outlined" class="column-div-scroll user-list-card" style="margin-top: 10px;">
                    <div style="display: flex;flex-direction: row;align-items: center;">
                        <v-icon size="30" color="#8a8a8a">mdi-account-cancel</v-icon>
                        <span style="color: #8a8a8a;margin-left: 10px;" class="text-medium-bold">用户列表</span>
                    </div>
                    <div @click="setUserId(item.id)" v-for="(item,index) in this.userList" :key="index" style="display: flex;flex-direction: row;align-items: center;padding: 10px;">
                        <avatar-name :init-data="{id:item.id,name:item.name}"></avatar-name>
                        <v-spacer></v-spacer>
                        <div style="margin: 5px;" class="text-small">{{ item.reputation }}</div>
                        <v-spacer></v-spacer>
                        <div style="margin: 5px;" class="text-small">{{ item.ifSuper?"超级管理员":(item.ifMaster?"管理员":"普通用户") }}</div>
                    </div>
                    <v-btn @click="loadUser" variant="tonal" style="width: 100%;">加载更多</v-btn>
                </v-card>
                <v-card v-if="ifShowBlockUserList" variant="outlined" class="column-div-scroll user-list-card" style="margin-top: 10px;">
                    <div style="display: flex;flex-direction: row;align-items: center;">
                        <v-icon size="30" color="#8a8a8a">mdi-account</v-icon>
                        <span style="color: #8a8a8a;margin-left: 10px;" class="text-medium-bold">封禁列表</span>
                    </div>
                    <div v-for="(item,index) in this.blockUserList" :key="index" style="display: flex;flex-direction: column;align-items: center;padding: 10px;">
                        <avatar-name :init-data="{id:item.id,name:item.username}"></avatar-name>
                        <div>由 {{ item.operator }} 封禁至 {{ item.endTime }}</div>
                    </div>
                    <v-btn variant="tonal" style="width: 100%;">加载更多</v-btn>
                </v-card>
            </v-card>
        </div>
</template>
<script>
import { freezeUnfreezeCourse } from '@/axios/course';
import { blockArticle, blockUser, getBlockedUserList, getUserList, unblockArticle, unblockUser } from '@/axios/manage';
import AvatarName from '@/components/AvatarName.vue';
import CourseHistoryCard from '@/components/CourseHistoryCard.vue';
import WebCard from '@/components/WebCard.vue';
import { globalProperties } from '@/main';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert, getNormalWarnAlert } from '@/utils/other';
import { computed, ref } from 'vue';

export default{
    setup(){
        const themeColor=globalProperties.$themeColor;
        const ifShowWebCard=ref(false);
        const ifShowDialog=computed(()=>{
            return ifShowWebCard.value||ifShowCourseHistory.value;
        })
        const setWebCardState=(state)=>{
            ifShowWebCard.value=state;
        }   
        const ifShowCourseHistory=ref(false);
        const setCourseHistoryState=(state)=>{
            ifShowCourseHistory.value=state;
        }
        return {
            themeColor,
            ifShowDialog,
            ifShowWebCard,
            setWebCardState,
            ifShowCourseHistory,
            setCourseHistoryState,
        }
    },
    components:{
        AvatarName,
        WebCard,
        CourseHistoryCard,
    },
    data(){
        return{
            itemType:null,
            itemId:null,
            blockDays:0,
            blockReason:"",
            blockUserList:[],
            userList:[],
            ifShowUserList:false,
            ifShowBlockUserList:false,
            nowShowUrl:null,
            blockUserPageNum:1,
        }
    },
    methods:{
        setLoading(msg){
            this.$emit("set_loading",msg);
        },
        alert(msg){
            this.$emit("alert",msg);
        },
        showConfirm(){
            if(this.itemType=='article'){
                this.nowShowUrl=(`#/article/${this.itemId}`)
                this.setWebCardState(true);
            }else if(this.itemType=='user'){
                this.nowShowUrl=(`#/author/${this.itemId}`)
                this.setWebCardState(true);
            }else if(this.itemType=='course'){
                this.nowShowUrl=(`#/course/${this.itemId}`)
                this.setWebCardState(true);
            }
        },
        async block(){
            if(this.itemType=='user'){
                this.setLoading(getLoadMsg("正在封禁..."));
                let response=await blockUser(this.itemId,this.blockDays);
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    this.alert(getNormalSuccessAlert("封禁成功"));
                    this.setWebCardState(false);
                    this.blockUserList.unshift({
                        id:this.itemId,
                        blockEndTime: new Date(new Date().getTime()+this.blockDays*24*60*60*1000).toLocaleString(),
                    })
                }else{
                    this.alert(getNormalErrorAlert("封禁失败"));
                }
            }else if(this.itemType=='article'){
                this.setLoading(getLoadMsg("正在封禁..."));
                let response=await blockArticle(this.itemId,this.blockReason);
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    this.alert(getNormalSuccessAlert("封禁成功"));
                    this.setWebCardState(false);
                }else{
                    this.alert(getNormalErrorAlert("封禁失败"));
                }
            }
        },
        unblock(){
            if(this.itemType=='article'){
                this.setLoading(getLoadMsg("正在解封..."));
                let response=unblockArticle(this.itemId,this.blockReason);
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    this.alert(getNormalSuccessAlert("解封成功"));
                }else{
                    this.alert(getNormalErrorAlert("解封失败"));
                }
            }else if(this.itemType=='user'){
                this.setLoading(getLoadMsg("正在解封..."));
                let response=unblockUser(this.itemId);
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    this.alert(getNormalSuccessAlert("解封成功"));
                }else{
                    this.alert(getNormalErrorAlert("解封失败"));
                }
            }
        },
        async freeze(){
            if(this.itemId){
                this.setLoading(getLoadMsg("正在冻结..."));
                let response = await freezeUnfreezeCourse(this.itemId, "freeze");
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    this.alert(getNormalSuccessAlert("已冻结课程"));
                }else{
                    this.alert(getNormalErrorAlert(response.message));
                }
            }else{
                this.alert(getNormalWarnAlert("请设置课程ID"));
            }
        },
        async unfreeze(){
            if(this.itemId){
                this.setLoading(getLoadMsg("正在冻结..."));
                let response = await freezeUnfreezeCourse(this.itemId, "unfreeze");
                this.setLoading(getCancelLoadMsg());
                if(response.status==200){
                    this.alert(getNormalSuccessAlert("已解冻课程"));
                }else{
                    this.alert(getNormalErrorAlert(response.message));
                }
            }else{
                this.alert(getNormalWarnAlert("请设置课程ID"));
            }
        },
        async confirm(){
            if(this.itemType=='article'||this.itemType=='user'){
                this.block();
            }else if(this.itemType=='course'){
                this.freeze();
            }
        },
        rollback(){
            if(this.itemId){
                this.setCourseHistoryState(true);
            }else{
                this.alert(getNormalWarnAlert("请设置课程ID"));
            }
        },
        setUserId(id){
            this.itemType='user';
            this.itemId=id;
        },
        async loadUser(){
            if(this.userList.length>0){
                this.alert(getNormalInfoAlert("没有更多用户了"));
                return;
            }
            this.setLoading(getLoadMsg("正在加载用户列表..."));
            let response=await getUserList();
            this.setLoading(getCancelLoadMsg());
            if(response.status==200||response.status==201){
                for(let i=0;i<response.user_list.length;i++){
                    this.userList.push({
                        id:response.user_list[i].user_id,
                        name:response.user_list[i].user_name,
                        reputation:response.user_list[i].reputation_level,
                        likeNum:response.user_list[i].all_likes,
                        articleNum:response.all_articles,
                        ifMaster:response.user_list[i].master,
                        ifSuper:response.user_list[i].super_master,
                    });
                }
            }
        },
        async loadBlockUser(){
            if(this.blockUserList.length>0){
                this.alert(getNormalInfoAlert("没有更多封禁信息用户了"));
                return;
            }
            this.setLoading(getLoadMsg("正在加载封禁用户列表..."));
            let response=await getBlockedUserList(this.blockUserPageNum);
            this.setLoading(getCancelLoadMsg());
            if(!response.user_list){
                for(let i=0;i<response.user_list.length;i++){
                    this.blockUserList.push({
                        id:response.user_list[i].user_id,
                        name:response.user_list[i].user_name,
                        blockEndTime:response.user_list[i].block_end_time,
                        operator:response.user_list[i].operator,
                        blockReason:response.user_list[i].block_reason,
                    });
                }
                this.blockUserPageNum++;
            }else{
                this.alert(getNormalErrorAlert("无更多封禁用户"));
            }
        },
        async showUserList(){
            this.ifShowUserList=true;
            this.ifShowBlockUserList=false;
            if(this.userList.length>0){
                return;
            }
            this.loadUser();
        },
        showBlockUserList(){
            this.ifShowUserList=false;
            this.ifShowBlockUserList=true;
            if(this.blockUserList.length>0){
                return;
            }
            this.loadBlockUser();
        },

    }
}
</script>
<style scoped>
.user-list-card{
    padding: 10px;
}
.dialog-card-container {
    display: flex;
    justify-content: center;
}
@media screen and (min-width: 600px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
    .card {
        margin:20px;
        width: 750px;
        max-height: 800px;
        padding: 20px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 650px;
        overflow: auto;
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
    .card {
        width: 90vw;
        max-height: 90vh;
        padding: 15px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 80vh;
        overflow: auto;
    }
}
</style>