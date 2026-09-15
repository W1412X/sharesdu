<template>
    <section class="total-container" :style="inputStyle" aria-label="历史搜索">
        <div class="section-heading">
            <v-icon icon="mdi-clock-outline" size="18" aria-hidden="true"></v-icon>
            <span>历史搜索</span>
        </div>
        <div v-if="items.length" class="item-container">
            <div v-for="(item, index) in items" :key="index" class="history-chip">
                <button type="button" class="history-btn" :title="item" @click="upHistory(item)">
                    {{ item }}
                </button>
                <button
                    type="button"
                    class="delete-history-btn"
                    :aria-label="`删除历史搜索：${item}`"
                    @click.stop="deleteHistory(item)"
                >
                    <span aria-hidden="true">×</span>
                </button>
            </div>
        </div>
        <p v-else class="empty-state">暂无历史记录</p>
    </section>
</template>
<script setup>
import { ref } from 'vue';
import { deleteSearchHistory, getSearchHistory } from '../js/utils';
import { createEventBus, getEventBus } from '@/utils/eventBus';

const props = defineProps({
    inputStyle: {
        type: Object,
        default: () => ({}),
    },
});
const emit = defineEmits(['fill-search-input']);
const items = ref(getSearchHistory());

function deleteHistory(item) {
    items.value = items.value.filter((history) => history !== item);
    deleteSearchHistory(item);
}

function upHistory(item) {
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
    margin-bottom: 14px;
    font-size: 14px;
    font-weight: 600;
}

.item-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 8px;
}

.history-chip {
    position: relative;
    min-width: 0;
    max-width: 100%;
}

.history-btn {
    display: block;
    max-width: 100%;
    padding: 6px 10px;
    border: 0;
    border-radius: 6px;
    background-color: #f1f2f3;
    color: #61666d;
    font: inherit;
    font-size: 12px;
    line-height: 18px;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}

.history-btn:hover,
.history-btn:focus-visible {
    background-color: #e3e5e7;
    color: #18191c;
}

.delete-history-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 1px solid #fff;
    border-radius: 50%;
    background-color: #9499a0;
    color: #fff;
    font-size: 14px;
    line-height: 1;
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
}

.history-chip:hover .delete-history-btn,
.history-chip:focus-within .delete-history-btn {
    opacity: 1;
    pointer-events: auto;
}

.history-btn:focus-visible,
.delete-history-btn:focus-visible {
    outline: 2px solid #61666d;
    outline-offset: 2px;
}

.empty-state {
    margin: 0;
    padding: 4px 0;
    color: #9499a0;
    font-size: 13px;
}

@media (hover: none), (pointer: coarse) {
    .delete-history-btn {
        opacity: 1;
        pointer-events: auto;
        top: 3px;
        right: 3px;
        width: 24px;
        height: 24px;
    }

    .history-btn {
        padding-right: 32px;
    }
}
</style>
