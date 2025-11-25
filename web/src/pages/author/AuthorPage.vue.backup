<template>
    <div class="full-center">
        <div style="display: grid;flex-direction: column;place-items:center;">
            <author-card v-if="this.id" @set_loading="setLoading" @alert="alert" @author_name="handleName" :if-master="ifMaster" :id="id"></author-card>
            <create-preview-and-list v-if="this.id" :type="'preview'" @alert="alert" @set_loading="setLoading" :user-id="id"></create-preview-and-list>
        </div>
    </div>
</template>
<script>
import AuthorCard from '@/components/user/AuthorCard.vue';
import CreatePreviewAndList from '@/components/user/CreatePreviewAndList.vue';
import { getCookie } from '@/utils/cookie';
import { getCancelLoadMsg, getLoadMsg, openPage } from '@/utils/other';

export default{
    name:'AuthorPage',
    setup(){
        const ifMaster=getCookie('ifMaster');
        return {
            ifMaster,
        }
    },
    components:{
        AuthorCard,
        CreatePreviewAndList,
    },
    data(){
        return{
            id:null,
        }
    },
    methods:{
        setLoading(msg){
            this.$emit('set_loading',msg);
        },
        alert(msg){
            this.$emit('alert',msg);
        },
        handleName(name){
            document.getElementById('web-title').innerText='作者 | '+name;
        }
    },
    async mounted(){
        this.setLoading(getLoadMsg("正在加载作者信息..."));
        if(this.$route.params.id==getCookie("userId")){
            openPage("router",{name:'SelfPage',params:{id:getCookie("userId")}})
            return;
        }
        this.id=this.$route.params.id;
        this.setLoading(getCancelLoadMsg());
    },
}
</script>
<style scoped>
@media screen and (min-width: 1000px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
}
@media screen and (max-width: 1000px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
}
</style>