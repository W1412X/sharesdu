<!-- 九宫格图片展示组件 -->
<template>
    <div v-if="imageList && imageList.length > 0" class="grid-image-gallery" :class="galleryClass">
        <div 
            v-for="(img, index) in displayImages" 
            :key="index"
            class="grid-image-item"
            :class="getItemClass(imageList.length, index)"
            @click="handleImageClick(index)"
        >
            <v-img
                :src="img"
                :lazy-src="lazyImgUrl"
                cover
                class="grid-image"
                :alt="`图片 ${index + 1}`"
            >
                <template v-slot:placeholder>
                    <div class="image-placeholder">
                        <v-progress-circular 
                            :color="themeColor" 
                            indeterminate
                            size="24"
                        ></v-progress-circular>
                    </div>
                </template>
            </v-img>
            <!-- 超过9张时显示更多提示 -->
            <div v-if="index === 8 && imageList.length > 9" class="more-images-overlay">
                <span class="more-images-text">+{{ imageList.length - 9 }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { globalProperties } from '@/main';

export default {
    name: 'GridImageGallery',
    props: {
        imageList: {
            type: Array,
            default: () => []
        },
        maxDisplay: {
            type: Number,
            default: 9 // 最多显示9张
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const lazyImgUrl = globalProperties.$lazyImgUrl;
        return {
            themeColor,
            lazyImgUrl,
        }
    },
    computed: {
        displayImages() {
            return this.imageList.slice(0, this.maxDisplay);
        },
        galleryClass() {
            const count = this.imageList.length;
            if (count === 1) return 'gallery-single';
            if (count === 2) return 'gallery-double';
            if (count === 3) return 'gallery-triple';
            if (count === 4) return 'gallery-quad';
            return 'gallery-grid'; // 5张及以上
        }
    },
    methods: {
        handleImageClick(index) {
            this.$emit('image-click', {
                index,
                imageList: this.imageList
            });
        },
        getItemClass(total, index) {
            // 根据总数和索引返回不同的类名
            if (total === 1) return 'item-single';
            if (total === 2) return 'item-double';
            if (total === 3) return 'item-triple';
            if (total === 4) return 'item-quad';
            // 5张及以上使用九宫格布局
            return `item-grid item-${index + 1}`;
        }
    }
}
</script>

<style scoped>
.grid-image-gallery {
    display: grid;
    gap: 4px;
    width: 100%;
    margin-top: 8px;
}

/* 单张图片 */
.gallery-single {
    grid-template-columns: 1fr;
}

.gallery-single .grid-image-item {
    max-width: 100%;
    aspect-ratio: 1;
}

/* 两张图片 */
.gallery-double {
    grid-template-columns: 1fr 1fr;
}

.gallery-double .grid-image-item {
    aspect-ratio: 1;
}

/* 三张图片 */
.gallery-triple {
    grid-template-columns: repeat(3, 1fr);
}

.gallery-triple .grid-image-item {
    aspect-ratio: 1;
}

/* 四张图片 */
.gallery-quad {
    grid-template-columns: repeat(2, 1fr);
}

.gallery-quad .grid-image-item {
    aspect-ratio: 1;
}

/* 五张及以上 - 九宫格 */
.gallery-grid {
    grid-template-columns: repeat(3, 1fr);
}

.gallery-grid .grid-image-item {
    aspect-ratio: 1;
}

.grid-image-item {
    position: relative;
    overflow: hidden;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
    background-color: #f5f5f5;
}

.grid-image-item:hover {
    transform: scale(0.98);
    opacity: 0.9;
}

.grid-image-item:active {
    transform: scale(0.96);
}

.grid-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
}

.more-images-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
}

.more-images-text {
    color: white;
    font-size: 18px;
    font-weight: 600;
}

/* PC 端优化 */
@media screen and (min-width: 1000px) {
    .grid-image-gallery {
        gap: 6px;
        max-width: 600px;
    }
    
    .more-images-text {
        font-size: 20px;
    }
}

/* 移动端优化 */
@media screen and (max-width: 1000px) {
    .grid-image-gallery {
        gap: 3px;
    }
    
    .grid-image-item {
        border-radius: 4px;
    }
    
    .more-images-text {
        font-size: 16px;
    }
}
</style>

