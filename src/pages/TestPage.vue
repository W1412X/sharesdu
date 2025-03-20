<template>
  <SensitiveTextArea v-model="text"></SensitiveTextArea>
  <v-btn @click="d()">delte</v-btn>
</template>

<script>
import SensitiveTextArea from '@/components/SensitiveTextArea.vue';

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