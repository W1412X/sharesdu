<template>
    <div v-if="state">
        <v-card class="card">
            <div class="card-container">
                <v-progress-circular :rotate="360" :size="40" :width="4" :color="themeColor"
                    class="text-medium-bold" indeterminate>
                </v-progress-circular>
            </div>
            <div style="
            width: 100%;
            display: flex;
            justify-content: center;
            color: #8a8a8a;
            font-weight: bold;
          ">
          <div class="card-container">
            <v-card-text style="
              max-width: 200px;
              width: fit-content;
              margin-top: 15px;
              padding-top: 0px;
              margin-bottom: 5px;
              padding-bottom: 0px;
              font-weight: 600;
            ">
                    {{ text }}
                </v-card-text>
          </div>
            </div>
        </v-card>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import { computed } from 'vue';
export default {
    name: "PartLoadingView",
    props: {
        state:{
            type: Boolean,
            default: false
        },
        text:{
            type: String,
            default: '加载中...'
        },
    },
    setup() {
        /**
         * get theme color  
         */
        const themeColor = globalProperties.$themeColor;
        const deviceType = globalProperties.$deviceType;
        return {
            themeColor,
            deviceType
        }
    },
    data() {
        const data = computed(() => {
            return this.initData;
        })
        return {
            data
        }
    },
    methods: {}
}
</script>
<style scoped>
@media screen and (min-width: 1000px) {
    .card-container{
        display: grid;
        justify-content: center;
        align-items: center;
    }
    .card {
        padding: 10px;
        width: 100%;
        height: fit-content;
    }
}

@media screen and (max-width: 1000px) {
    .card-container{
        display: grid;
        justify-content: center;
        align-items: center;
    }
    .card {
        padding: 10px;
        width: 100%;
        height: fit-content;
    }
}
</style>