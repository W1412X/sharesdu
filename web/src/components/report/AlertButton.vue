<!--alert button-->
<template>
    <v-dialog v-model="ifShowDialog" style="width: 100%;height:100%;justify-content: center;">
        <div v-if="ifShowReportCard" style="width: 100%;height:100%;justify-content: center;display: flex">
            <component :is="AsyncReportCard" :report="{ type: type, id: id }" @close="close()"></component>
        </div>
    </v-dialog>
    <v-btn elevation="0" @click="click" icon :style="{
        'width': size+'px',
        'height': size+'px',
        'color': color,
        'background-color': 'rgba(0,0,0,0)',
    }">
        <v-icon :size="size" icon="mdi-alert-circle-outline"></v-icon>
        <v-tooltip activator="parent">举报此项</v-tooltip>
    </v-btn>
</template>
<script>
import { computed, defineAsyncComponent, ref } from 'vue';
export default {
    props: {
        id: {
            type: String,
            default: '00000000',
        },
        type: {
            type: String,
            default: 'article',
        },
        size: {
            type: String,
            default: '25',
        },
        color: {
            type: String,
            default: '#8a8a8a',
        }
    },
    components: {
    },
    setup() {
        const ifShowReportCard = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowReportCard.value;
        })
        const setRepordCardState = (state) => {
            ifShowReportCard.value = state;
        }
        const AsyncReportCard = defineAsyncComponent(() => import('@/components/report/ReportCard.vue'))
        return {
            ifShowDialog,
            ifShowReportCard,
            setRepordCardState,
            AsyncReportCard,
        }
    },
    methods: {
        click() {
            this.setRepordCardState(true);
        },
        close() {
            this.setRepordCardState(false);
        }
    }
}
</script>