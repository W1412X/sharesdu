<template>
    <v-card v-if="loadState" class="card" elevation="1">
        <!-- Avatar and Name Section -->
        <div class="row-no-margin">
            <avatar-name :size="40" :color="'#8a8a8a'" :init-data="{id:data.id,name:data.name}"></avatar-name>
            <v-spacer></v-spacer>
            <v-btn v-if="type=='author'" @click="block" style="margin-right: 10px;" variant="text" icon="mdi-cancel" size="30" color="#8a8a8a" rounded="true">
            </v-btn>
            <v-btn v-if="type=='author'" @click="toSend" variant="text" icon="mdi-send" size="30" color="#8a8a8a" rounded="true">
            </v-btn>
        </div>
        <!-- Registration Time Section -->
        <div class="row-div text-small">
            <v-icon size="20" class="icon-left-10px">mdi-calendar-clock</v-icon>
            <span class="margin-left-10px">{{  data.registerYear?data.registerYear:data.registerTime }}</span>
        </div>

        <!-- Reputation and Level Section -->
        <div class="row-div text-medium">
            <v-icon size="20" class="icon-left-10px">mdi-trophy</v-icon>
            <span v-if="type=='self'" class="margin-left-10px">{{ "LV." + data.reputation }}</span>
            <v-chip class="margin-left-10px" density="compact" style="margin-left: 5px;" variant="tonal" :color="themeColor" :text="data.reputationLevel"></v-chip>
        </div>

        <!-- Campus, College, Major Section -->
        <div class="row-div text-medium">
            <v-icon size="20" class="icon-left-10px">mdi-school</v-icon>
            <span class="margin-left-10px">{{ data.campus + " " + data.college + " " + data.major }}</span>
        </div>

        <!-- Article, Post, and Reply Count Section -->
        <div v-if="type=='self'" class="row-div text-medium">
            <v-icon size="21" class="icon-left-10px">mdi-file-document</v-icon>
            <span class="margin-left-10px margin-right-20px">{{  data.articleNum }}</span>
            <v-icon size="20" class="icon-left-10px">mdi-comment</v-icon>
            <span class="margin-left-10px margin-right-20px">{{  data.postNum  }}</span>
            <v-icon size="22" class="icon-left-10px">mdi-reply</v-icon>
            <span class="margin-left-10px margin-right-20px">{{  data.replyNum }}</span>
        </div>

        <!-- Block Status Section -->
        <div v-if="data.blockStatus" class="row-div text-medium">
            <v-icon size="20" class="icon-left-10px">mdi-block-helper</v-icon>
            <span class="margin-left-10px" :color="themeColor">{{ "封禁至: " + data.blockEndTime }}</span>
        </div>
        <!-- Management Section -->
        <div class="row-div text-medium">
            <v-spacer></v-spacer>
            <v-icon v-if="(data.master || data.superMaster) &&  type=='author'">mdi-shield-account</v-icon>
            <v-btn v-if="(data.master || data.superMaster) && this.type==='self'" @click="toManage"  variant="outlined" :color="'#8a8a8a'" prepend-icon="mdi-shield-account">管理网站</v-btn>
        </div>
        <div v-if="type==='author'" class="row-div text-small">
            (仅展示作者的部分创作信息)
        </div>
    </v-card>
</template>

<script>
import { globalProperties } from '@/main';
import AvatarName from './AvatarName.vue';
import { getAuthorInfo } from '@/axios/account';
import { extractTime, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, getNormalWarnAlert, openNewPage } from '@/utils/other';
import { blockUser, unblockUser } from '@/axios/block';

export default{
    props:{
        id:{
            type:String,
            default:null,
        },
        type:{
            type:String,
            default:"author",
        }
    },
    setup(){
        const themeColor = globalProperties.$themeColor;
        return {
            themeColor,
        };
    },
    components:{
        AvatarName,
    },
    data(){
        return {
            data: {},
            loadState:false,
            lastBlockTime:0,//same function as above
            clickThreshold:3000,//ms
            blockState:false,
        };
    },
    methods:{
        setLoading(msg){
            this.$emit("set_loading", msg);
        },
        alert(msg){
            this.$emit("alert", msg);
        },
        toManage(){
            openNewPage("/#/manage");
        },
        async block(){
            /**
             * block state  
             */
            this.setLoading(getLoadMsg('正在设置',-1))
            const currentTime=new Date().getTime();
            if(currentTime-this.lastBlockTime>this.clickThreshold){
                /**
                 * set block state
                 */
                let response;
                if(this.blockState){//already block  
                    response=await unblockUser(this.id);
                    
                }else{
                    response=await blockUser(this.id);
                }
                if(response.status==200){
                    this.alert(getNormalSuccessAlert('设置成功'));
                    this.blockState=!this.blockState;
                }else{
                    this.blockState=!this.blockState;
                    this.alert(getNormalErrorAlert(response.message))
                }
            }else{
                this.alert(getNormalWarnAlert("请勿频繁点击"));
            }
            this.setLoading(getCancelLoadMsg());
            this.lastBlockTime=currentTime;
        },
        toSend(){
            this.$router.push({
                name:"ChatPage",
                params:{
                    id:this.id,
                    name:this.data.name,
                }
            })
        }
    },
    async mounted(){
    try {

        this.setLoading(getLoadMsg("正在获取用户信息..."));
        let response = await getAuthorInfo(this.id);
        this.setLoading(getCancelLoadMsg());
        if (response.status == 200) {
            this.data = {
                id: response.data.user_id,
                name: response.data.user_name,
                email: response.data.email,
                reputation: response.data.reputation,
                reputationLevel: response.data.reputation_level,
                master: response.data.master,
                superMaster: response.data.superMaster,
                campus: response.data.campus,
                college: response.data.college,
                major: response.data.major,
                articleNum: response.data.all_articles,
                postNum: response.data.all_posts,
                replyNum: response.data.all_replys,
                blockStatus: response.data.block_status,
                blockEndTime: response.data.block_end_time,
                registerTime: extractTime(response.data.created_at),
                registerYear: response.data.registration_year,
            };
            if(!this.data.campus){
                this.data.campus="未知校区";
            }
            if(!this.data.college){
                this.data.college="未知学院";
            }
            if(!this.data.major){
                this.data.major="未知专业";
            }
            this.$emit("author_name",this.data.name);
            this.loadState=true;
        } else {
            this.alert(getNormalErrorAlert(response.message));
            this.$router.push({ name: 'ErrorPage', params: { reason: "无法找到此用户" } });
        }
    }catch(e){
        this.alert(getNormalErrorAlert("获取用户信息失败"));
        console.log(e);
    }
    }
};
</script>

<style scoped>
.row-reverse-div {
    margin-top: 5px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    margin-bottom: 5px;
}

.btn {
    margin-right: 20px;
}

.item-container {
    display: flex;
    flex-direction: column;
    padding: 5px;
    width: 100%;
}

.with-border {
    border-radius: 5px;
    border: 1px solid var(--theme-color-transparent);
}
.row-div {
    width: 100%;
    color: grey;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 30px;
    padding-right: 20px;
}
.row-no-margin{
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}
.column-div {
    display: flex;
    flex-direction: column;
}

.margin-left-10px{
    margin-left: 10px;
}
.margin-right-20px{
    margin-right: 20px;
}
@media screen and (min-width: 600px) {
    .card {
        margin:20px;
        width: 750px;
        max-height: 800px;
        padding: 20px;
        background-color: var(--theme-color-transparent);
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 650px;
        overflow: auto;
    }
}

@media screen and (max-width: 600px) {
    .card {
        margin:20px;
        width: 100vw;
        max-height: 90vh;
        padding: 15px;
        background-color: var(--theme-color-transparent);
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 80vh;
        overflow: auto;
    }
}
</style>
