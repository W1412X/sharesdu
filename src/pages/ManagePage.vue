<template>
        <div class="full-center">
            <v-card class="card column-div-scroll">
                <v-select  label="封禁类型" density="compact" variant="outlined" :items="['article','user']" v-model="itemType"></v-select>
                <v-textarea  label="ID" rows="1" density="compact" variant="outlined" v-model="itemId" :hint="'ID'"></v-textarea>
                <v-textarea
                    v-if="itemType === 'user'"
                    label="封禁时间（整数1-90）"
                    rows="1"
                    density="compact"
                    variant="outlined"
                    v-model="blockDays"
                />
                <v-textarea  v-if="itemType=='article'" label="封禁原因" rows="2" density="compact" variant="outlined" v-model="otherMsg"></v-textarea>
                <div style="display: flex;flex-direction: row-reverse;align-items: center;">
                    <v-btn variant="outlined" @click="block" :color="themeColor" prepend-icon="mdi-lock">封禁</v-btn>
                    <v-btn variant="outlined" style="margin-right: 10px;" @click="unblock" :color="themeColor"  prepend-icon="mdi-lock-open-variant">解封</v-btn>
                    <v-spacer></v-spacer>
                    <span style="color: #8a8a8a;" class="text-medium"></span>    
                </div>

                <v-card variant="outlined" class="column-div-scroll user-list-card" style="margin-top: 10px;">
                    <div style="display: flex;flex-direction: row;align-items: center;">
                        <v-icon size="30" color="#8a8a8a">mdi-account-cancel</v-icon>
                        <span style="color: #8a8a8a;margin-left: 10px;" class="text-medium-bold">封禁列表</span>
                    </div>
                    <div v-for="(item,index) in this.blockUserList" :key="index" style="display: flex;flex-direction: column;align-items: center;padding: 5px;">
                        <avatar-name :init-data="{id:item.id,name:item.username}"></avatar-name>
                        <div>由 {{ item.operator }} 封禁至 {{ item.endTime }}</div>
                    </div>
                    <v-btn variant="tonal" style="width: 100%;">加载更多</v-btn>
                </v-card>
            </v-card>
        </div>
</template>
<script>
import AvatarName from '@/components/AvatarName.vue';
import { globalProperties } from '@/main';
import { getCancelLoadMsg, getLoadMsg } from '@/utils/other';

export default{
    setup(){
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    components:{
        AvatarName,
    },
    data(){
        return{
            itemType:null,
            itemId:null,
            blockDays:0,
            blockReason:null,
            blockUserList:[],
        }
    },
    methods:{
        setLoading(msg){
            this.$emit("set_loading",msg);
        },
        alert(msg){
            this.$emit("alert",msg);
        },
        block(){
            if(this.itemType=='article'){
                this.setLoading(getLoadMsg("正在封禁..."));
                this.setLoading(getCancelLoadMsg());
            }else if(this.itemType=='user'){
                this.setLoading(getLoadMsg("正在解封..."));
                this.setLoading(getCancelLoadMsg());
            }
        },
        unblock(){
            if(this.itemType=='article'){
                this.setLoading(getLoadMsg("正在封禁..."));
                this.setLoading(getCancelLoadMsg());
            }else if(this.itemType=='user'){
                this.setLoading(getLoadMsg("正在封禁..."));
                this.setLoading(getCancelLoadMsg());
            }
        },
        loadMore(){

        }
    }
}
</script>
<style scoped>
.user-list-card{
    padding: 10px;
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
        margin:20px;
        max-height: 90vh;
        padding: 15px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 60vh;
        overflow: auto;
    }
}
</style>