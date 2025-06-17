<template>
      <span v-for="(item, index) in processedContent" :key="index">
        <span v-if="!item.isLink">{{ item.text }}</span>
        <link-item :clickable="clickable" v-if="item.isLink" :init-data="{'link':item.text}" />
      </span>
  </template>
  
  <script>
import { extractLinks } from '@/utils/other';
import LinkItem from './LinkItem.vue';

  export default {
    components: {
      LinkItem,
    },
    props: {
      initData: {
        type: Object,
        default: ()=>{
            return {
                content: "",
            }
        }
      },
      clickable:{
        type: Boolean,
        default: true
      }
    },
    data() {
        let data=this.initData;
        return {
            data
        };
    },
    computed: {
      processedContent() {
        const links = extractLinks(this.data.content);
        const parts = [];
        let lastIndex = 0;
  
        links.forEach((link) => {
          const index = this.data.content.indexOf(link, lastIndex);
          if (index > lastIndex) {
            parts.push({ text: this.data.content.slice(lastIndex, index), isLink: false });
          }
          parts.push({ text: link, isLink: true });
          lastIndex = index + link.length;
        });
  
        if (lastIndex < this.data.content.length) {
          parts.push({ text: this.data.content.slice(lastIndex), isLink: false });
        }
        console.log(parts);
        return parts;
      },
    },
    methods: {
    },
  };
  </script>