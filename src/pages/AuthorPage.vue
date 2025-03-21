<template>
    <div class="full-center">
        <author-card @set_loading="setLoading" @alert="alert" :id="id"></author-card>
    </div>
</template>
<script>
import AuthorCard from '@/components/AuthorCard.vue';
import { getCookie } from '@/utils/cookie';

export default{
    name:'AuthorPage',
    setup(){
    },
    components:{
        AuthorCard,
    },
    data(){
        return{
            id:"",
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
        if(this.$route.params.id==getCookie("userId")){
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