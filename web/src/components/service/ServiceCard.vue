<template>
    <v-card 
        class="service-card" 
        :elevation="2" 
        variant="variant"
        @click="handleClick"
        :class="{ 'service-card--clickable': link }">
        <div class="card-content">
            <!-- 顶部：图标 + 标题 -->
            <div class="header-section">
                <div class="icon-wrapper" :style="{ backgroundColor: computedIconBgColor }">
                    <v-icon 
                        v-if="icon" 
                        :icon="icon" 
                        :size="iconSize"
                        :color="iconColor || themeColor">
                    </v-icon>
                    <v-icon 
                        v-else
                        icon="mdi-puzzle-outline" 
                        :size="iconSize"
                        :color="iconColor || themeColor">
                    </v-icon>
                </div>
                <div class="title-wrapper">
                    <div class="title-text text-title-bold" :title="title">
                        {{ title || '服务标题' }}
                    </div>
                </div>
            </div>
            
            <!-- 中间：描述信息 -->
            <div v-if="description" class="description-section">
                <div class="description-text text-small" :title="description">
                    {{ description }}
                </div>
            </div>
            
            <!-- 底部：分类和来源 -->
            <div class="footer-section">
                <v-chip 
                    v-if="category" 
                    size="small" 
                    variant="tonal" 
                    :color="themeColor"
                    class="category-chip">
                    {{ category }}
                </v-chip>
                <span v-if="source" class="source-text text-tiny">
                    {{ source }}
                </span>
            </div>
        </div>
    </v-card>
</template>

<script>
import { globalProperties } from '@/main';
import { openPage } from '@/utils/other';
import { hexToRgba } from '@/utils/color';

export default {
    name: 'ServiceCard',
    props: {
        // 跳转链接
        link: {
            type: String,
            default: null
        },
        // 标题
        title: {
            type: String,
            default: '服务标题'
        },
        // 描述
        description: {
            type: String,
            default: null
        },
        // 分类
        category: {
            type: String,
            default: null
        },
        // 来源
        source: {
            type: String,
            default: null
        },
        // 图标（Material Design Icons 名称）
        icon: {
            type: String,
            default: null
        },
        // 图标颜色
        iconColor: {
            type: String,
            default: null
        },
        // 图标背景颜色
        iconBgColor: {
            type: String,
            default: null
        },
        // 图标大小
        iconSize: {
            type: [Number, String],
            default: 32
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        return {
            themeColor
        };
    },
    computed: {
        // 计算图标背景颜色，如果没有传入则使用主题色的浅色版本
        computedIconBgColor() {
            if (this.iconBgColor) {
                return this.iconBgColor;
            }
            // 使用主题色的浅色版本（带透明度）
            return hexToRgba(this.themeColor, 0.1);
        }
    },
    methods: {
        handleClick() {
            if (this.link) {
                openPage('url', { url: this.link });
            }
            this.$emit('click', {
                link: this.link,
                title: this.title,
                category: this.category,
                source: this.source
            });
        }
    }
};
</script>

<style scoped>
.service-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: default;
    background-color: #fff;
}

.service-card--clickable {
    cursor: pointer;
}

.service-card--clickable:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
    display: flex;
    flex-direction: column;
    padding: 16px;
    box-sizing: border-box;
    height: 100%;
}

/* 顶部：图标 + 标题 */
.header-section {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    flex-shrink: 0;
}

.icon-wrapper {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}

.service-card--clickable:hover .icon-wrapper {
    transform: scale(1.05);
}

.title-wrapper {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: center;
}

.title-text {
    color: #000;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    word-wrap: break-word;
}

/* 中间：描述信息 */
.description-section {
    flex: 1;
    margin-bottom: 12px;
    min-height: 0;
    overflow: hidden;
}

.description-text {
    color: #666;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    word-wrap: break-word;
}

/* 底部：分类和来源 */
.footer-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-shrink: 0;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
    margin-top: auto;
}

.category-chip {
    font-size: var(--font-size-tiny);
    height: 22px;
    padding: 0 8px;
    flex-shrink: 0;
}

.source-text {
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    text-align: right;
}

/* PC 端样式 */
@media screen and (min-width: 1000px) {
    .service-card {
        min-width: 240px;
    }
    
    .card-content {
        padding: 18px;
    }
    
    .icon-wrapper {
        width: 52px;
        height: 52px;
        min-width: 52px;
    }
    
    .header-section {
        gap: 14px;
        margin-bottom: 14px;
    }
    
    .description-section {
        margin-bottom: 14px;
    }
    
    .description-text {
        -webkit-line-clamp: 3;
        line-clamp: 3;
    }
}

/* 移动端样式 */
@media screen and (max-width: 1000px) {
    .service-card {
        min-width: 140px;
    }
    
    .card-content {
        padding: 14px;
    }
    
    .icon-wrapper {
        width: 44px;
        height: 44px;
        min-width: 44px;
    }
    
    .header-section {
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .title-text {
        font-size: var(--font-size-title);
        -webkit-line-clamp: 2;
        line-clamp: 2;
    }
    
    .description-section {
        margin-bottom: 10px;
    }
    
    .description-text {
        font-size: var(--font-size-small);
        -webkit-line-clamp: 2;
        line-clamp: 2;
    }
    
    .footer-section {
        padding-top: 6px;
    }
}
</style>