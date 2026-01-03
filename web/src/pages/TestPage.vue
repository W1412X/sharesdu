<template>
    <div style="width: 1000px;height: 500px;">
        <SearchInput></SearchInput>
        <v-btn @click="click">click</v-btn>
    </div>
</template>
<script>
import SearchInput from '@/components/common/searchInput/SearchInput.vue';
import EventBus from '@/utils/eventBus';
export default {
    name: 'TestPage',
    setup(){
        let e1=new EventBus("1");
        let e2=new EventBus("2");
        e1.emit("1e1-event","e1");
        e1.emit("2e2-event","e2");
        e1.on("1e1-event",(data)=>{
        })
        e2.on("2e2-event",(data)=>{
        })
        e1.on("2e2-event",(data)=>{
        })
    },
    components:{
        SearchInput,
    },
    methods:{
        click(){
        }
    }
}
</script>