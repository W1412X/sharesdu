<template>
    <v-dialog v-model="ifShowDialog"
        style="display: flex;flex-direction: row;align-items: center;justify-content: center;width: 100%;height: 100%;">
        <div v-if="ifShowPicker" style="width: 100%;height:100%;justify-content: center;display: flex">
            <v-card v-if="ifLoad" class="card">
                <div class="top-bar">
                    <v-spacer></v-spacer>
                    <v-icon icon="mdi-close" color="grey" size="24" @click="closePicker"></v-icon>
                </div>
                <v-btn-toggle v-model="toggle" class="emoji-btn-toggle" color="#9c0c13" density="compact">
                    <v-btn v-for="(cata, index) in emojisClasses" :key="index" :color="themeColor" variant="text"
                        density="compact" :text="cata"></v-btn>
                </v-btn-toggle>
                <div class="chip-container" column>
                    <div style="height: fit-content;">
                        <v-chip class="emoji-chip" @click="emojiClick(emoji)"
                            v-for="emoji in this.emojis[emojisClasses[toggle]]" :key="emoji" :text="emoji"
                            :value="emoji"></v-chip>
                    </div>
                </div>
            </v-card>
        </div>
    </v-dialog>
    <v-icon @click="setPickerState(true)" color="grey" style="margin: 3px;" :size="24" icon="mdi-emoticon-outline">
    </v-icon>
</template>
<script>
/**
 * emoji save in localstorage
 */
import { globalProperties } from '@/main';
import { computed, ref } from 'vue';
export default {
    setup() {
        const toggle = ref(0);
        const themeColor = globalProperties.$themeColor;
        const ifShowPicker = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowPicker.value;
        })
        const setPickerState = (state) => {
            ifShowPicker.value = state;
        }
        return {
            toggle,
            themeColor,
            ifShowPicker,
            setPickerState,
            ifShowDialog,
        }
    },
    data() {
        return {
            ifLoad: false,
            emojis: null,
            emojisClasses: [],
        }
    },
    methods: {
        async fetchEmojis() {
            try {
                //ensure the localstorage canbe use
                if (!localStorage&&localStorage.getItem('emojis')) {
                    console.log(localStorage.getItem('emojis'));
                    return JSON.parse(localStorage.getItem('emojis'));
                }
                const url = `/resource/emojis.json`;
                const response = await fetch(url);
                console.log('response',response);
                if (response.ok) {
                    const emojisData = await response.json();
                    console.log(emojisData);
                    try{
                        localStorage.setItem('emojis', JSON.stringify(emojisData));
                    }catch(e){
                        console.error(e);
                    }
                    return emojisData;
                } else {
                    return {};
                }
            } catch (error) {
                console.error('Error fetching emojis:', error);
                return {}
            }
        },
        emojiClick(emoji) {
            this.$emit('emoji', emoji);
            this.closePicker();
            console.log(emoji);
        },
        closePicker() {
            this.setPickerState(false);
        }
    },
    async mounted() {
        this.emojis = await this.fetchEmojis();
        this.emojisClasses = Object.keys(this.emojis);
        this.ifLoad = true;
    }
}
</script>
<style scoped>
.card {
    max-width: 400px;
    height: 300px;
    padding: 5px;
}

.top-bar {
    width: 100%;
    display: flex;
    flex-direction: row;
}

.emoji-btn-toggle {
    overflow: auto;
    width: fit-content;
}

.emoji-chip {
    margin: 5px;
    min-height: fit-content;
    max-height: fit-content;
    white-space: pre-line;
    overflow: auto;
    border-radius: 5px;
}

.chip-container {
    display: flex;
    height: 80%;
    overflow-y: scroll;
    padding: 5px;
}
</style>