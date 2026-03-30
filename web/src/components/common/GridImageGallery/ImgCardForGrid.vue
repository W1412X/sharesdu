<template>
  <div class="img-card-container">
    <v-img :src="imgUrl" :lazy-src="lazyImgUrl" cover style="object-fit: cover; width: 100%; height: 100%;">
      <template v-slot:placeholder>
        <branded-image-placeholder
          tone="light"
          variant="compact"
          :theme-color="themeColor"
        />
      </template>
    </v-img>
  </div>
</template>
  
  <script>
  import { globalProperties } from '@/main';
  import { globalImageCacher } from '@/utils/global_img_cache';
  import { fetchImgAndDeal } from '@/utils/imageUtils';
  import BrandedImagePlaceholder from '@/components/common/BrandedImagePlaceholder.vue';

  export default {
    name: 'ImgCardForGrid',
    components: {
      BrandedImagePlaceholder,
    },
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
      const themeColor = globalProperties.$themeColor;
      return { lazyImgUrl, themeColor };
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

</style>