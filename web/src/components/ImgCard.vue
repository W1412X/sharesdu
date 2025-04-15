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
      <v-img @click="imgClick" :lazy-src="lazyImgUrl" :min-height="height" :max-height="height" cover :src="imgUrl" :max-width="width" :min-width="width">
        <template v-slot:placeholder>
          <v-row
            align="center"
            class="fill-height ma-0"
            justify="center"
          >
            <v-progress-circular
              color="grey-lighten-5"
              indeterminate
            ></v-progress-circular>
          </v-row>
        </template>
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
import { fetchImgAndDeal } from '@/utils/image';
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
        default: null
      },
      editable:{
        type:Boolean,
        default:false
      },
      clickable:{
        type:Boolean,
        default:true
      }
    },
    setup() {
        const themeColor=globalProperties.$themeColor;
      const lazyImgUrl = globalProperties.$imgLazy;
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
        imgBlob:null,
        imgUrl:this.src,
      }
    },
    methods: {
        deleteSelf() {
            this.$emit('delete_img',this.src);
        },
        imgClick(){
            if(this.clickable){
                this.setImgDetailState(true);
            }
        }
    },
    async mounted() {
      this.imgUrl=await fetchImgAndDeal(this.imgUrl);
      this.loadState=true;
    }
  }
  </script>
  
  <style scoped>
  .img-card-container {
    position: relative;
    margin: 1px;
  }
  .img-big{
    max-width: 80vw;
    max-height: 80vh;
  }
  .close-btn{
    position: absolute; top: 5px; right: 5px; z-index: 10;
  }
  </style>
  