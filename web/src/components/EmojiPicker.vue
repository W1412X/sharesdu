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
                        <div v-if="emojisClasses[toggle]=='自定义'||emojisClasses[toggle]=='常用'" class="text-tiny" style="color: grey;">注：您的常用表情和自定义表情仅保存在本地</div>
                        <v-chip class="emoji-chip" @click="emojiClick(emoji)"
                            v-for="emoji in this.emojis[emojisClasses[toggle]]" :key="emoji" :text="emoji"
                            :value="emoji"></v-chip>
                        <div v-if="emojisClasses[toggle]=='自定义'" class="emoji-edit-container">
                            <sensitive-text-field v-if="ifShowEmojiEditor" label="编辑自定义表情" density="compact" v-model="editingEmoji" variant="outlined"></sensitive-text-field>
                            <v-btn @click="addEmoji" class="add-emoji-btn" :color="themeColor" :text="ifShowEmojiEditor?'添加':'添加自定义表情'" variant="text"></v-btn>
                        </div>
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
import { addSelfEmoji, addUsedEmoji, fetchEmojis } from '@/utils/emoji';
import { computed, ref } from 'vue';
import SensitiveTextField from './SensitiveTextField.vue';
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
    components:{
        SensitiveTextField,
    },
    data() {
        return {
            ifLoad: false,
            emojis: null,
            emojisClasses: [],
            editingEmoji:"",
            ifShowEmojiEditor:false,
        }
    },
    methods: {
        addEmoji() {
            if(!this.ifShowEmojiEditor){
                this.ifShowEmojiEditor=true;
                return;
            }
            if(this.editingEmoji!=""){
                addSelfEmoji(this.editingEmoji);
                this.emojis["自定义"].unshift(this.editingEmoji);
                this.ifShowEmojiEditor=false;
            }
        },
        emojiClick(emoji) {
            this.$emit('emoji', emoji);
            addUsedEmoji(emoji);
            this.closePicker();
        },
        closePicker() {
            this.setPickerState(false);
        }
    },
    async mounted() {
        this.emojis = await fetchEmojis();
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
.add-emoji-btn{
    margin: 3px;
    margin-bottom: 20px;
}
.emoji-btn-toggle {
    overflow: auto;
    width: fit-content;
}
.emoji-edit-container{
    min-width:300px; 
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 20px;
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