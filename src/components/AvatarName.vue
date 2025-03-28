<!--  -->
<template>
    <div class="avatar-name" @click="toAuthorPage">
        <v-icon color="#8a8a8a" v-if="this.profileUrl===null"  :size="size" type="mdi" icon="mdi-account-circle"/>
        <v-avatar v-else :size="size" :image="this.profileUrl"></v-avatar>
        <div class="name" :style="{color:color}">
            {{initData.name}}
        </div>
    </div>
</template>
<script>
import { getUserProfileImageUpdateInfo } from '@/axios/image'
import { getCookie } from '@/utils/cookie'
import { getProfileUrlInDB } from '@/utils/profile'

export default {
    props:{
        initData: {
            type: Object,
            default: function () {
                return {
                    id:null,
                    name: null,
                }
            }
        },
        size:{
            type: String,
            default: '30'
        },
        color:{
            type: String,
            default: '#000'
        }
    },
    data(){
        return{
            profileUrl:null,
        }
    },
    methods: {
        toAuthorPage(){
            if(getCookie("userId")==this.initData.id){
                this.$router.push({
                    name: 'SelfPage',
                    params: {
                        id: this.initData.id
                    }
                });
            }else{
                this.$router.push({
                    name: 'AuthorPage',
                    params: {
                        id: this.initData.id
                    }
                })
            }
        }
    },
    async mounted(){
        //get the update message first  
        try{
            let response=await getUserProfileImageUpdateInfo([this.initData.id]);
            if(response.status==200&&!response.time_list[0].error){
                let time=response.time_list[0].created_at;
                this.profileUrl=await getProfileUrlInDB(this.initData.id,time);
            }
        }catch(e){
            // eslint-disable-next-line
        }
        //to do optimize the updatetime logic  

    }
}
</script>
<style scoped>
.avatar-name{
    display: flex;
    align-items: center;
    gap: 10px;
}
.name{
    font-size: 16px;
}
</style>