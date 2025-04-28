<template>
    <div class="full-center">
        <div style="width: max-content;display: flex;flex-direction: column;justify-content: center;">
            <div class="title">
                (￣_￣)・・・ <br />{{ reason }} <br />
            </div>
            <v-btn @click="goBack" style="margin-top: 10px;" variant="outlined" :color="themeColor" :text="'返回上一页'"></v-btn>
        </div>
    </div>
</template>

<script>
import { globalProperties } from '@/main';
import { getCancelLoadMsg } from '@/utils/other';

export default {
    name: 'ErrorPage',
    props: {
        reason: {
            type: String,
            default: "此资源不存在"
        }
    },
    setup() {
        const themeColor=globalProperties.$themeColor;
        return {
            themeColor,
        }
    },
    data() {
        return {  
        };
    },
    methods: {
        goBack() {
            try{
                let tmp=JSON.parse(sessionStorage.getItem("lastTwoRouter"));
                this.$router.push(tmp.from);   
            }catch(e){
                this.$router.push({name:"IndexPage"});
            }
        }
    },
    mounted() {
        this.$emit("set_loading",getCancelLoadMsg());
    }
}
</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
    .full-center {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        height: 100%;
        margin-top: 20px;
        justify-content: center;
    }
    .title {
        width: fit-content;
        font-size: 28px;
        font-weight: 600;
        margin: 10px;
    }
}

/** mobile */
@media screen and (max-width: 1000px) {
    .full-center {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        height: 100%;
        justify-content: center;
        margin-top: 20px;
    }
    .title {
        width: fit-content;
        font-size: 28px;
        font-weight: 600;
        margin: 10px;
    }
}
</style>
