<template>
  <div class="background-container">
    <!-- Bubble canvas background -->
    <canvas class="background" id="bubble_canvas"></canvas>
  </div>
</template>

<script>
import { initBubbleEffect } from '@/utils/animation';

export default {
  components: {
  },
  data() {
    return {
      text: '',
    };
  },
  mounted() {
    initBubbleEffect(document)
  },
  methods: {
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
