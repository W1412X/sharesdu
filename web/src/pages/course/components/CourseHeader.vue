<template>
  <v-card class="course-card">
    <part-loading-view :state="!loadState" :text="'正在加载课程...'"></part-loading-view>
    <div v-if="loadState" class="row-div">
      <div class="course-name">{{ course.name }}</div>
      <v-spacer></v-spacer>
      <v-btn
        @click="$emit('generate-share-image')"
        style="margin-right:10px;max-width: 25px;max-height: 25px;border-radius: 100%;"
        elevation="0"
        icon
        variant="text"
      >
        <v-icon icon="mdi-share-variant-outline" size="22" :color="'#8a8a8a'"></v-icon>
        <v-tooltip activator="parent">生成本课程的分享图片</v-tooltip>
      </v-btn>
      <v-btn
        @click="$emit('edit-course')"
        style="margin-right:10px;max-width: 25px;max-height: 25px;border-radius: 100%;"
        elevation="0"
        icon
        variant="text"
      >
        <v-icon icon="mdi-book-edit-outline" size="22" :color="'#8a8a8a'"></v-icon>
        <v-tooltip activator="parent">如课程信息有误，您可以提交修改</v-tooltip>
      </v-btn>
      <star-button
        :id="course.id"
        :type="'course'"
        @alert="$emit('alert', $event)"
        @set_loading="$emit('set-loading', $event)"
        :state="course.ifStar"
      />
    </div>
    <div v-if="loadState" class="msg-container">
      <div class="row-div">
        <div class="msg-item">课程类型:{{ course.type }}</div>
        <div class="msg-item">授课教师:{{ course.teacher }}</div>
        <div class="msg-item">教学方式:{{ course.attendMethod }}</div>
        <div class="msg-item">学分:{{ course.credit }}</div>
      </div>
      <div class="row-div">
        <div class="msg-item">开设校区:{{ course.campus }}</div>
        <div class="msg-item">开设学院:{{ course.college }}</div>
        <div class="msg-item">考核方式:{{ course.examineMethod }}</div>
      </div>
    </div>
    <div v-if="loadState" class="time-container">
      <v-icon class="icon-right-5px" color="#8a8a8a" icon="mdi-clock" size="18"></v-icon>
      <div class="text-small">{{ course.publishTime }}</div>
      <v-spacer></v-spacer>
      <span class="history-text text-small" @click="$emit('show-history')">查看历史版本</span>
    </div>
    <div v-if="loadState" class="visualize-score-card">
      <div class="bar-left-container">
        <div class="actual-score-text">
          {{ course.avgScore }}
          <span class="base-score-text">/5</span>
        </div>
        <v-rating
          :size="bigScoreBarSize"
          :model-value="course.avgScore"
          :color="themeColor"
          :disabled="true"
          half-increments
        ></v-rating>
        <div class="score-num-text">{{ course.evaluateNum }} 个评分</div>
      </div>
      <v-list
        style="width: 400px"
        bg-color="transparent"
        class="d-flex flex-column-reverse"
        density="compact"
      >
        <v-list-item v-for="(score, i) in course.scoreDistribution" :key="i">
          <div class="linear-bar-container">
            <v-icon size="20" icon="mdi-star" :color="themeColor"></v-icon>
            <span class="text-medium before-linear-bar-text">{{ i + 1 }}</span>
            <v-progress-linear
              :max="100"
              :model-value="100 * score / course.evaluateNum"
              class="linear-bar margin-left-5px"
              :color="themeColor"
              :height="barHeight"
            >
            </v-progress-linear>
          </div>
        </v-list-item>
      </v-list>
    </div>
  </v-card>
</template>

<script setup>
import StarButton from '@/components/star/StarButton.vue';
import PartLoadingView from '@/components/common/PartLoadingView.vue';

defineProps({
  course: {
    type: Object,
    required: true,
  },
  loadState: {
    type: Boolean,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
  barHeight: {
    type: Number,
    required: true,
  },
  bigScoreBarSize: {
    type: Number,
    required: true,
  },
});

defineEmits(['generate-share-image', 'edit-course', 'show-history', 'alert', 'set-loading']);
</script>

<style scoped>
.row-div {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.msg-container {
  width: 100%;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.msg-item {
  width: fit-content;
  margin-right: 20px;
  margin-top: 10px;
  white-space: nowrap;
  word-break: break-all;
  color: grey;
}

.time-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  color: #8a8a8a;
}

.history-text {
  color: #8a8a8a;
  text-decoration: underline;
  margin-left: 10px;
  margin-right: 10px;
  cursor: pointer;
}

.icon-right-5px {
  margin-right: 5px;
}

.before-linear-bar-text {
  color: grey;
  font-size: 14px;
}

.visualize-score-card {
  margin-top: 20px;
  background-color: var(--theme-color-transparent);
  border-radius: 10px;
  width: 770px;
  display: flex;
  flex-direction: row;
}

.base-score-text {
  color: grey;
  font-size: 20px;
}

.actual-score-text {
  font-size: 36px;
  color: var(--theme-color);
}

.score-num-text {
  margin-top: 5px;
  color: grey;
  font-size: 16px;
}

.linear-bar-container {
  align-items: center;
  width: 440px;
  display: flex;
  flex-direction: row;
}

.bar-left-container {
  width: 330px;
  display: flex;
  height: 216px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.margin-left-5px {
  margin-left: 5px;
}

.linear-bar {
  width: 450px;
}

@media screen and (min-width: 1000px) {
  .course-name {
    font-weight: bold;
    font-size: 22px;
    padding-left: 10px;
    width: 750px;
    white-space: normal;
    word-break: break-all;
    overflow: hidden;
  }
  .course-card {
    width: 800px;
    padding: 15px;
    display: flex;
    flex-direction: column;
  }
}

@media screen and (max-width: 1000px) {
  .course-card {
    width: 100vw;
    padding: 1vw;
    display: flex;
    flex-direction: column;
  }
  .course-name {
    font-size: 20px;
    font-weight: bold;
    padding-left: 10px;
    width: 85vw;
    white-space: normal;
    word-break: break-all;
    overflow: hidden;
  }
  .visualize-score-card {
    margin-top: 10px;
    width: 98vw;
    display: flex;
    flex-direction: row;
    background-color: var(--theme-color-transparent);
    border-radius: 10px;
  }
  .base-score-text {
    font-size: 18px;
    color: grey;
  }
  .actual-score-text {
    font-size: 28px;
    color: var(--theme-color);
  }
  .score-num-text {
    margin-top: 5px;
    color: grey;
    font-size: 14px;
  }
  .linear-bar-container {
    align-items: center;
    width: 55vw;
    display: flex;
    flex-direction: row;
  }
  .bar-left-container {
    width: 45vw;
    height: 216px;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
  }
  .linear-bar {
    width: 45vw;
  }
}
</style>

