<!--  -->
<template>
    <div class="avatar-name" @click="toAuthorPage">
        <div class="avatar">
            <img :src="initData.avatar" alt="">
        </div>
        <div class="name">
            {{initData.name}}
        </div>
    </div>
</template>
<script>
export default {
    props:{
        initData: {
            type: Object,
            default: function () {
                return {
                    avatar: null,
                    name: null,
                }
            }
        }
    },
    methods: {
        toAuthorPage(){
            this.$router.push({
                name: 'AuthorPage',
                params: {
                    name: this.initData.name
                }
            })
        }
    }
}
</script>
<style scoped>
.avatar-name{
    display: flex;
    align-items: center;
    gap: 10px;
}
.avatar{
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    img{
        width: 100%;
        height: 100%;
    }
}
.name{
    font-size: 16px;
}
</style>