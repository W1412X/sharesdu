<template>
  <SensitiveTextArea v-model="text"></SensitiveTextArea>
  <v-btn @click="d()">delte</v-btn>
</template>

<script>
import SensitiveTextArea from '@/components/SensitiveTextArea.vue';
import { dbDeleteProfile } from '@/utils/db';

export default{
  components:{
    SensitiveTextArea,
  },
  data(){
    return {
      text: ''
    }
  },
  methods:{
    d(){
      dbDeleteProfile(this.text);
    }
  }
}
</script>
<style scoped>
input {
  margin-bottom: 10px;
}

button {
  margin-top: 10px;
}
</style>