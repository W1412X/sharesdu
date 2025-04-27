<!-- a text area with sensitive words filter -->
<template>
    <v-text-field ref="input" v-bind="textareaProps" :rules="[rules.sensitiveHint]" v-model="internalValue" @compositionend="handleCompositionEnd"
        @compositionstart="handleCompositionStart" @input="handleInput" />
</template>

<script>
import { replaceAll } from '@/utils/sensitive';
import { ref, computed, watch, defineComponent } from 'vue';

export default defineComponent({
    name: 'SensitiveTextarea',
    props: {
        modelValue: {
            type: [String, Number],
            default: ''
        },
    },
    setup(props) {
        const internalValue = ref(props.modelValue);
        const textareaProps = computed(() => {
            const { modelValue, style, ...restProps } = props;
            modelValue
            style
            return restProps;
        });

        watch(() => props.modelValue, (newValue) => {
            internalValue.value = newValue;
        });
        return {
            internalValue,
            textareaProps,
        };
    },
    data() {
        return {
            ifTyping: false,
            rules:{
                sensitiveHint : value => this.checkSensitive(value)
            }
        }
    },
    methods: {
        checkSensitive(value){
            const result = replaceAll(value);
            if(result.length==0){
                return true;
            }else{
                return "包含敏感词 \""+result.join("\"、\"")+"\"";
            }
        },
        handleCompositionStart() {
            this.ifTyping = true
        },
        handleCompositionEnd() {
            this.ifTyping = false;
            this.handleInput();
        },
        sensitiveHint(){

        },
        handleInput() {
            if (this.ifTyping) {//if tying,ignore
                setTimeout(()=>{
                    this.$emit('update:modelValue', this.internalValue);
                },100);
            } else {//not tying,examine
                setTimeout(() => {
                    this.$emit('update:modelValue', this.internalValue);
                }, 100)
            }
        }
    }
});
</script>
