<template>
    <v-dialog v-model="ifShow" style="width: 100%;height:100%;justify-content: center;">
        <div style="width: 100%;height:100%;justify-content: center;display: flex">
            <v-card class="card">
                <div class="card-container">
                    <v-progress-circular v-if="data.progress >= 0" v-model="data.progress" :rotate="360" :size="50"
                        :width="5" :color="themeColor" class="text-tiny">
                        {{ data.progress }}%
                    </v-progress-circular>
                    <v-progress-circular v-if="data.progress < 0" :rotate="360" :size="50" :width="5"
                        :color="themeColor" class="text-medium-bold" indeterminate>
                    </v-progress-circular>
                </div>
                <div style="
            width: 100%;
            display: flex;
            justify-content: center;
            color: #8a8a8a;
            font-weight: bold;
          ">
                    <v-card-text style="
              max-width: 200px;
              margin-top: 15px;
              padding-top: 0px;
              margin-bottom: 5px;
              padding-bottom: 0px;
              font-weight: 600;
            ">
                        {{ data.text }}
                    </v-card-text>
                </div>
            </v-card>
        </div>
    </v-dialog>
</template>
<script>
import { globalProperties } from '@/main';
import { computed } from 'vue';
export default {
    name: "LoadingView",
    props: {
        initData: {
            type: Object,
            default: () => {
                return {
                    state: false,
                    text: '加载中...',
                    progress: 0
                }
            }
        }
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
        const ifShow=computed(()=>{
            return this.initData.state;
        })
        return {
            data,
            ifShow
        }
    },
    methods: {}
}
</script>
<style scoped>
@media screen and (min-width: 1000px) {
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: grid;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .card-container {
        display: grid;
        justify-content: center;
        align-items: center;
    }

    .card {
        padding: 10px;
        width: fit-content;
        height: fit-content;
    }
}

@media screen and (max-width: 1000px) {
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: grid;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .card-container {
        display: grid;
        justify-content: center;
        align-items: center;
    }

    .card {
        padding: 10px;
        width: fit-content;
        height: fit-content;
    }
}
</style>