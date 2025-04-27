<template>
    <div class="container">
        <div class="row-div">
            <avatar-name v-if="data.authorId" :initData="{
                name:data.authorName,
                id:data.authorId
            }"></avatar-name>
        </div>
        <div style="display: flex; align-items: center">
            <v-rating :model-value="data.score" size="small" density="compact"
                class="rating-div"
                :color="themeColor" :disabled="true"></v-rating>
        </div>
        <div class="text-medium support-line-feed">
            {{ data.comment }}
        </div>
        <div style="display:flex;flex-direction: row;margin-top:5px;color:#8a8a8a">
            <span style="font-size: 16px;">{{ data.time }}</span>
            <v-spacer></v-spacer>
            <!--
            <like-button :id="data.id" :type="'evaluation'" style="margin-right:10px;"></like-button>
            -->
            <alert-button :id="data.id" :type="'evaluation'"></alert-button>
        </div>
    </div>
</template>
<script>
import AlertButton from '@/components/report/AlertButton.vue';
import AvatarName from '@/components/common/AvatarName.vue';
import { globalProperties } from '@/main';
export default {
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    id: null,
                    authorName: null,
                    authorProfileUrl:null,
                    authorId:null,
                    score: null,
                    comment: null,
                    time: null,
                }
            }
        }
    },
    components: {
        AlertButton,
        AvatarName,
    },
    setup() {
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    data() {
        const data=this.initData;
        return {
            data,
        }
    },
    methods: {
    },
}
</script>
<style scoped>
.row-div{
    display: flex; 
    flex-direction: row;
}
.name{
    margin-left: 10px;
    display: flex;
    align-items: center;
}
.rating-div{
    margin-top: 0px;
    margin-bottom: 2px;
    margin-left: 5px;
}
@media screen and (min-width: 1000px) {
    .container {
        width: 800px;
        border-top: #8a8a8a solid 1px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: #ffffff;
    }
}

@media screen and (max-width: 1000px) {
    .container {
        width: 100vw;
        border-top: #8a8a8a solid 1px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        background-color: #ffffff;
    }
}
</style>