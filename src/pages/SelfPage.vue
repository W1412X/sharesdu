<template>
  <div class="full-center">
    <v-navigation-drawer v-if="deviceType==='desktop'" v-model="drawer" :rail="rail" permanent @click="rail = false">
      <v-list-item class="name" :prepend-avatar="user.avatar" :title="user.name" nav>
      </v-list-item>
      <v-divider></v-divider>
      <v-btn v-if="!rail" size="30" class="menu-btn" :icon="'mdi-chevron-left'"
        @click.stop="rail = !rail"></v-btn>
      <v-list density="compact" nav :color="themeColor">
        <v-list-item @click="choose='write'" prepend-icon="mdi-pencil" title="创作" value="write"></v-list-item>
        <v-list-item @click="choose='star'" prepend-icon="mdi-star" title="收藏" value="star"></v-list-item>
        <v-list-item @click="choose='follow'" prepend-icon="mdi-account-plus" title="关注" value="follow"></v-list-item>
        <v-list-item @click="choose='message'" prepend-icon="mdi-email" title="信息" value="message"></v-list-item>
        <v-list-item @click="choose='account'" prepend-icon="mdi-account" title="账户" value="account"></v-list-item>
        <v-list-item @click="choose='setting'" prepend-icon="mdi-cog" title="设置" value="setting"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer v-if="deviceType==='mobile'&&navVisible" v-model="drawer" :rail='false' permanent @click="rail = false">
      <v-list-item class="name" :prepend-avatar="user.avatar" :title="user.name" nav>
      </v-list-item>
      <v-divider></v-divider>
      <v-btn size="30" class="menu-btn" :icon="navVisible? 'mdi-chevron-left':'mdi-chevron-right'"
        @click="navVisible=!navVisible"></v-btn>
      <v-list density="compact" nav :color="themeColor">
        <v-list-item @click="choose='write'" prepend-icon="mdi-pencil" title="创作" value="write"></v-list-item>
        <v-list-item @click="choose='star'" prepend-icon="mdi-star" title="收藏" value="star"></v-list-item>
        <v-list-item @click="choose='follow'" prepend-icon="mdi-account-plus" title="关注" value="follow"></v-list-item>
        <v-list-item @click="choose='message'" prepend-icon="mdi-email" title="信息" value="message"></v-list-item>
        <v-list-item @click="choose='account'" prepend-icon="mdi-account" title="账户" value="account"></v-list-item>
        <v-list-item @click="choose='setting'" prepend-icon="mdi-cog" title="设置" value="setting"></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-btn size="30" class="mobile-menu-btn" :icon="'mdi-chevron-right'"
      @click="navVisible=true"></v-btn>
    <div class="view-container">
      <!-- write part -->
      <div v-if="choose === 'write'">
        <v-tabs v-model="selfItemType" fixed-tabs class="select-bar">
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.selfItemType == 'article' ? '#000000' : '#8a8a8a' }"
            height="40px" value="article" text="文章"></v-tab>
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.selfItemType == 'post' ? '#000000' : '#8a8a8a' }"
            height="40px" value="post" text="帖子"></v-tab>
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.selfItemType == 'course' ? '#000000' : '#8a8a8a' }"
            height="40px" value="course" text="课程"></v-tab>
        </v-tabs>
        <div v-if="selfItemType == 'article'" class="item-container">
          <article-item v-for="(item, index) in this.selfArticleList" :key="index" :init-data="item">
          </article-item>
          <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
        </div>
        <div v-if="selfItemType == 'post'" class="item-container">
          <post-item v-for="(item, index) in this.selfPostList" :key="index" :init-data="item">
          </post-item>
          <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
        </div>
        <div v-if="selfItemType == 'course'" class="item-container">
          <course-item v-for="(item, index) in this.selfCourseList" :key="index" :init-data="item">
          </course-item>
          <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
        </div>
      </div>
      <!-- star part -->
      <div v-if="choose === 'star'">
        <v-tabs v-model="starItemType" fixed-tabs class="select-bar">
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.starItemType == 'article' ? '#000000' : '#8a8a8a' }"
            height="40px" value="article" text="文章"></v-tab>
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.starItemType == 'post' ? '#000000' : '#8a8a8a' }"
            height="40px" value="post" text="帖子"></v-tab>
          <v-tab class="tab"
            :style="{ background: 'rgba(255,255,255,1)', 'color': this.starItemType == 'course' ? '#000000' : '#8a8a8a' }"
            height="40px" value="course" text="课程"></v-tab>
        </v-tabs>
        <div v-if="starItemType == 'article'" class="item-container">
          <article-item v-for="(item, index) in this.starArticleList" :key="index" :init-data="item">
          </article-item>
          <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
        </div>
        <div v-if="starItemType == 'post'" class="item-container">
          <post-item v-for="(item, index) in this.starPostList" :key="index" :init-data="item">
          </post-item>
          <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
        </div>
        <div v-if="starItemType == 'course'" class="item-container">
          <course-item v-for="(item, index) in this.starPostList" :key="index" :init-data="item">
          </course-item>
          <v-btn variant="tonal" class="load-btn">加载更多</v-btn>
        </div>
      </div>
      <!-- follow part  -->
      <div v-if="choose === 'follow'">
        <div v-for="(item, index) in followList" :key="index" class="follow-bar">
          <avatar-name :init-data="{name:item.name,avatar:item.avatar}"></avatar-name>
          <v-spacer></v-spacer>
          <v-btn @click="follow(item.name,index)" variant="tonal" :color="followStateList[index]?'grey':themeColor" rounded>
            {{ followStateList[index] ? '已关注' : '关注' }}
          </v-btn>
        </div>
      </div>
      <!-- message part  -->
      <div v-if="choose === 'message'">
        <div v-for="(item, index) in this.messageList" :key="index" class="message-bar">
          <avatar-name :init-data="{name:item.name,avatar:item.avatar}"></avatar-name>
          <div class="text-medium message-text">{{ item.message }}</div>
          <div class="text-small message-time">{{ item.time }}</div>
        </div>
      </div>
      <!-- account part  -->
      <div v-if="choose === 'account'">
        <user-message-editor-card></user-message-editor-card>
      </div>
      <!-- setting part -->
      <div v-if="choose === 'setting'">
        <div class="column-list">
          <v-btn to="/document/to_know" prepend-icon="mdi-bulletin-board" color="grey" variant="outlined" text="入站须知"></v-btn>
          <v-btn to="/document/about_us" prepend-icon="mdi-information-variant" color="grey" variant="outlined" text="关于我们"></v-btn>
          <v-btn prepend-icon="mdi-account-cancel" color="grey" variant="outlined" text="黑名单"></v-btn>
          <v-btn prepend-icon="mdi-delete-outline" color="grey" variant="outlined" text="注销账号"></v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ArticleItem from '@/components/ArticleItem.vue';
import AvatarName from '@/components/AvatarName.vue';
import CourseItem from '@/components/CourseItem.vue';
import PostItem from '@/components/PostItem.vue';
import UserMessageEditorCard from '@/components/UserMessageEditorCard.vue';
import { globalProperties } from '@/main';
import { articleItemLong, courseItemLong, messageData, postItemLong, userData } from '@/utils/data';
import { ref } from 'vue'
export default {
  name: 'SelfPage',
  setup() {
    var drawer = ref(true);
    var choose=ref('write');
    const rail = ref(true);
    const deviceType = globalProperties.$deviceType;
    const themeColor = globalProperties.$themeColor;
    const navVisible=ref(false);
    const selfItemType = ref('article');
    const starItemType = ref('article');
    return {
      drawer,
      rail,
      deviceType,
      themeColor,
      selfItemType,
      starItemType,
      choose,
      navVisible,
    }
  },
  components: {
    ArticleItem,
    PostItem,
    CourseItem,
    AvatarName,
    UserMessageEditorCard,
  },
  data() {
    return {
      user: {},
      selfArticleList: [],
      selfPostList: [],
      selfCourseList: [],
      starArticleList: [],
      starPostList: [],
      starCourseList: [],
      followList:[],
      followStateList:[],
      messageList:[],
    }
  },
  methods: {
    test(){
      console.log(this.drawer);
    },
    follow(name,index){
      this.followStateList[index]=!this.followStateList[index];
    }
  },
  mounted() {
    /**
     * test
     */
    this.user = userData;
    for (let i = 0; i < 10; i++) {
      this.selfArticleList.push(articleItemLong);
      this.selfPostList.push(postItemLong);
      this.selfCourseList.push(courseItemLong);
      this.starArticleList.push(articleItemLong);
      this.starPostList.push(postItemLong);
      this.starCourseList.push(courseItemLong);
      this.followList.push(userData);
      this.followStateList.push(true);
      this.messageList.push(messageData);
    }
  }
}
</script>
<style scoped>
.name {
  color: var(--theme-color);
  margin-left: 8px;
}
.load-btn{
    height: 30px;
    width: 100%;
    margin-top: 5px;
}
.menu-btn {
  position: fixed;
  bottom: 50%;
  right: -15px;
  z-index: 100;
}
.mobile-menu-btn{
  position: fixed;
  bottom: 50%;
  left: 0px;
  z-index: 100;
}
.follow-bar{
  padding: 10px;
  display: flex;
  flex-direction: row;
  border-radius: 5px;
  border: grey 1px solid;
}
.setting-btn{
  width: 100%;
}
@media screen and (min-width: 600px) {
  .full-center {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
  }

  .column-list {
    width: 750px;
    display: flex;
    flex-direction: column;
  }

  .view-container {
    width: 750px;
  }

  .select-bar {
    width: 750px;
    height: 40px;
  }
}

@media screen and (max-width: 600px) {
  .full-center {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
  }

  .column-list {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .view-container {
    width: 100vw;
  }
  .select-bar {
    width: 100vw;
    height: 40px;
  }
}
</style>