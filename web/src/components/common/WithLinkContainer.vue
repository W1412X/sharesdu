<template>
  <span v-if="!ifHtml">
    <span v-for="(item, index) in processedContent" :key="index">
    <span v-if="!item.isLink && !item.isKey">{{ item.text }}</span>
    <span v-if="item.isKey" :style="{ 'color': themeColor, 'font-weight': 'bold' }">{{ item.text }}</span>
    <link-item :clickable="clickable" v-if="item.isLink" :init-data="{ 'link': item.text }" />
  </span>
  </span>
  <div v-if="ifHtml"  style="width: 100%;max-width:100%;display: flex;overflow: auto;">
    <div style="width: fit-content;height: fit-content;">
      <iframe
      ref="iframe"
      frameborder="0"
      :style="{border: 'none',width: iframeWidth, height: iframeHeight}"
      :src="tmpUrl"
    ></iframe>
    </div>
  </div>
</template>

<script>
import { extractLinks, getPostWithoutLink, removeImageLinksInBrackets } from '@/utils/other';
import LinkItem from './LinkItem.vue';
import { globalProperties } from '@/main';

export default {
  components: {
    LinkItem,
  },
  props: {
    initData: {
      type: Object,
      default: () => {
        return {
          content: "",
          keywords: [],
        }
      }
    },
    clickable: {
      type: Boolean,
      default: true
    },
    type:{
      type:String,
      default:"other"//post/post   
    }
  },
  setup() {
    let themeColor = globalProperties.$themeColor;
    return {
      themeColor,
    }
  },
  data() {
    let data = this.initData;
    if (!data.keywords) {
      data.keywords = [];
    }
    return {
      iframeHeight: null,
      iframeWidth: null,
      data,
      ifHtml:false,
      processedContent:null,
      tmpUrl: null,
    };
  },
  methods: {
    processContent() {
      const result = [];
      let lastIndex = 0;
      const matches = [];

      // 提取链接并记录位置
      const links = extractLinks(this.data.content);
      links.forEach(link => {
        const index = this.data.content.indexOf(link);
        if (index !== -1) {
          matches.push({
            type: 'link',
            value: link,
            start: index,
            end: index + link.length
          });
        }
      });

      // 提取关键词并记录位置
      this.data.keywords.forEach(keyword => {
        const regex = new RegExp(`${keyword}`, 'g');
        let match;
        while ((match = regex.exec(this.data.content)) !== null) {
          matches.push({
            type: 'keyword',
            value: keyword,
            start: match.index,
            end: match.index + keyword.length
          });
        }
      });

      // 按位置排序，同位置时链接优先
      matches.sort((a, b) => {
        if (a.start !== b.start) return a.start - b.start;
        return a.type === 'link' ? -1 : 1;
      });

      // 生成结果
      matches.forEach(match => {
        // 添加普通文本部分
        if (match.start > lastIndex) {
          result.push({
            text: this.data.content.slice(lastIndex, match.start),
            isLink: false,
            isKey: false
          });
        }

        // 添加匹配项
        result.push({
          text: match.value,
          isLink: match.type === 'link',
          isKey: match.type === 'keyword'
        });

        // 更新指针
        lastIndex = match.end;
      });

      // 添加剩余文本
      if (lastIndex < this.data.content.length) {
        result.push({
          text: this.data.content.slice(lastIndex),
          isLink: false,
          isKey: false
        });
      }
      return result;
    },
    setupIframeResize() {
      const iframe = this.$refs.iframe;

      if (!iframe) return;

      iframe.onload = () => {
        try {
          const height = iframe.contentWindow.document.body.scrollHeight;
          this.iframeHeight = height + 'px';
          this.iframeWidth=iframe.contentWindow.document.body.scrollWidth+'px';
          console.log(this.iframeHeight);
        } catch (e) {
          console.error("无法访问 iframe 内容（可能是跨域）", e);
        }
      };
    }
  },
  beforeMount(){
    if(this.type=='post'){
      this.data.content=getPostWithoutLink(this.data.content);
      if(this.data.content.startsWith("SELF-DEFINE-HTML")){
        this.data.content=this.data.content.substring(16);
        this.ifHtml=true;
        this.tmpUrl=URL.createObjectURL(new Blob([this.data.content], { type: "text/html" }));
        console.log(this.tmpUrl);
      }else{
        this.data.content=removeImageLinksInBrackets(this.data.content);
        this.processedContent=this.processContent(this.data.content);
      }
    }else{
      this.processedContent=this.processContent(this.data.content);
    }
  },
  mounted(){
    if(this.ifHtml){
      this.setupIframeResize();
    }
  },
  beforeUnmount(){
    URL.revokeObjectURL(this.tmpUrl);
  }
};
</script>