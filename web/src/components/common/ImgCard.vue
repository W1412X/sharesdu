<template>
  <v-dialog v-model="ifShowDialog"
    style="display: flex;flex-direction: row;align-items: center;justify-content: center;width: 100%;height: 100%;">
    <div v-if="ifShowImgDetail" style="width: 100%;height:100%;justify-content: center;display: flex">
      <div style="display: flex;flex-direction: column;">
        <v-img class="img-big" :src="src"></v-img>
        <div style="width: 100%;height: 50px;display: flex;align-items: center;justify-content: center;">
          <v-btn style="margin-bottom: 0px;margin-right: 50px;" icon @click="setImgDetailState(false)">
            <v-icon :color="themeColor" :size="25" :icon="'mdi-close'"></v-icon>
            <v-tooltip activator="parent">关闭</v-tooltip>
          </v-btn>
          <v-btn style="margin-bottom: 0px;" icon @click="saveImage">
            <v-icon :color="themeColor" :size="25" :icon="'mdi-tray-arrow-down'"></v-icon>
            <v-tooltip activator="parent">保存此图片</v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
  </v-dialog>
  <div class="img-card-container">
    <v-img @click="imgClick" :lazy-src="lazyImgUrl" :min-height="height" :max-height="height" cover
      :src="ifNeedDeal ? imgUrl : src" :max-width="width" :min-width="width">
      <template v-slot:placeholder>
        <v-row align="center" class="fill-height ma-0" justify="center">
          <v-progress-circular :color="themeColor" indeterminate></v-progress-circular>
        </v-row>
      </template>
    </v-img>
    <v-btn v-if="editable" icon @click="deleteSelf" size="20" text="✕" :color="themeColor" variant="tonal"
      class="close-btn">
    </v-btn>
  </div>
</template>

<script>
import { globalProperties } from '@/main';
import { globalImageCacher } from '@/utils/global_img_cache';
import { fetchImgAndDeal } from '@/utils/image';
import { computed, ref } from 'vue';

export default {
  name: 'ImgCard',
  props: {
    src: {
      type: String,
      default: null
    },
    width: {
      type: Number,
      default: 120
    },
    height: {
      type: Number,
      default: null
    },
    editable: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: true
    },
    ifNeedDeal: {
      type: Boolean,
      default: true
    },
  },
  setup() {
    const themeColor = globalProperties.$themeColor;
    const lazyImgUrl = globalProperties.$imgLazy;
    const ifShowImgDetail = ref(false);
    const ifShowDialog = computed(() => {
      return ifShowImgDetail.value;
    })
    const setImgDetailState = (state) => {
      ifShowImgDetail.value = state;
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
      imgBlob: null,
      imgUrl: this.src,
    }
  },
  watch: {
    src: {
      //eslint-disable-next-line
      async handler(newValue, oldValue) {
        if (this.ifNeedDeal) {
          /**
           * try get from the cache first  
           */
          if (globalImageCacher.getImage(newValue)) {
            this.imgUrl = globalImageCacher.getImage(newValue);
            return;
          }
          this.imgUrl = await fetchImgAndDeal(newValue);
          globalImageCacher.addImage(newValue, this.imgUrl);
        }
      },
      immdiate: false,
    }
  },
  methods: {
    deleteSelf() {
      this.$emit('delete_img', this.src);
    },
    imgClick() {
      if (this.clickable) {
        this.setImgDetailState(true);
      }
    },
    saveImage() {
      const link = document.createElement('a');
      link.href = this.imgUrl;
      link.download = Date.now().toString() + '.jpeg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
  async mounted() {
    if (this.ifNeedDeal) {
      /**
       * try get from the cache first  
       */
      if (globalImageCacher.getImage(this.imgUrl)) {
        this.imgUrl = globalImageCacher.getImage(this.imgUrl);
        return;
      }
      let tmp = await fetchImgAndDeal(this.imgUrl);
      globalImageCacher.addImage(this.imgUrl, tmp);
      this.imgUrl = tmp;

    }
    this.loadState = true;
  }
}
</script>

<style scoped>
.img-card-container {
  position: relative;
  margin: 1px;
}

.img-big {
  max-width: 80vw;
  max-height: 80vh;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
}
</style>