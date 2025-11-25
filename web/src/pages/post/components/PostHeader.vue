<template>
  <part-loading-view
    :state="!loadState"
    class="top-bar"
    :text="'正在加载帖子信息...'"
  ></part-loading-view>
  <div v-if="loadState" class="top-bar surface-card">
    <div class="top-bar-msg-div">
      <div class="full-column-center text-medium name-font">
        <avatar-name
          v-if="post.authorId"
          :init-data="{ id: post.authorId, name: post.authorName }"
        ></avatar-name>
      </div>
      <v-spacer></v-spacer>
      <div class="column-center padding-right-5px">
        <star-button
          v-if="post.id"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
          :state="post.ifStar"
          :type="'post'"
          :id="post.id"
        ></star-button>
      </div>
    </div>
    <div class="title-container title-bold">
      {{ post.title }}
    </div>
    <div class="detail-text text-medium detail-panel">
      <with-link-container
        :init-data="{ content: post.content }"
        :type="'post'"
      ></with-link-container>
    </div>
    <div class="row-div-scroll">
      <img-card
        v-for="(img, index) in post.imgList"
        :key="index"
        :height="140"
        :width="140"
        :src="img"
      ></img-card>
    </div>
    <div class="full-column-center text-small grey-font">
      <div class="comment-star-display-div">
        <div class="row-right-20px-column-center">
          <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-heart" size="18"></v-icon>
          <div class="column-center">
            {{ post.likeNum }}
          </div>
        </div>
        <div class="row-right-20px-column-center">
          <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-comment" size="16"></v-icon>
          <div class="column-center">
            {{ post.replyNum }}
          </div>
        </div>
        <div class="row-right-20px-column-center">
          <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-eye" size="16"></v-icon>
          <div class="column-center">
            {{ post.viewNum }}
          </div>
        </div>
        <v-spacer></v-spacer>
        <div class="time-div grey-font text-small">
          <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-clock" size="17"></v-icon>
          <div class="column-center">
            {{ post.publishTime }}
          </div>
        </div>
      </div>
    </div>
    <v-btn
      v-if="post.relativeLink"
      @click="$emit('to-relative')"
      class="link-btn"
      variant="tonal"
      :color="themeColor"
    >
      {{ relativeText }}
    </v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AvatarName from '@/components/common/AvatarName.vue';
import StarButton from '@/components/star/StarButton.vue';
import WithLinkContainer from '@/components/common/WithLinkContainer.vue';
import ImgCard from '@/components/common/ImgCard.vue';
import PartLoadingView from '@/components/common/PartLoadingView.vue';

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  loadState: {
    type: Boolean,
    default: false,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['alert', 'set-loading', 'to-relative']);

const relativeText = computed(() => {
  if (!props.post.relativeLink) return '';
  return props.post.relativeLink.includes('course') ? '关联课程' : '关联文章';
});
</script>

<style scoped>
.surface-card {
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.detail-panel {
  padding: 12px 16px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.02);
}

.top-bar-msg-div {
  margin-top: 5px;
  display: flex;
  flex-direction: row;
  padding-bottom: 5px;
  overflow-x: auto;
}

.padding-right-5px {
  padding-right: 5px;
}

.full-column-center {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
}

.column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.text-medium {
  font-size: 14px;
}

.name-font {
  font-weight: bold;
}

.title-container {
  white-space: pre-line;
  word-break: break-all;
  overflow: hidden;
  margin-top: 10px;
  margin-bottom: 10px;
}

.title-bold {
  font-weight: bold;
  font-size: 18px;
}

.detail-text {
  width: 100%;
  margin-top: 0px;
  margin-bottom: 5px;
  white-space: pre-line;
  word-break: break-all;
  overflow: hidden;
}

.row-div-scroll {
  margin: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow-x: auto;
  width: 100%;
}

.comment-star-display-div {
  overflow-x: auto;
  max-width: 100%;
  display: flex;
  flex-direction: row-reverse;
  margin-top: 10px;
}

.row-right-20px-column-center {
  display: flex;
  margin-top: 5px;
  align-items: center;
  flex-direction: row;
  margin-right: 20px;
}

.icon-right-5px {
  margin-right: 5px;
}

.time-div {
  display: flex;
  flex-direction: row;
  margin-top: 5px;
  align-items: center;
}

.text-small {
  font-size: 12px;
}

.grey-font {
  min-width: 200px;
  white-space: pre-line;
  word-break: break-all;
  overflow: hidden;
  color: grey;
}

.link-btn {
  margin-top: 10px;
}

@media screen and (min-width: 1000px) {
  .top-bar {
    border: grey 1px solid;
    width: 900px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  .title-container {
    width: 750px;
  }

  .name-font {
    width: 400px;
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
  }

  .name-font {
    width: 40vw;
  }
}
</style>

