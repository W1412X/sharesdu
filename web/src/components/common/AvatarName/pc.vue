<!-- PC 端头像名称组件 -->
<template>
    <div class="avatar-name" @click="toAuthorPage">
        <div class="avatar-container" :style="{ width: size + 'px', height: size + 'px' }">
            <!-- 默认图标 - 使用 v-show 避免 DOM 重建 -->
            <v-icon 
                v-show="showDefaultIcon" 
                icon="mdi-account-circle" 
                :size="size" 
                color='#bbbbbb'
                class="avatar-icon"
            ></v-icon>
            <!-- 头像图片 - 使用 v-show 避免 DOM 重建 -->
            <v-avatar 
                v-show="showAvatar" 
                :size="size"
                class="avatar-img"
            >
                <v-img 
                    :src="this.profileUrl" 
                    :lazy-src="lazyImgUrl"
                    :alt="initData.name || '用户头像'"
                    cover
                    @load="onImageLoad"
                    @error="onImageError"
                >
                    <template v-slot:placeholder>
                        <div class="avatar-placeholder">
                            <v-progress-circular 
                                :size="parseInt(size) * 0.6" 
                                :width="2"
                                :color="'#bbbbbb'" 
                                indeterminate
                            ></v-progress-circular>
                        </div>
                    </template>
                </v-img>
            </v-avatar>
        </div>
        <div v-if="ifShowName" class="name-text" :style="{ color: color, 'font-size': nameSize + 'px' }">
            {{ initData.name }}
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main'
import { getCookie } from '@/utils/cookie'
import { globalProfileCacher } from '@/utils/global_img_cache'
import { acquireLock, releaseLock } from '@/utils/lock'
import { openPage } from '@/utils/other'
import { getProfileUrl } from '@/utils/profile'
import { ref } from 'vue'

export default {
    name: 'AvatarNamePc',
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    id: null,
                    name: null,
                }
            }
        },
        size: {
            type: String,
            default: '30'
        },
        color: {
            type: String,
            default: '#000'
        },
        clickable: {
            type: Boolean,
            default: true
        },
        ifShowName: {
            type: Boolean,
            default: true
        },
        nameSize: {
            type: String,
            default: '16'
        },
        lazy: {
            type: Boolean,
            default: true
        }
    },
    setup() {
        const lazyImgUrl = globalProperties.$imgDict?.svg?.lazy || globalProperties.$imgLazy || '/resource/default_img.svg';
        const imageLoading = ref(false);
        return {
            lazyImgUrl,
            imageLoading,
        }
    },
    computed: {
        // 是否显示默认图标
        showDefaultIcon() {
            return this.profileUrl == null || this.imageLoading || this.imageError;
        },
        // 是否显示头像
        showAvatar() {
            return this.profileUrl != null && !this.imageError;
        },
    },
    data() {
        return {
            profileUrl: null,
            time: 1000,
            imageError: false,
        }
    },
    methods: {
        toAuthorPage() {
            if (!this.clickable) {
                return;
            }
            if (getCookie("userId") == this.initData.id) {
                openPage("router",{
                    name: 'SelfPage',
                    params: {
                        id: this.initData.id
                    }
                });
            } else {
                openPage("router",{
                    name: 'AuthorPage',
                    params: {
                        id: this.initData.id
                    }
                })
            }
        },
        async getProfile() {
            /**
             * check global cache first  
             */
            const cacheKey = globalProperties.$apiUrl + '/image/user?user_id=' + this.initData.id;
            try {
                const url = await globalProfileCacher.remember(cacheKey, async () => {
                    const profileUrl = await getProfileUrl(this.initData.id);
                    return profileUrl;
                });
                // 使用 nextTick 确保状态更新平滑
                await this.$nextTick();
                this.profileUrl = this.optimizeImageUrl(url);
                // 重置错误状态
                this.imageError = false;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('AvatarName: 获取头像失败', error);
                await this.$nextTick();
                this.profileUrl = null;
                this.imageError = true;
            }
        },
        /**
         * 优化图片 URL，支持 WebP 格式
         * 如果浏览器支持 WebP，尝试使用 WebP 格式
         */
        optimizeImageUrl(url) {
            if (!url || this.imageError) {
                return url;
            }
            // 如果 URL 已经是 blob URL 或 data URL，直接返回
            if (url.startsWith('blob:') || url.startsWith('data:')) {
                return url;
            }
            // 检查浏览器是否支持 WebP
            // 注意：这里假设后端支持通过查询参数或路径来请求 WebP 格式
            // 实际实现需要根据后端 API 调整
            // 例如：如果后端支持 ?format=webp，可以添加该参数
            // 由于当前实现使用 blob URL，暂时保持原样
            // 如果后端支持，可以在这里添加格式转换逻辑
            return url;
        },
        onImageLoad() {
            // 延迟更新状态，确保图片完全加载后再切换
            this.$nextTick(() => {
                this.imageLoading = false;
                this.imageError = false;
            });
        },
        onImageError() {
            // 延迟更新状态，避免闪烁
            this.$nextTick(() => {
                this.imageLoading = false;
                this.imageError = true;
                // 图片加载失败时，保持显示占位符
                this.profileUrl = null;
            });
        },
        async loadProfile() {
            const lockKey = 'profile-' + this.initData.id;
            await acquireLock(lockKey);
            try {
                this.imageLoading = true;
                await this.getProfile();
            } finally {
                releaseLock(lockKey);
            }
        },
        setupLazyLoad() {
            // 使用 Intersection Observer 实现懒加载
            if (typeof IntersectionObserver !== 'undefined') {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !this.profileUrl && !this.imageLoading) {
                            this.loadProfile();
                            observer.disconnect();
                        }
                    });
                }, {
                    rootMargin: '50px' // 提前 50px 开始加载
                });
                
                // 等待 DOM 更新后观察
                this.$nextTick(() => {
                    const element = this.$el;
                    if (element) {
                        observer.observe(element);
                    }
                });
            } else {
                // 不支持 Intersection Observer 时，延迟加载
                setTimeout(() => {
                    this.loadProfile();
                }, 100);
            }
        },
    },
    async mounted() {
        if (!this.lazy) {
            // 非懒加载模式，立即加载
            await this.loadProfile();
        } else {
            // 懒加载模式：使用 Intersection Observer 或延迟加载
            // 如果组件在视口中，则加载图片
            this.setupLazyLoad();
        }
    }
}
</script>
<style scoped>
.avatar-name {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.avatar-container {
    position: relative;
    flex-shrink: 0;
}

.avatar-icon,
.avatar-img {
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 0.2s ease-in-out;
}

.avatar-icon {
    opacity: 1;
}

.avatar-img {
    opacity: 1;
}

.name-text {
    font-size: var(--font-size-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}

.avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
}
</style>

