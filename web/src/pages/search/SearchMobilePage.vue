<template>
    <div style="width: 100vw;display: flex;flex-direction: column;">
        <history-card :input-style="{width:'100vw'}"></history-card>
        <recommend-card :input-style="{width:'100vw'}"></recommend-card>
    </div>
</template>
<script>
import HistoryCard from '@/components/common/searchInput/utils/HistoryCard.vue';
import RecommendCard from '@/components/common/searchInput/utils/RecommendCard.vue';
export default{
    setup(){

    },
    components:{
        HistoryCard,
        RecommendCard,
    },
    data(){

    },
    methods:{

    }
}
</script>