<!--  -->
<template>
    <div class="avatar-name" @click="toAuthorPage">
        <v-avatar :size="size" :image="initData.avatar"></v-avatar>
        <div class="name" :style="{color:color}">
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
                    id:null,
                    avatar: null,
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
    methods: {
        toAuthorPage(){
            this.$router.push({
                name: 'AuthorPage',
                params: {
                    id: this.initData.id
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
.name{
    font-size: 16px;
}
</style>