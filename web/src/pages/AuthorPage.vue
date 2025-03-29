<template>
    <div class="full-center">
        <author-card v-if="this.id" @set_loading="setLoading" @alert="alert" :id="id"></author-card>
    </div>
</template>
<script>
import AuthorCard from '@/components/AuthorCard.vue';
import { getCookie } from '@/utils/cookie';
import { getCancelLoadMsg } from '@/utils/other';

export default{
    name:'AuthorPage',
    setup(){
    },
    components:{
        AuthorCard,
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
        }
    },
    async mounted(){
        this.setLoading(getCancelLoadMsg());
        
        if(this.$route.params.id==getCookie("userId")){
            console.log("from author to self");
            this.$router.push({name:'SelfPage',params:{id:getCookie("userId")}})
            return;
        }
        this.id=this.$route.params.id;
    },
}
</script>
<style scoped>
@media screen and (min-width: 600px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
}
@media screen and (max-width: 600px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
}
</style>