<template>
  <v-card elevation="0" v-if="!ifDeleted" class="container">
    <div v-if="data.postTitle" class="text-medium-bold post-title-div"> {{ '回复帖子: '+data.postTitle }}</div>
    <div v-if="!ifPreview" class="name text-medium meta-row">
      <avatar-name v-if="data.authorId" :initData="{ id: data.authorId, name: data.authorName }"></avatar-name>
      <div class="meta-divider"></div>
      <div class="time text-small muted">
        <v-icon size="16" icon="mdi-clock-outline"></v-icon>
        <span>{{ this.data.publishTime }}</span>
      </div>
    </div>
    <div @click="click" class="comment text-medium content comment-body">
      <!-- 父级回复内容显示区域 -->
      <div v-if="this.ifChild && localParentReplyContent" class="parent-reply-container" @click.stop="showParent">
        <div class="parent-reply-content">
          <span class="parent-reply-author" :style="{ 'color': themeColor }">{{ parentAuthorName }}</span>
          <span class="parent-reply-separator">：</span>
          <span class="parent-reply-text">{{ localParentReplyContent }}</span>
        </div>
      </div>
      <!-- 如果没有父级回复内容，只显示作者名（可点击跳转） -->
      <div v-else-if="this.ifChild" class="parent-reply-author-only" @click.stop="showParent">
        <span class="text-medium-bold" :style="{ 'color': themeColor }">{{ parentAuthorName }}：</span>
      </div>
      <!-- 当前回复内容 -->
      <div class="content-wrapper-container">
        <div ref="contentContainer"
          :class="['content-wrapper', { collapsed: isCollapsed && showToggle }]">
          <with-link-container :initData="{'content':displayContent}" class="key-text"></with-link-container>
        </div>
        <div v-if="showToggle && isCollapsed" class="content-gradient"></div>
      </div>
      <div v-if="showToggle" class="collapse-toggle text-small" :style="{ color: themeColor }"
        @click.stop="toggleCollapse">
        {{ isCollapsed ? '展开' : '收起' }}
        <v-icon size="16" :icon="isCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"></v-icon>
      </div>
      <!-- 图片列表（最多3张） -->
      <div v-if="displayImgList && displayImgList.length > 0" class="reply-image-list">
        <div
          v-for="(src, index) in displayImgList"
          :key="index"
          class="reply-image-item"
          @click="handleImageClick(index)"
        >
          <img-card
            :src="src"
            :width="80"
            :height="80"
            :editable="false"
            :clickable="false"
          ></img-card>
        </div>
      </div>
      <!-- 图片查看器 -->
      <image-viewer
        v-model="showImageViewer"
        :image-list="imgList || []"
        :initial-index="currentImageIndex"
        @close="showImageViewer = false"
      ></image-viewer>
    </div>
    <div class="bottom-bar">
      <div class="bottom-actions text-small">
        <div v-if="!ifPreview" class="bottom-btn-container">
          <like-button @alert="alert" @set_loading="setLoading" :size="'20'" :id="this.data.id"
            :state="this.data.ifLike" :type="'reply'"></like-button>
        </div>
        <div class="like-num text-small">
          {{ this.data.likeNum }}
        </div>
      </div>
      <div class="bottom-time text-small muted" v-if="ifPreview">
        <v-icon size="16" icon="mdi-clock-outline"></v-icon>
        <span>{{ this.data.publishTime }}</span>
      </div>
      <v-spacer></v-spacer>
      <div v-if="!ifPreview" class="bottom-icon-btn">
        <v-btn @click="setReplyEditorState(true)" elevation="0" icon class="icon-btn">
          <v-icon :size="'23'" icon="mdi-reply-outline"></v-icon>
        </v-btn>
      </div>
      <div v-if="userId != data.authorId" class="bottom-icon-btn">
        <alert-button :size="'20'" :id="this.data.id" :type="'reply'"></alert-button>
      </div>
      <div v-else class="bottom-icon-btn">
        <delete-button @delete="deleteSelf" :id="this.data.id" :type="'reply'" :size="20" @alert="alert"
          @set_loading="setLoading"></delete-button>
      </div>
    </div>
    <!-- 回复编辑器 -->
    <reply-editor
      v-model:if-show="ifShowReplyEditor"
      :post-id="postId"
      :parent-author-name="data.authorName"
      :parent-reply-id="data.id"
      @reply="handleReply"
      @alert="alert"
      @set-loading="setLoading"
      @close="handleCloseEditor"
    ></reply-editor>
  </v-card>
</template>

<script>
import AlertButton from '@/components/report/AlertButton.vue';
import LikeButton from '@/components/common/LikeButton.vue';
import AvatarName from '@/components/common/AvatarName';
import { getCookie } from '@/utils/cookie';
import DeleteButton from '@/components/common/DeleteButton.vue';
import { globalProperties } from '@/main';
import { ref } from 'vue';
import WithLinkContainer from '@/components/common/WithLinkContainer.vue';
import ImgCard from '@/components/common/ImgCard.vue';
import { formatRelativeTime, getAuthorNameFromReply, getParentReplyIdFromReply, getReplyContentWithoutHeader, openPage, extractImageLinksInBrackets } from '@/utils/other';
import { getReplyDetailById } from '@/api/modules/post';
import { removeImageLinksInBrackets } from '@/utils/imageUtils';
import ImageViewer from '@/components/common/ImageViewer.vue';
import ReplyEditor from './ReplyEditor.vue';

export default {
  name: 'ReplyItem',
  components: {
    AlertButton,
    LikeButton,
    AvatarName,
    DeleteButton,
    WithLinkContainer,
    ImgCard,
    ImageViewer,
    ReplyEditor,
  },
  props: {
    initData: {
      type: Object,
      default: () => {
        return {
          id: null,
          authorName: null,
          publishTime: null,
          likeNum: null,
          content: null,
          authorId: null,
        }
      }
    },
    postId: {
      type: String,
      default: null
    },
    ifPreview: {
      type: Boolean,
      default: false,
    },
    parentReplyContent: {
      type: String,
      default: null
    },
  },
  setup() {
    const themeColor = globalProperties.$themeColor;
    const userId = getCookie("userId");
    const ifShowReplyEditor = ref(false);
    const showImageViewer = ref(false);
    const currentImageIndex = ref(0);

    const setReplyEditorState = (state) => {
      ifShowReplyEditor.value = state;
    };

    return {
      userId,
      themeColor,
      ifShowReplyEditor,
      setReplyEditorState,
      showImageViewer,
      currentImageIndex,
    };
  },
  data() {
    const data = this.initData;
    if (data.publishTime) {
      data.publishTime = formatRelativeTime(data.publishTime);
    }
    return {
      data,
      ifDeleted: false,
      ifChild: false,
      parentAuthorName: null,
      parentReplyId: null,
      localParentReplyContent: null,
      loadingParentReply: false,
      isCollapsed: true,
      showToggle: false,
      imgList: [],
      displayContent: '',
    }
  },
  computed: {
    // 最多显示3张图片
    displayImgList() {
      if (!this.imgList || this.imgList.length === 0) {
        return [];
      }
      return this.imgList.slice(0, 3);
    }
  },
  methods: {
    handleImageClick(index) {
      this.currentImageIndex = index;
      this.showImageViewer = true;
    },
    click() {
      if (this.ifPreview) {
        openPage("router", {
          name: 'PostPage',
          params: {
            id: this.data.id,
          }
        });
      }
    },
    alert(msg) {
      this.$emit('alert', msg);
    },
    setLoading(msg) {
      this.$emit('set_loading', msg);
    },
    deleteSelf() {
      this.ifDeleted = true;
    },
    showParent() {
      this.$emit('show_parent', this.parentReplyId);
    },
    toggleCollapse() {
      if (!this.showToggle) {
        return;
      }
      this.isCollapsed = !this.isCollapsed;
    },
    evaluateContent() {
      this.$nextTick(() => {
        if (typeof window === 'undefined') {
          return;
        }
        const el = this.$refs.contentContainer;
        if (!el) {
          this.showToggle = false;
          this.isCollapsed = false;
          return;
        }
        const computedStyle = window.getComputedStyle(el);
        let lineHeightValue = parseFloat(computedStyle.lineHeight);
        if ((!lineHeightValue || isNaN(lineHeightValue)) && computedStyle.fontSize) {
          const fontSize = parseFloat(computedStyle.fontSize);
          if (fontSize && !isNaN(fontSize)) {
            lineHeightValue = fontSize * 1.2;
          }
        }
        if (!lineHeightValue || isNaN(lineHeightValue)) {
          this.showToggle = false;
          this.isCollapsed = false;
          return;
        }
        const maxVisibleHeight = lineHeightValue * 3 + 1;
        const scrollHeight = el.scrollHeight;
        const needCollapse = scrollHeight - maxVisibleHeight > 1;
        const previousShowToggle = this.showToggle;
        this.showToggle = needCollapse;
        if (!needCollapse) {
          this.isCollapsed = false;
        } else if (!previousShowToggle) {
          this.isCollapsed = true;
        }
      });
    },
    async loadParentReplyContent() {
      if (!this.parentReplyId || this.loadingParentReply) {
        return;
      }

      this.loadingParentReply = true;
      try {
        const response = await getReplyDetailById(this.parentReplyId);
        if (response.status === 200 || response.status === 201) {
          let parentContent = response.reply_detail?.reply_content || '';
          if (parentContent.startsWith("@")) {
            parentContent = getReplyContentWithoutHeader(parentContent);
          }
          this.localParentReplyContent = parentContent;
        }
      } catch (error) {
        console.warn('加载父级回复内容失败:', error);
      } finally {
        this.loadingParentReply = false;
      }
    },
    handleReply(replyData) {
      this.$emit("reply", replyData);
    },
    handleCloseEditor() {
      // 编辑器关闭时的处理
    },
  },
  watch: {
    'data.content': {
      handler(newContent) {
        if (newContent) {
          this.imgList = extractImageLinksInBrackets(newContent);
          this.displayContent = removeImageLinksInBrackets(newContent);
        }
        this.evaluateContent();
      },
      immediate: true,
    },
    parentReplyContent: {
      handler(newVal) {
        if (newVal && this.ifChild) {
          this.localParentReplyContent = newVal;
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.evaluateContent();
  },
  async created() {
    let content = this.data.content;
    this.imgList = extractImageLinksInBrackets(content);
    this.displayContent = removeImageLinksInBrackets(content);

    if (this.displayContent.startsWith("@")) {
      try {
        this.parentAuthorName = getAuthorNameFromReply(this.displayContent);
        this.parentReplyId = getParentReplyIdFromReply(this.displayContent);
        this.displayContent = getReplyContentWithoutHeader(this.displayContent);
        this.ifChild = true;

        if (this.parentReplyContent) {
          this.localParentReplyContent = this.parentReplyContent;
          return;
        }

        if (this.parentReplyId) {
          this.loadParentReplyContent();
        }
      } catch (e) {
        return;
      }
    }
  },
}
</script>

<style scoped>
.bottom-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
}

.row-div {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.content {
  white-space: pre-line;
}

.comment-body {
  padding: 8px 10px;
  border-radius: 8px;
}

/* 父级回复容器 */
.parent-reply-container {
  margin-bottom: 6px;
  padding: 6px 8px;
  background-color: rgba(0, 0, 0, 0.03);
  border-left: 3px solid var(--theme-color, #1976d2);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.parent-reply-container:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.parent-reply-content {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px;
  line-height: 1.5;
}

.parent-reply-author {
  font-weight: 600;
  font-size: var(--font-size-small);
}

.parent-reply-separator {
  color: #8a8a8a;
  font-size: var(--font-size-small);
}

.parent-reply-text {
  color: #666666;
  font-size: var(--font-size-small);
  flex: 1;
  min-width: 0;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.parent-reply-author-only {
  margin-bottom: 6px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.parent-reply-author-only:hover {
  opacity: 0.8;
}

.content-wrapper {
  width: 100%;
}

.content-wrapper-container {
  position: relative;
  width: 100%;
}

.content-wrapper.collapsed {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

.content-gradient {
  pointer-events: none;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.85) 65%, rgba(255, 255, 255, 1) 100%);
}

.collapse-toggle {
  display: flex;
  align-items: center;
  width: fit-content;
  cursor: pointer;
  margin-top: 4px;
  gap: 2px;
}

.reply-image-list {
  display: flex;
  overflow-x: auto;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  margin-bottom: 4px;
  padding: 2px 0;
}

.reply-image-item {
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  flex-shrink: 0;
}

.reply-image-item:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.reply-image-item:active {
  transform: scale(0.98);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666666;
  margin-bottom: 6px;
}

.meta-divider {
  width: 1px;
  height: 14px;
  background-color: rgba(0, 0, 0, 0.08);
}

.muted {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8a8a8a;
}

.like-num {
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 4px;
  margin-right: 12px;
  max-width: 100px;
  color: grey;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bottom-time {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.bottom-icon-btn {
  margin-right: 8px;
  display: flex;
}

.icon-btn {
  width: 28px;
  height: 28px;
  color: #8a8a8a;
  background-color: transparent;
}

.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

@media screen and (min-width: 1000px) {
  .content-gradient {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 65%, rgba(255, 255, 255, 1) 100%);
  }

  .post-title-div {
    color: grey;
    max-width: 80%;
    margin-top: 4px;
    margin-bottom: 6px;
    width: fit-content;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .container {
    background-color: white;
    transition: background-color 0.2s ease;
    width: 900px;
    display: flex;
    flex-direction: column;
    padding-top: 8px;
    padding-left: 8px;
    padding-right: 8px;
    padding-bottom: 8px;
    border-bottom: 0.5px #dddddd solid;
    border-radius: 0px;
  }

  .name {
    width: 100%;
    display: flex;
    margin-bottom: 0;
  }

  .time {
    flex-direction: row;
    display: flex;
    color: grey;
    width: fit-content;
    margin-right: 0;
    align-items: center;
  }
}

@media screen and (max-width: 1000px) {
  .content-gradient {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.85) 65%, rgba(255, 255, 255, 1) 100%);
  }

  .parent-reply-container {
    padding: 6px 8px;
    margin-bottom: 6px;
  }

  .parent-reply-author {
    font-size: var(--font-size-tiny);
  }

  .parent-reply-separator {
    font-size: var(--font-size-tiny);
  }

  .parent-reply-text {
    font-size: var(--font-size-tiny);
  }

  .container {
    background-color: white;
    width: 100%;
    transition: background-color 0.2s ease;
    display: flex;
    flex-direction: column;
    padding-top: 8px;
    padding-left: 8px;
    padding-right: 8px;
    padding-bottom: 8px;
    border-bottom: 0.5px #dddddd solid;
    border-radius: 0px;
  }

  .post-title-div {
    color: grey;
    margin-top: 4px;
    margin-bottom: 6px;
    max-width: 80vw;
    width: fit-content;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .name {
    width: 100%;
    display: flex;
    margin-bottom: 0;
  }

  .time {
    flex-direction: row;
    display: flex;
    margin-top: 0;
    color: grey;
    width: fit-content;
    margin-right: 0;
    align-items: center;
  }
}
</style>

