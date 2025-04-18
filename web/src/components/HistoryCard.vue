<template>
    <v-card class="card" elevation="1">
        <div class="row-reverse-div">
            <v-btn size="20" style="margin-bottom: 10px;" color="#8a8a8a" variant="text"
                icon="mdi-close" @click="close"></v-btn>
        </div>
        <div class="column-div-scroll">
            <div class="item-container">
                <history-item v-for="(item, index) in historyList" class="item" @close="close" :init-data="item" :key="index"></history-item>
            </div>
        </div>
    </v-card>
</template>
<script>
import { globalProperties } from '@/main';
import { getCancelLoadMsg, getLoadMsg} from '@/utils/other';
import { computed, ref } from 'vue';
import { getHistory } from '@/utils/history';
import HistoryItem from './HistoryItem.vue';
export default {
    props: {
    },
    components: {
        HistoryItem,
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const ifShowFolderEditor = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowFolderEditor.value;
        })
        const setFolderEditorState = (state) => {
            ifShowFolderEditor.value = state;
        }
        return {
            themeColor,
            ifShowDialog,
            ifShowFolderEditor,
            setFolderEditorState
        }
    },
    data() {
        return {
            historyList:[],
        }
    },
    methods: {
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        closeDialog() {
            this.setFolderEditorState(false);
        },
        close() {
            this.$emit('close');
        }
    },
    async mounted() {
        this.setLoading(getLoadMsg('正在加载历史记录...'));
        this.historyList=await getHistory();
        this.setLoading(getCancelLoadMsg());
    }
}
</script>
<style scoped>
.row-reverse-div {
    margin-top: 5px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    margin-bottom: 5px;
}
.item{
    width: 100%;
}
.item-container{
    display: flex;
    flex-direction: column;
    padding: 5px;
    width: 100%;
}
@media screen and (min-width: 1000px) {
    .card {
        width: 750px;
        max-height: 800px;
        padding: 10px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 650px;
        overflow: auto;
    }
}

@media screen and (max-width: 1000px) {
    .card {
        width: 100vw;
        max-height: 90vh;
        padding: 10px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 40vh;
        overflow: auto;
    }
}
</style>