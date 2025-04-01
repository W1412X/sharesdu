<template>
    <v-dialog v-model="ifShowDialog" style="display: flex;flex-direction: row;align-items: center;justify-content: center;width: 100%;height: 100%;">
        <div v-if="ifShowImgDetail" style="width: 100%;height:100%;justify-content: center;display: flex">
            <div style="display: flex;flex-direction: column;">
                <div style="display: flex;flex-direction: row;width: 100%;">
                    <v-spacer></v-spacer>
                    <v-icon icon="mdi-close" size="20" :color="themeColor" @click="setImgDetailState(false)"></v-icon>
                </div>
                <img class="img-big" :src="src"><img/>
            </div>
        </div>
    </v-dialog>
    <div class="img-card-container">
      <v-img @click="setImgDetailState(true)" :lazy-src="lazyImgUrl" :min-height="height" :max-height="height" cover :src="loadState ? src : lazyImgUrl" :max-width="width" :min-width="width">
      </v-img>
      <v-btn 
        v-if="editable"
        icon 
        @click="deleteSelf" 
        size="20"
        text="✕"
        :color="themeColor"
        variant="tonal"
        class="close-btn"
      >
      </v-btn>
    </div>
  </template>
  
  <script>
  import { globalProperties } from '@/main';
import { computed, ref } from 'vue';
  
  export default {
    name: 'ImgCard',
    props: {
      src: {
        type: String,
        default: null
      },
      width:{
        type: Number,
        default: 120
      },
      height:{
        type: Number,
        default: 120
      },
      editable:{
        type:Boolean,
        default:false
      }
    },
    setup() {
        const themeColor=globalProperties.$themeColor;
      const lazyImgUrl = globalProperties.$lazyImgUrl;
      const ifShowImgDetail=ref(false);
      const ifShowDialog=computed(()=>{
        return ifShowImgDetail.value;
      })
      const setImgDetailState=(state)=>{
        ifShowImgDetail.value=state;
      }
      return {
        lazyImgUrl,
        ifShowDialog,
        ifShowImgDetail,
        setImgDetailState,
        themeColor,
      }
    },
    data() {
      return {
        loadState: false,
      }
    },
    methods: {
        deleteSelf() {
            this.$emit('delete_img',this.src);
        }
    },
    mounted() {
        this.loadState=true;
    }
  }
  </script>
  
  <style scoped>
  .img-card-container {
    position: relative;
  }
  .img-big{
    max-width: 80vw;
    max-height: 80vh;
  }
  .close-btn{
    position: absolute; top: 5px; right: 5px; z-index: 10;
  }
  </style>
  