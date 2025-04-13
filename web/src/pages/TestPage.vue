<template>
  <div class="background-container">
    <!-- Bubble canvas background -->
    <EmojiPicker></EmojiPicker>
    <ImgCard src="https://tse1-mm.cn.bing.net/th/id/OIP-C.IJZgTNx1vp9EML_1wV5p2gHaEo?rs=1&pid=ImgDetMain"></ImgCard>
    <AgreeButton @agree="handleAgree"></AgreeButton>
  </div>
</template>

<script>
import AgreeButton from '@/components/AgreeButton.vue';
import EmojiPicker from '@/components/EmojiPicker.vue';
import ImgCard from '@/components/ImgCard.vue';


export default {
  components: {
    EmojiPicker,
    ImgCard,
    AgreeButton,
  },
  data() {
    return {
      text: '',
    };
  },
  mounted() {
  },
  methods: {
    handleAgree(state){
      if(state){
        window.alert("agreed");
      }else{
        window.alert("disagreed");
      }
    },
    d() {
      this.text = ''; // Add your delete functionality here
    },

  },
};
</script>

<style scoped>
.background-container {
  position: relative;
  background-color: white;
  width: 100%;
  height: 100vh;
}

#header_canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1; /* Place it behind the content */
  width: 100%;
  height: 100%;
}

.content {
  position: relative;
  z-index: 1;
  padding: 20px;
  color: white;
}

input {
  margin-bottom: 10px;
}

button {
  margin-top: 10px;
}
</style>
