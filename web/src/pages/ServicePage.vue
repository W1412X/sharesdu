<template>
    <div class="full-center">
        <nothing-view icon="mdi-eye-remove" color="#8a8a8a" text="此模块仍在开发ING"></nothing-view>
    </div>
</template>
<script>
import NothingView from '@/components/common/NothingView.vue';
export default{
    components:{
        NothingView
    }
}
</script>
<style lang="css" scoped>
.full-center{
    width: 100vw;
    justify-content: center;
    align-items: center;
}
</style>