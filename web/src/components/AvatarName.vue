<!--  -->
<template>
    <div class="avatar-name" @click="toAuthorPage">
        <v-icon v-if="this.profileUrl==null" icon="mdi-account-circle" :size="size" color='#bbbbbb'></v-icon>
        <v-avatar v-if="this.profileUrl!=null" :size="size" :image="this.profileUrl"></v-avatar>
        <div v-if="ifShowName"   :style="{color:color,'font-size':nameSize+'px'}">
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
        },
        clickable:{
            type: Boolean,
            default: true
        },
        ifShowName:{
            type: Boolean,
            default: true
        },
        nameSize:{
            type: String,
            default: '16'
        }
    },
    data(){
        return{
            profileUrl:null,
            time:1000,
        }
    },
    methods: {
        toAuthorPage(){
            if(!this.clickable){
                return;
            }
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
        },
        async getProfile(){
            try {
                let response = await getUserProfileImageUpdateInfo([this.initData.id]);
                if (response.status == 200 && !response.time_list[0].error) {
                    let time = response.time_list[0].created_at;
                    this.profileUrl = await getProfileUrlInDB(this.initData.id, time);
                }
            } catch (e) {
                // eslint-disable-next-line
            }
        },
        async getProfileRecursion(){
            if(this.initData.id&&getCookie('accessToken')){
                await this.getProfile();
            }else{
                setTimeout(()=>{
                    this.getProfileRecursion();
                    this.time=this.time*2;
                },this.time);
            }
        }
    },
    async mounted(){
        await this.getProfileRecursion();
    }
}
</script>
<style scoped>
.avatar-name{
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>