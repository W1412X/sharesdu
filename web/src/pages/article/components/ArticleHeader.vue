<template>
  <div class="top-bar">
    <!-- 置顶提示 -->
    <v-chip
      v-if="article.ifTop && !ifMaster"
      width="100%"
      variant="tonal"
      :color="themeColor"
      style="border-radius: 0px; max-height: 28px; width: 100%; justify-content: center;"
    >
      <v-icon size="20">mdi-format-vertical-align-top</v-icon>
      <span style="margin-left: 10px;" class="text-small-bold">置顶文章</span>
      <v-tooltip activator="parent">此文章为网站置顶文章</v-tooltip>
    </v-chip>
    
    <!-- 管理员置顶按钮 -->
    <v-btn
      v-if="ifMaster"
      @click="$emit('set-article-top')"
      :loading="loading.top"
      :disabled="loading.top"
      width="100%"
      variant="tonal"
      :color="article.ifTop ? 'grey' : themeColor"
      style="max-height: 28px; width: 100%; justify-content: center;"
    >
      <v-icon size="20">mdi-format-vertical-align-top</v-icon>
      <span style="margin-left: 10px;" class="text-small-bold">
        {{ article.ifTop ? '取消置顶' : '置顶此文章' }}
      </span>
      <v-tooltip activator="parent">作为管理员，您可以设置是否置顶此文章</v-tooltip>
    </v-btn>
    
    <!-- 标题和类型 -->
    <div class="title-container">
      <div class="title">
        <p class="title-big-bold">{{ article.title }}</p>
      </div>
      <v-spacer></v-spacer>
      <div class="title-right-type">
        <span v-if="article.type === '原创'">原创</span>
        <span v-if="article.type === '转载'" @click="$emit('to-origin-link')">转载</span>
      </div>
    </div>
    
    <!-- 作者和统计信息 -->
    <div class="top-bar-msg-div">
      <div class="full-column-center text-medium grey-font">
        <avatar-name
          v-if="article.authorId"
          :init-data="{ id: article.authorId, name: article.authorName }"
        />
      </div>
      <v-spacer></v-spacer>
      <div class="full-column-center text-small grey-font">
        <div class="row-div-reverse">
          <div class="row-right-20px">
            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-star" size="18"></v-icon>
            <div class="column-center">{{ article.starCount }}</div>
          </div>
          <div class="row-right-20px">
            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-comment" size="16"></v-icon>
            <div class="column-center">{{ article.replyCount }}</div>
          </div>
          <div class="row-right-20px">
            <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-eye" size="17"></v-icon>
            <div class="column-center">{{ article.viewCount }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 发布时间 -->
    <div class="row-div">
      <div class="row-right-20px" style="margin: 2px;">
        <div class="column-center text-small grey-font">{{ article.publishTime }}</div>
        <v-icon class="icon-left-5px" color="#8a8a8a" icon="mdi-clock-outline" size="17"></v-icon>
      </div>
    </div>
    
    <!-- 标签 -->
    <div class="top-bar-msg-div">
      <div class="before-text text-small">标签：</div>
      <tag-button
        v-for="(tag, index) in article.tags"
        :key="index"
        :data="tag"
      />
    </div>
    
    <!-- 来源栏 -->
    <div v-if="article.sourceUrl" class="source-bar-container">
      <source-bar
        :article-id="article.id"
        :article-title="article.title"
        @alert="$emit('alert', $event)"
        @set_loading="$emit('set-loading', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import TagButton from '@/components/article/TagButton.vue';
import SourceBar from '@/components/article/SourceBar.vue';
import AvatarName from '@/components/common/AvatarName.vue';

defineProps({
  article: {
    type: Object,
    required: true,
  },
  ifMaster: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Object,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['set-article-top', 'to-origin-link', 'alert', 'set-loading']);
</script>

<style scoped>
.top-bar-msg-div {
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  padding-bottom: 5px;
  align-items: center;
  overflow-x: auto;
}

.source-bar-container {
  width: 100%;
}

.row-right-20px {
  display: flex;
  flex-direction: row;
  margin-right: 20px;
  align-items: center;
}

.icon-right-5px {
  margin-right: 5px;
}

.icon-left-5px {
  margin-left: 5px;
}

.row-div-reverse {
  overflow-x: auto;
  max-width: 100%;
  display: flex;
  flex-direction: row-reverse;
}

.row-div {
  overflow-x: auto;
  max-width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
}

.before-text {
  font-weight: bold;
  min-width: 45px;
  color: grey;
}

.grey-font {
  white-space: nowrap;
  word-break: break-all;
  overflow: hidden;
  color: grey;
}

.column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.full-column-center {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
}

@media screen and (min-width: 1000px) {
  .top-bar {
    border: grey 1px solid;
    width: 1000px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  .title-container {
    width: 980px;
    display: flex;
    flex-direction: row;
  }

  .title {
    width: 750px;
    white-space: normal;
    word-break: break-all;
    overflow: hidden;
  }

  .title-right-type {
    margin-right: 30px;
    font-size: 20px;
    color: var(--theme-color);
    font-weight: bold;
  }
}

@media screen and (max-width: 1000px) {
  .top-bar {
    border: grey 1px solid;
    width: 100vw;
    padding-left: 2vw;
    padding-right: 2vw;
    padding-top: 1vw;
    padding-bottom: 1vw;
  }

  .title-container {
    width: 98vw;
    display: flex;
    flex-direction: row;
  }

  .title {
    width: 75vw;
    white-space: normal;
    word-break: break-all;
    overflow: hidden;
  }

  .title-right-type {
    margin-right: 3vw;
    font-size: 20px;
    color: var(--theme-color);
    font-weight: bold;
  }
}
</style>

