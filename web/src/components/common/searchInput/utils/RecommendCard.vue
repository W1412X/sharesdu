<template>
    <section class="total-container" :style="inputStyle" aria-label="全站热搜">
        <div class="section-heading">
            <v-icon icon="mdi-fire" size="18" color="#ff3848" aria-hidden="true"></v-icon>
            <span>全站热搜</span>
        </div>
        <div v-if="items.length" class="item-container">
            <button
                v-for="(item, index) in items"
                :key="index"
                type="button"
                class="recommend-btn"
                :title="item.text"
                @click="upReccommend(item.text)"
            >
                <span class="rank" :style="{ color: getFireColor(item.hotScore) }">{{ item.rock }}</span>
                <span class="recommend-text">{{ item.text }}</span>
                <span class="hot-score">{{ item.hotScore }}</span>
            </button>
        </div>
        <p v-else class="empty-state">暂无热榜数据</p>
    </section>
</template>
<script setup>
import { ref } from 'vue';
import { createEventBus, getEventBus } from '@/utils/eventBus';
import { getFireColor } from '../js/utils';

const props = defineProps({
    inputStyle: {
        type: Object,
        default: () => ({}),
    },
});
const emit = defineEmits(['fill-search-input']);
const items = ref([]);

function upReccommend(item) {
    if (props.inputStyle.width === '100vw') {
        const eventBus = getEventBus('global-search-input') || createEventBus('global-search-input');
        eventBus.emit('fill-search-input', item);
    } else {
        emit('fill-search-input', item);
    }
}
</script>
<style scoped>
.total-container {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    padding: 16px;
    color: #18191c;
}

.section-heading {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
}

.item-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.recommend-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
    padding: 6px;
    border: 0;
    border-radius: 6px;
    color: inherit;
    background-color: transparent;
    font: inherit;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
}

.recommend-btn:hover,
.recommend-btn:focus-visible {
    background-color: #f1f2f3;
}

.recommend-btn:focus-visible {
    outline: 2px solid #61666d;
    outline-offset: -2px;
}

.rank {
    flex-shrink: 0;
    min-width: 16px;
    font-weight: 600;
}

.recommend-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.hot-score {
    flex-shrink: 0;
    color: #9499a0;
    font-size: 12px;
}

.empty-state {
    margin: 0;
    padding: 4px 0;
    color: #9499a0;
    font-size: 13px;
}
</style>
