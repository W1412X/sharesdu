<!-- 图片查看器组件 - 支持轮播 -->
<template>
    <v-dialog 
        v-model="ifShow"
        class="image-viewer-dialog"
        fullscreen
        transition="fade-transition"
        scrim="rgba(0, 0, 0, 0.9)"
        @click:outside="close"
        @keydown.esc="close"
        @keydown.left="previousImage"
        @keydown.right="nextImage"
    >
        <div class="image-viewer-container" @click.stop>
            <!-- 顶部计数器 -->
            <div class="viewer-header">
                <div class="image-counter" v-if="imageList.length > 1">
                    <span class="counter-text">{{ currentIndex + 1 }} / {{ imageList.length }}</span>
                </div>
            </div>

            <!-- 图片显示区域 -->
            <div class="image-content-wrapper">
                <!-- 上一张按钮 -->
                <v-btn
                    v-if="imageList.length > 1"
                    icon
                    @click="previousImage"
                    class="nav-btn nav-btn-left"
                    size="large"
                >
                    <v-icon :color="themeColor" size="32" icon="mdi-chevron-left"></v-icon>
                    <v-tooltip activator="parent">上一张 (←)</v-tooltip>
                </v-btn>

                <!-- 图片容器 -->
                <div class="image-wrapper" @click="close">
                    <transition name="image-slide" mode="out-in">
                        <div :key="currentIndex" class="image-container">
                            <v-img 
                                v-if="currentImage"
                                :src="currentImage"
                                contain
                                class="viewer-image"
                                :max-width="'100%'"
                                :max-height="'100%'"
                                @load="onImageLoad"
                                @error="onImageError"
                            >
                                <template v-slot:placeholder>
                                    <div class="image-loading">
                                        <v-progress-circular 
                                            :color="themeColor" 
                                            indeterminate
                                            size="64"
                                            width="6"
                                        ></v-progress-circular>
                                        <p class="loading-text">加载中...</p>
                                    </div>
                                </template>
                            </v-img>
                        </div>
                    </transition>
                </div>

                <!-- 下一张按钮 -->
                <v-btn
                    v-if="imageList.length > 1"
                    icon
                    @click="nextImage"
                    class="nav-btn nav-btn-right"
                    size="large"
                >
                    <v-icon :color="themeColor" size="32" icon="mdi-chevron-right"></v-icon>
                    <v-tooltip activator="parent">下一张 (→)</v-tooltip>
                </v-btn>
            </div>

            <!-- 底部工具栏 -->
            <div class="viewer-footer" v-if="!imageLoading">
                <v-btn 
                    icon 
                    @click="close"
                    class="action-btn"
                    size="large"
                >
                    <v-icon :color="themeColor" size="24" icon="mdi-close"></v-icon>
                    <v-tooltip activator="parent">关闭 (ESC)</v-tooltip>
                </v-btn>
                <v-btn 
                    icon 
                    @click="saveImage"
                    class="action-btn"
                    size="large"
                >
                    <v-icon :color="themeColor" size="24" icon="mdi-tray-arrow-down"></v-icon>
                    <v-tooltip activator="parent">保存图片</v-tooltip>
                </v-btn>
            </div>

            <!-- 缩略图导航（多张图片时显示） -->
            <div v-if="imageList.length > 1 && !imageLoading" class="thumbnail-nav">
                <div 
                    v-for="(img, index) in imageList"
                    :key="index"
                    class="thumbnail-item"
                    :class="{ active: index === currentIndex }"
                    @click="goToImage(index)"
                >
                    <v-img
                        :src="img"
                        cover
                        class="thumbnail-image"
                    ></v-img>
                </div>
            </div>
        </div>
    </v-dialog>
</template>

<script>
import { globalProperties } from '@/main';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

export default {
    name: 'ImageViewer',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        imageList: {
            type: Array,
            default: () => []
        },
        initialIndex: {
            type: Number,
            default: 0
        }
    },
    emits: ['update:modelValue', 'close'],
    setup(props, { emit }) {
        const themeColor = globalProperties.$themeColor;
        const currentIndex = ref(props.initialIndex);
        const imageLoading = ref(false);
        const ifShow = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value)
        });

        const currentImage = computed(() => {
            if (props.imageList.length === 0) return null;
            return props.imageList[currentIndex.value];
        });

        const nextImage = () => {
            if (props.imageList.length === 0) return;
            currentIndex.value = (currentIndex.value + 1) % props.imageList.length;
        };

        const previousImage = () => {
            if (props.imageList.length === 0) return;
            currentIndex.value = currentIndex.value === 0 
                ? props.imageList.length - 1 
                : currentIndex.value - 1;
        };

        const goToImage = (index) => {
            if (index >= 0 && index < props.imageList.length) {
                currentIndex.value = index;
            }
        };

        const close = () => {
            emit('update:modelValue', false);
            emit('close');
        };

        const onImageLoad = () => {
            imageLoading.value = false;
        };

        const onImageError = () => {
            imageLoading.value = false;
            console.warn('图片加载失败:', currentImage.value);
        };

        const saveImage = async () => {
            if (!currentImage.value) return;
            
            try {
                const response = await fetch(currentImage.value);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `image-${currentIndex.value + 1}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('保存图片失败:', error);
            }
        };

        // 监听 initialIndex 变化
        watch(() => props.initialIndex, (newIndex) => {
            if (newIndex >= 0 && newIndex < props.imageList.length) {
                currentIndex.value = newIndex;
            }
        });

        // 监听 modelValue 变化，重置索引
        watch(() => props.modelValue, (newValue) => {
            if (newValue) {
                currentIndex.value = props.initialIndex;
                imageLoading.value = true;
            }
        });

        // 键盘事件处理
        const handleKeyDown = (e) => {
            if (!props.modelValue) return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                previousImage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextImage();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        };

        onMounted(() => {
            window.addEventListener('keydown', handleKeyDown);
        });

        onUnmounted(() => {
            window.removeEventListener('keydown', handleKeyDown);
        });

        return {
            themeColor,
            ifShow,
            currentIndex,
            currentImage,
            imageLoading,
            nextImage,
            previousImage,
            goToImage,
            close,
            onImageLoad,
            onImageError,
            saveImage,
        };
    }
}
</script>

<style scoped>
.image-viewer-dialog {
    z-index: 2000;
}

.image-viewer-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: rgba(0, 0, 0, 0.95);
    overflow: hidden; /* 防止整体溢出 */
}

.viewer-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    z-index: 10;
}

.image-counter {
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 6px 12px;
    border-radius: 20px;
}

.counter-text {
    color: white;
    font-size: 14px;
    font-weight: 500;
}

.image-content-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 60px 80px 100px;
    min-height: 0; /* 允许 flex 子元素收缩 */
    overflow: hidden;
    max-height: calc(100vh - 60px - 60px - 80px); /* 减去顶部、底部、缩略图高度 */
}

.image-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
    max-height: 100%;
    max-width: 100%;
    cursor: zoom-out;
    overflow: auto; /* 允许滚动查看超出的部分 */
    -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
}

.image-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    max-height: 100%;
}

.viewer-image {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
}

.image-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 300px;
    max-height: 100%;
}

.loading-text {
    color: white;
    margin-top: 16px;
    font-size: 14px;
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 10;
    transition: background-color 0.2s ease;
}

.nav-btn:hover {
    background-color: rgba(0, 0, 0, 0.5);
}

.nav-btn-left {
    left: 20px;
}

.nav-btn-right {
    right: 20px;
}

.viewer-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 0 20px;
    z-index: 10;
}

.action-btn {
    color: white;
    background-color: rgba(0, 0, 0, 0.3);
    transition: background-color 0.2s ease;
}

.action-btn:hover {
    background-color: rgba(0, 0, 0, 0.5);
}

.thumbnail-nav {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    max-width: 90%;
    overflow-x: auto;
    z-index: 10;
}

.thumbnail-item {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.thumbnail-item:hover {
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
}

.thumbnail-item.active {
    border-color: var(--theme-color, #1976d2);
    border-width: 3px;
}

.thumbnail-image {
    width: 100%;
    height: 100%;
}

/* 过渡动画 */
.image-slide-enter-active,
.image-slide-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.image-slide-enter-from {
    opacity: 0;
    transform: translateX(20px);
}

.image-slide-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

/* 移动端优化 */
@media screen and (max-width: 1000px) {
    .image-content-wrapper {
        padding: 50px 10px 80px;
        min-height: 0;
    }
    
    .image-wrapper {
        max-height: calc(100vh - 50px - 50px - 70px); /* 减去顶部、底部、缩略图高度 */
    }

    .nav-btn {
        width: 40px;
        height: 40px;
    }

    .nav-btn-left {
        left: 10px;
    }

    .nav-btn-right {
        right: 10px;
    }

    .viewer-header {
        height: 50px;
        padding: 0 12px;
    }

    .viewer-footer {
        height: 50px;
        padding: 0 12px;
        gap: 12px;
    }

    .thumbnail-nav {
        bottom: 70px;
        gap: 6px;
        padding: 6px;
    }

    .thumbnail-item {
        width: 50px;
        height: 50px;
    }

    .counter-text {
        font-size: 12px;
    }
}
</style>

