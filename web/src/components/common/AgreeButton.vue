<template>
    <div class="full-row">
        <v-radio-group :color="themeColor" density="compact" v-model="state">
            <div style="display: flex;flex-direction: row;align-items: center;">
                <v-radio style="font-size: 14px;max-width: 16px;" @click="state=state==='agree'?'disagree':'agree'" value="agree"></v-radio>
                <div class="text-small text">{{ text }}</div>
            </div>
        </v-radio-group>
    </div>
</template>
<script>
import { globalProperties } from '@/main';

export default {
  name: 'AgreeButton',
  props: {
    text: {
      type: String,
      default: '自动登陆'
    }
  },
  setup(){
    const themeColor=globalProperties.$themeColor;
    return {
        themeColor
    }
  },
  data(){
    return {
        state: 'disagree'
    }
  },
  watch:{
    state(val){
        this.$emit('agree', val==='agree');
    }
  },
  methods:{
  }
}
</script>
<style scoped>
.full-row{
    max-height: 20px;
    display: flex;
    justify-content: center;
    flex-direction: row;
    margin-left: 5px;
}
.text{
    margin-left: 10px;
}
</style>