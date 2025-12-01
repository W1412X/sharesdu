<!--alert button-->
<template>
    <v-dialog v-model="ifShowDialog" max-width="320" persistent style="width: 100%;height:100%;justify-content: center;">
        <div v-if="ifShowDeleteCard" style="width: 100%;height:100%;justify-content: center;display: flex">
            <component :is="AsyncDeleteConfirmCard" :type="type" :id="id" @close="close()" @delete="handleDelete()" @alert="alert($event)"></component>
        </div>
    </v-dialog>
    <v-btn elevation="0" @click="click" icon :style="{
        'width': size+'px',
        'height': size+'px',
        'color': color,
        'background-color': 'rgba(0,0,0,0)',
    }">
        <v-icon :size="size" icon="mdi-delete-outline"></v-icon>
        <v-tooltip activator="parent">删除此项</v-tooltip>
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
    setup() {
        const ifShowDeleteCard = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowDeleteCard.value;
        })
        const setDeleteCardState = (state) => {
            ifShowDeleteCard.value = state;
        }
        const AsyncDeleteConfirmCard = defineAsyncComponent(() => import('@/components/common/DeleteConfirmCard.vue'))
        return {
            ifShowDialog,
            ifShowDeleteCard,
            setDeleteCardState,
            AsyncDeleteConfirmCard,
        }
    },
    methods: {
        setLoading(msg) {
            this.$emit('set_loading', msg)
        },
        alert(msg) {
            this.$emit('alert', msg)
        },
        click() {
            this.setDeleteCardState(true);
        },
        close() {
            this.setDeleteCardState(false);
        },
        handleDelete() {
            this.$emit('delete');
        },
    }
}
</script>