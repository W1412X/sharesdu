<template>
    <part-loading-view class="card" :state="!loadState" :text="'正在加载信息...'"></part-loading-view>
    <v-card v-if="loadState" class="card" elevation="1">
        <!-- Avatar and Name Section -->
        <div class="row-no-margin">
            <avatar-name :size="40" :color="'#8a8a8a'" :init-data="{id:data.id,name:data.name}"></avatar-name>
            <v-spacer></v-spacer>
            <v-btn v-if="type=='author'" @click="block" variant="text" icon color="#8a8a8a">
                <v-icon size="28">mdi-cancel</v-icon>
                <v-tooltip activator="parent">
                    拉黑{{ data.name }}
                </v-tooltip>
            </v-btn>
            <v-btn v-if="type=='author'" @click="toSend" variant="text" icon color="#8a8a8a" rounded="true">
                <v-icon icon="mdi-send" size="28"></v-icon>
                <v-tooltip activator="parent">
                    给{{ data.name }}发送私信
                </v-tooltip>
            </v-btn>
            <manage-button v-if="type=='author'&&ifMaster" size="28" style="margin-left: 5px;" :id="data.id" :type="'user'">
            </manage-button>
        </div>
        <div v-if="(data.master || data.superMaster) &&  type=='author'" class="row-div">
                <v-icon size="20">mdi-shield-account</v-icon>
                <div class="text-small-bold margin-left-10px">{{ data.superMaster?"此用户为超级管理员":"此用户为管理员" }}</div>
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
            <v-btn v-if="(data.master || data.superMaster) && this.type==='self'" @click="toManage"  variant="outlined" :color="'#8a8a8a'" prepend-icon="mdi-shield-account">管理网站</v-btn>
        </div>
        <div v-if="type==='author'" class="row-div text-small">
            (仅展示作者的部分创作信息)
        </div>
    </v-card>
</template>

<script>
import { globalProperties } from '@/main';
import AvatarName from '@/components/common/AvatarName';
import { getAuthorInfo } from '@/api/modules/account';
import { formatRelativeTime, getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalSuccessAlert, getNormalWarnAlert, openPage } from '@/utils/other';
import { blockUser } from '@/api/modules/block';
import PartLoadingView from '@/components/common/PartLoadingView.vue';
import ManageButton from '@/components/manage/ManageButton.vue';

export default{
    props:{
        id:{
            type:String,
            default:null,
        },
        type:{
            type:String,
            default:"author",
        },
        ifMaster:{
            type:Boolean,
            default:false,
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
        PartLoadingView,
        ManageButton,
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
            openPage("url",{url:"#/manage"})
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
                if(!this.blockState){
                    response=await blockUser(this.id);
                }else{
                    response={
                        status:-1,
                    }
                }
                if(response.status==200){
                    this.alert(getNormalSuccessAlert('拉黑成功'));
                    this.blockState=!this.blockState;
                }else{
                    this.blockState=!this.blockState;
                    this.alert(getNormalErrorAlert('已拉黑此用户'));
                }
            }else{
                this.alert(getNormalWarnAlert("请勿频繁点击"));
            }
            this.setLoading(getCancelLoadMsg());
            this.lastBlockTime=currentTime;
        },
        toSend(){
            openPage("router",{
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
        let response = await getAuthorInfo(this.id);
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
                registerTime: formatRelativeTime(response.data.created_at),
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
            openPage("router",{ name: 'ErrorPage', params: { reason: "无法找到此用户" } });
        }
    }catch(e){
        this.alert(getNormalErrorAlert("获取用户信息失败"));
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
@media screen and (min-width: 1000px) {
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

@media screen and (max-width: 1000px) {
    .card {
        margin:20px;
        width: 90vw;
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
