<template>
    <v-card class="card" @click="click()">
        <div class="row-div">
            <div class="name-container">
                <div class="name title key-text">
                    <with-link-container :init-data="{'content':data.name,'keywords':this.searchQuery}" :clickable="false">
                    </with-link-container>
                </div>
                <div class="row-div">
                    <div class="text-medium msg">
                        课程类型:<span class="key-text">
                            <with-link-container :init-data="{'content':data.type,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-medium msg">
                            开设学院:<span class="key-text">
                                <with-link-container :init-data="{'content':data.college,'keywords':this.searchQuery}" :clickable="false">
                                </with-link-container>
                            </span>
                    </div>
                </div>
                <div class="row-div">
                    <div class="text-medium msg">
                        上课方式:<span class="key-text">
                            <with-link-container :init-data="{'content':data.attendMethod,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                    <div class="text-medium msg">
                        考核方式:<span class="key-text">
                            <with-link-container :init-data="{'content':data.examineMethod,'keywords':this.searchQuery}" :clickable="false">
                            </with-link-container>
                        </span>
                    </div>
                </div>
                <div class="text-small time">
                    <span>{{ this.data.publishTime }}</span>
                </div>
            </div>
            <div class="score-container">
                <div class="title score">
                    {{ data.score }}
                </div>
                <div class="text-small score-num">
                    {{ data.evaluateNum }}个评价
                </div>
            </div>
        </div>
    </v-card>
</template>
<script>
//import SvgIcon from '@jamescoyle/vue-icon';
import { mdiComment, mdiStar } from '@mdi/js';
import { globalProperties } from '@/main';
import { openPage, roundNumber } from '@/utils/other';
import WithLinkContainer from '../common/WithLinkContainer.vue';
export default {
    name: 'CourseItem',
    components: {
        //SvgIcon
        WithLinkContainer,
    },
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    /**
                     * some keys not displayed
                     */
                    id: null,
                    name: null,
                    type: null,
                    campus:null,
                    college:null,
                    credit:null,
                    teacher:null,
                    attendMethod:null,
                    examineMethod:null,
                    score:null,
                    evaluateNum:null,
                    scoreSum:null,
                    publishTime:null,
                    relativeArticles:null,
                }
            }
        },
        searchQuery:{
            type:Array,
            default:()=>{
                return [];
            }
        }
    },
    setup(){
        const lazyImgUrl=globalProperties.$lazyImgUrl;
        const deviceType=globalProperties.$deviceType;
        return{
            deviceType,
            lazyImgUrl,
        }
    },
    data(){
        const data=this.initData;
        data.score=roundNumber(data.score,1);
        return {
            data,
            star:mdiStar,
            comment:mdiComment,
        }
    },
    methods:{
        click(){
            /**
             * open a new tab and go
             */
            openPage("url",{url:"#/course/"+this.data.id})
        }
    }
}
</script>
<style scoped>
.time{
    color: #8a8a8a;
    align-items: center;
    margin-top: 2px;
    display: flex;
    height: 100%;
    width: fit-content;
    flex-direction: row-reverse;
    overflow-x: auto;
}
@media screen and (min-width: 1000px) {
    .card{
        width: 750px;
        padding:10px;
        margin-top: 5px;
    }    
    .row-div{
        display: flex;
        height: 100%;
        flex-direction: row;
        overflow-x: auto;
    }
    .name-container{
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 450px;
        height: 100%;
    }
    .name{
        width: 450px;
        min-height: 27px;
        white-space:nowrap; 
        overflow:hidden;
        text-overflow:ellipsis;
        justify-self: center;
    }
    .score-container{
        margin-left: 50px;
        width: 250px;
        padding: 10px;
        display: grid;
    }
    .score{
        font-weight: bold;
        color: var(--theme-color);
        justify-self: center;
    }
    .score-num{
        color:grey;
        justify-self: center;
    }
    .msg{
        color:grey;
        width: 200px;
        white-space:nowrap; 
        overflow:hidden;
        text-overflow:ellipsis;
    }
}

@media screen and (max-width: 1000px) {
    .card{
        width: 100vw;
        padding:1vw;
        padding: 5px;
        margin-top: 2px;
    }
    .row-div{
        display: flex;
        height: 100%;
        overflow-x: auto;
        flex-direction: row;
    }
    .name-container{
        display: flex;
        flex-direction: column;
        justify-content: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 80vw;
        height: 100%;
    }
    .name{
        width: 70vw;
        min-height: 27px;
        white-space:nowrap; 
        overflow:hidden;
        text-overflow:ellipsis;
    }
    .score-container{
        margin-left: 3vw;
        width: 30vw;
        padding: 10px;
        display: grid;
    }
    .score{
        font-weight: bold;
        color: var(--theme-color);
        justify-self: center;
    }
    .score-num{
        color:grey;
        justify-self: center;
    }
    .msg{
        color:grey;
        margin-right:2vw;
        width: 35vw;
        white-space: nowrap;; 
        overflow:hidden;
        text-overflow:ellipsis;
    }
}
</style>