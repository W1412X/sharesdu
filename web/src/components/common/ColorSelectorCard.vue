<template>
    <v-card class="card" elevation="1">
      <div class="title-center">设置主题颜色</div>
      <div class="text-tiny">注: APP中重启应用生效</div>
      <div class="row-center">
        <v-color-picker :modes="['hexa']" v-model="this.color" hide-inputs></v-color-picker>
      </div>
      <div class="bottom-bar">
        <v-btn @click="setColor" text="确定设置" variant="outlined"></v-btn>
      </div>
    </v-card>
  </template>
  <script>
import { selfDefineLocalStorage } from '@/utils/localStorage';


    export default {
      setup() {},
      data() {
        return {
          color: '#9c0c13',
        }
      },
      methods: {
        setColor() {
            selfDefineLocalStorage.setItem("themeColor",this.color);
            this.$emit("set_color");
            location.reload();
        },
      },
    }
  </script>
  <style scoped>
    .card {
      border: 1px solid grey;
      border-radius: 5px;
      display: flex;
      width: fit-content;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
      padding-bottom: 10px;
    }
    .title-center {
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin-bottom: 10px;
    }
    .row-center {
      display: flex;
      width: 100%;
      flex-direction: row;
      justify-content: center;
    }
    .bottom-bar {
      margin-top: 10px;
      display: flex;
      flex-direction: row-reverse;
    }
  </style>
  