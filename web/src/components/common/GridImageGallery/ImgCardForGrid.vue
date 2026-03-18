<template>
  <div class="img-card-container">
    <v-img :src="imgUrl" :lazy-src="lazyImgUrl" cover style="object-fit: cover; width: 100%; height: 100%;">
      <template v-slot:placeholder>
        <div class="img-skeleton"></div>
      </template>
    </v-img>
  </div>
</template>
  
  <script>
  import { globalProperties } from '@/main';
  import { globalImageCacher } from '@/utils/global_img_cache';
  import { fetchImgAndDeal } from '@/utils/imageUtils';
  
  export default {
    name: 'ImgCardForGrid',
    props: {
      src: {
        type: String,
        default: null
      },
      ifNeedDeal: {
        type: Boolean,
        default: true
      }
    },
    setup() {
      const lazyImgUrl = globalProperties.$imgLazy;
      return { lazyImgUrl };
    },
    data() {
      return {
        imgUrl: this.src,
        loadState: false,
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
            try {
              this.imgUrl = await fetchImgAndDeal(newValue);
              globalImageCacher.addImage(newValue, this.imgUrl);
            } catch (error) {
              console.error('Failed to fetch and process image:', error);
              // 使用原始 URL 作为后备方案
              this.imgUrl = newValue;
            }
          }
        },
        immdiate: false,
      }
    },
    async mounted() {
      if (this.ifNeedDeal) {
        /**
         * try get from the cache first  
         */
        if (globalImageCacher.getImage(this.imgUrl)) {
          this.imgUrl = globalImageCacher.getImage(this.imgUrl);
          this.loadState = true;
          return;
        }
        try {
          let tmp = await fetchImgAndDeal(this.imgUrl);
          globalImageCacher.addImage(this.imgUrl, tmp);
          this.imgUrl = tmp;
        } catch (error) {
          console.error('Failed to fetch and process image:', error);
          // 使用原始 URL 作为后备方案
          this.imgUrl = this.src;
        }
      }
      this.loadState = true;
    }
  }
  </script>
  
<style scoped>
.img-card-container {
  position: relative;
  margin: 1px;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(110deg, #e8e8e8 25%, #f2f2f2 37%, #e8e8e8 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.2s ease infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>