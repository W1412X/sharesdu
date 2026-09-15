<template>
  <div
    id="search-input"
    class="input-container"
    :class="{ 'suggestions-open': shouldShowSuggestions }"
    :style="containerStyle"
    @focusin="onFocus"
    @focusout="onBlur"
    @keydown.esc.stop.prevent="dismissSuggestions"
  >
    <input
      ref="input"
      v-model="inputValue"
      type="text"
      class="input-box"
      :style="inputBoxStyle"
      @input="onInput"
      @keydown.enter.prevent="submitSearch"
      :placeholder="placeholderText"
    />
    <div
      v-show="shouldShowSuggestions"
      class="suggestion-container"
      @mousedown.prevent
    >
      <history-card @fill-search-input="fillSearchInput" v-show="showHistory"></history-card>
      <recommend-card @fill-search-input="fillSearchInput" v-show="showHot"></recommend-card>
    </div>
  </div>
</template>
<script>
import HistoryCard from './utils/HistoryCard.vue';
import RecommendCard from './utils/RecommendCard.vue';

export default {
  emits: ['update:modelValue', 'blur', 'submit'],
  data() {
    return {
      inputValue: this.modelValue,
      isFocused: false, // 输入框是否获得焦点
      isSuggestionOpen: false, // 是否显示搜索建议
      showHistory: true, // 是否显示历史记录
      showHot: true, // 是否显示热榜
    };
  },
  props: {
    canSuggestion:{
      type:Boolean,
      default:true
    },
    modelValue: { // 接收父组件传递的值
      type: String,
      default: ''
    },
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    inputStyle: {
      type: Object,
      default: () => ({})
    },
    borderColor: { // 传入的边框颜色
      type: String,
      default: 'white',
    },
    boxShadowColor: { // 传入的阴影颜色
      type: String,
      default: 'rgba(255, 255, 255, 0.5)',
    },
    placeholderColor: { // 传入的 placeholder 字体颜色
      type: String,
      default: '#aaa',
    },
    placeholderText: { // 传入的 placeholder 文本
      type: String,
      default: '请输入...'
    }
  },
  watch: {
    modelValue(newValue) {
      this.inputValue = newValue;
    },
    inputValue(newValue) {
      this.$emit('update:modelValue', newValue);
    }
  },
  components: {
    HistoryCard,
    RecommendCard,
  },
  computed: {
    shouldShowSuggestions() {
      return this.canSuggestion && this.isFocused && this.isSuggestionOpen;
    },
    // 动态生成 input 框的样式
    inputBoxStyle() {
      return Object.assign({}, {
        borderColor: this.isFocused ? this.borderColor : '#aaa',
        boxShadow: this.isFocused ? `0 0 5px ${this.boxShadowColor}` : 'none',
      }, this.inputStyle, this.shouldShowSuggestions ? {
        borderRadius: '12px 12px 0 0',
        borderColor: '#e3e5e7',
        borderBottomColor: 'transparent',
        boxShadow: 'none',
        backgroundColor: '#fff',
        color: '#18191c',
      } : {});
    },
  },
  methods: {
    onFocus() {
      this.isFocused = true;
      this.isSuggestionOpen = true;
    },
    onBlur(event) {
      if (event.currentTarget.contains(event.relatedTarget)) {
        return;
      }
      //提交事件：搜索输入框失去焦点
      this.$emit('blur');
      this.isFocused = false;
      this.isSuggestionOpen = false;
    },
    onInput() {
      if (this.isFocused) {
        this.isSuggestionOpen = true;
      }
    },
    submitSearch(event) {
      this.$emit('submit');
      event.currentTarget.blur();
      this.isFocused = false;
      this.isSuggestionOpen = false;
    },
    fillSearchInput(text){
      this.inputValue=text;
      this.$refs.input.focus();
    },
    dismissSuggestions() {
      this.$refs.input.focus();
      this.isSuggestionOpen = false;
    }
  }
};
</script>
<style scoped>
.input-container {
  position: relative;
  display: inline-block;
  min-width: 0;
  max-width: calc(100vw - 24px);
  z-index: 1000;
}

.input-box {
  display: block;
  box-sizing: border-box;
  max-width: 100%;
  padding: 3px;
  border: 1px solid #aaa;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.input-box::placeholder {
  color: var(--placeholder-color, #aaa); /* 通过动态 CSS 属性设置 placeholder 的颜色 */
}

.suggestions-open {
  border-radius: 12px 12px 0 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.suggestion-container {
  position: absolute;
  top: 100%;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  max-height: min(480px, 70vh);
  max-height: min(480px, 70dvh);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #e3e5e7;
  border-top: 0;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.16);
}

.suggestion-container > * {
  flex-shrink: 0;
}

.suggestion-container > :not(:first-child) {
  border-top: 1px solid #f1f2f3;
}
</style>
