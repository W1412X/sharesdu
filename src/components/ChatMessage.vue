<template>
    <div class="container">
        <!--
            <div class="avatar">
                <img :src="initData.avatar" alt="">
            </div>
        -->
        <div v-if="data.isSelf" class="row-div">
            <v-card class="message-card">
                <div class="message-text text-medium">
                    {{data.content}}
                </div>
            </v-card>
            <div class="column-div-reverse">
                <v-icon class="more-btn" variant="text" size="20" density="compact" color="grey" @click="setShowMoreState(!this.ifShowMore)" icon="mdi-dots-vertical">
                </v-icon>
                <v-card v-if="ifShowMore" class="column-div-reverse message-more-card">
                    <v-btn prepend-icon="mdi-alert-circle-outline" text="举报" variant="text"></v-btn>
                    <v-btn prepend-icon="mdi-email-arrow-left-outline" text="撤回" variant="text"></v-btn>
                </v-card>
            </div>
        </div>
        <div v-if="!data.isSelf" class="row-div-reverse">
            <v-card class="message-card">
                <div class="message-text text-medium">
                    {{data.content}}
                </div>
            </v-card>
            <div class="column-div-reverse">
                <v-icon class="more-btn" variant="text" size="20" density="compact" color="grey" @click="setShowMoreState(!this.ifShowMore)" icon="mdi-dots-vertical">
                </v-icon>
                <v-card v-if="ifShowMore" class="column-div-reverse message-more-card">
                    <v-btn prepend-icon="mdi-alert-circle-outline" text="举报" variant="text"></v-btn>
                    <v-btn prepend-icon="mdi-email-arrow-left-outline" text="撤回" variant="text"></v-btn>
                </v-card>
            </div>
        </div>
    </div>
</template>
<script>
import { ref } from 'vue';
export default {
    name: 'ChatMessage',
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    id:null,
                    content: null,
                    time: null,
                    isSelf: null,//bool
                }
            },
        },
    },
    setup(){
        var ifShowMore=ref(false);
        const setShowMoreState=(state)=>{
            ifShowMore.value=state;
        }
        return{
            ifShowMore,
            setShowMoreState,
        }
    },
    data(){
        var data=this.initData;
        return{
            data,
        }
    },
    methods: {
    }
}
</script>
<style scoped>
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
.row-div{
    display: flex;
    flex-direction: row;
    bottom:5px;
}
.row-div-reverse{
    display: flex;
    flex-direction: row-reverse;
    bottom:5px;
}
.message-text{
    white-space: normal;
    word-break: break-all;
    overflow: hidden;
    color: black;
}
.message-more-card{
    position: fixed;
    margin-left: 30px;
}
.bottom-bar{
    display: flex;
    flex-direction: row;
    margin-top: 2px;
    margin-left: 0px;
}
.bottom-bar-reverse{
    display: flex;
    flex-direction: row;
    margin-top: 2px;
    flex-direction: row-reverse;
}
.time-text{
    color: grey;
}
.more-btn{ 
    margin-bottom: 5px;
}
.column-div-reverse{
    display: flex;
    flex-direction: column-reverse;
}
@media screen and (min-width: 600px) {
    .container {
        width: 100%;
        display: flex;
        padding:10px;
        flex-direction: column;
    }
    .message-card{
        padding:10px;
        width: fit-content;
        max-width: 600px;   
    }
}

@media screen and (max-width: 600px) {
    .container {
        width: 100vw;
        display: flex;
        padding:10px;
        flex-direction: column;
    }
    .message-card{
        padding:10px;
        width: fit-content;
        max-width: 60vw;         
    }
}
</style>