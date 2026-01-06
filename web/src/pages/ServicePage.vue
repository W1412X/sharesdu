<template>
    <div class="service-page">
        <div class="page-container">
            <!-- 页面标题 -->
            <div class="page-header">
                <p class="page-subtitle">便捷访问各类校园服务平台与学生开发的服务</p>
            </div>
            
            <!-- 服务卡片网格 -->
            <div class="services-grid">
                <ServiceCard
                    v-for="(service, index) in services"
                    :key="index"
                    :link="service.link"
                    :title="service.title"
                    :description="service.description"
                    :category="service.category"
                    :source="service.source"
                    :icon="service.icon"
                    :icon-size="iconSize"
                />
            </div>
            
            <!-- 空状态 -->
            <nothing-view 
                v-if="services.length === 0" 
                icon="mdi-puzzle-outline" 
                text="暂无服务" 
                :icon-size="80"
                text-size="18px"
                min-height="300px"
            />
        </div>
    </div>
</template>

<script>
import { inject } from 'vue';
import { globalProperties } from '@/main';
import { services } from '@/config';
import ServiceCard from '@/components/service/ServiceCard.vue';
import NothingView from '@/components/common/NothingView.vue';

export default {
    name: 'ServicePage',
    components: {
        ServiceCard,
        NothingView,
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        // 从 App.vue 注入的全局消息方法
        const message = inject('message', null);
        const setLoading = message ? message.setLoading : null;
        
        return {
            themeColor,
            setLoading,
        };
    },
    data() {
        return {
            services: services || [],
            iconSize: 32,
        };
    },
    async mounted() {
        // 显示加载状态
        if (this.setLoading) {
            this.setLoading({
                state: true,
                text: '加载中...',
                progress: -1
            });
        }
        
        // 模拟加载过程（如果 services 是异步加载的，可以在这里等待）
        // 这里使用 setTimeout 模拟异步加载，确保加载状态可见
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 隐藏加载状态
        if (this.setLoading) {
            this.setLoading({
                state: false,
                text: '加载中...',
                progress: -1
            });
        }
    },
};
</script>

<style scoped>
.service-page {
    width: 100%;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20px 0;
}

.page-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
}

.page-header {
    text-align: center;
    margin-bottom: 20px;
    padding: 10px 0;
}

.page-title {
    font-size: var(--font-size-title-big);
    font-weight: bold;
    color: #000;
    margin: 0 0 8px 0;
}

.page-subtitle {
    font-size: var(--font-size-medium);
    color: #666;
    margin: 0;
}

.services-grid {
    display: grid;
    gap: 24px;
    width: 100%;
}

/* PC 端样式 */
@media screen and (min-width: 1000px) {
    .service-page {
        padding: 40px 0;
    }
    
    .page-container {
        padding: 0 40px;
    }
    
    .page-header {
        margin-bottom: 50px;
        padding: 30px 0;
    }
    
    .page-title {
        font-size: 32px;
    }
    
    .services-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 24px;
        max-width: 1200px;
        margin: 0 auto;
    }
}

/* 移动端样式 */
@media screen and (max-width: 1000px) {
    .service-page {
        padding: 16px 0;
    }
    
    .page-container {
        padding: 0 16px;
    }
    
    .page-header {
        margin-bottom: 24px;
        padding: 16px 0;
    }
    
    .page-title {
        font-size: var(--font-size-page-title);
    }
    
    .page-subtitle {
        font-size: var(--font-size-small);
    }
    
    .services-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;
    }
}

/* 超小屏幕适配 */
@media screen and (max-width: 480px) {
    .services-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
    
    .page-container {
        padding: 0 12px;
    }
}
</style>