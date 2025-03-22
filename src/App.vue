<!-- src/App.vue -->
<template>
      <v-dialog v-if="ifShowDialog" v-model="ifShowDialog" class="full-screen dialog">
        <div class="dialog-card-container">
          <history-card v-if="ifShowHistory" @close="closeDialog"></history-card>
        </div>
    </v-dialog>
  <v-app style="display: flex;">
    <!--
    <div v-if="deviceType === 'mobile'" class="nav-bar">
      <v-btn rounded="0" variant="text" color="#ffffff" icon="mdi-menu"></v-btn>
    </div>
    -->
    <loading-view :init-data="loadMsg" class="z-index-loading absolute-position">
    </loading-view>
    <v-snackbar class="z-index-msg absolute-position" :timeout="3000" :color="alertMsg.color" v-model="alertMsg.state">
      <div v-if="alertMsg.title" class="title">{{ alertMsg.title }}</div>
      <p v-if="alertMsg.content" class="text-medium">{{ alertMsg.content }}</p>
    </v-snackbar>
    <div v-if="this.ifShowNav" class="nav-bar" :style="{'background-color':navColor}">
      <avatar-name v-if="ifShowAvatar" :init-data="{id:userId,name:userName}" :color="'#ffffff'"></avatar-name>
      <v-spacer></v-spacer>
      <sensitive-text-field :color="navIconColor" v-model="searchContent" density="compact" label="搜索文章/帖子/课程" :items="['平台使用说明']"
        variant="outlined">
      </sensitive-text-field>
      <div class="search-btn-container">
        <v-btn @click="search" icon="mdi-magnify" variant="text" :color="navIconColor" size="40"></v-btn>
      </div>
      <v-spacer></v-spacer>
      <v-btn @click="setShowHistoryState(true)" style="margin-top: 2px;" icon="mdi-history" variant="text" :color="navIconColor"
        size="40"></v-btn>
      <v-btn @click="toHomePage" style="margin-top: 2px;"  icon="mdi-home" variant="text" :color="navIconColor"
        size="40"></v-btn>
    </div>
    <div :style="{'width':'100vw','max-width':'100vw','margin-top':routerMarginTop}">
      <router-view class="router-view" @alert="alert" @set_loading="setLoading" />
    </div>
  </v-app>
</template>
<script>
import { computed, ref, watch } from 'vue';
import LoadingView from './components/LoadingView.vue';
import { useRoute } from 'vue-router';
import { globalProperties } from './main';
import AvatarName from './components/AvatarName.vue';
import { getCookie } from './utils/cookie';
import { getNormalInfoAlert } from './utils/other';
import HistoryCard from './components/HistoryCard.vue';
import SensitiveTextField from './components/SensitiveTextField.vue';
export default {
  setup() {
    /**
     * get the device type
     */
    const deviceType = ref('');
    if (window.innerWidth <= 600) {
      deviceType.value = 'mobile';
    } else {
      deviceType.value = 'desktop';
    }
    //listen the route change
    const route = useRoute(); 
    const page=ref('');
    // eslint-disable-next-line
    const themeColor=globalProperties.$themeColor;
    const loadState=ref(false);
    const setLoadState=(state)=>{
      loadState.value=state;
    }
    // eslint-disable-next-line
    watch(route, (newRoute, oldRoute) => {
      console.log(newRoute.name);
      page.value=newRoute.name;
    });
    const ifShowNav=computed(()=>{
      if(loadState.value&&['WelcomePage','IndexPage','LoginPage','DocumentPage','ManagePage',undefined,null].includes(page.value)){
        return false;
      }else{
        return true;
      }
    })
    const navColor=computed(()=>{
      if(page.value=="SelfPage"){
        return '#ffffff';
      }else{
        return themeColor;
      }
    })
    const routerMarginTop=computed(()=>{
      if(ifShowNav.value){
        return '55px';
      }else{
        return '0px';
      }
    })
    const navIconColor=computed(()=>{
      if(page.value=="SelfPage"){
        return themeColor;
      }else{
        return "#ffffff";
      }
    });
    const ifShowAvatar=computed(()=>{
      if(page.value=="SelfPage"){
        return false;
      }else{
        return true;  
      }
    })
    const userId=getCookie("userId");
    const userName=getCookie("userName");
    const ifShowHistory=ref(false);
    const ifShowDialog=computed(()=>{
      return ifShowHistory.value;
    })
    const setShowHistoryState=(state)=>{
      ifShowHistory.value=state;
    }
    return {
      deviceType,
      ifShowNav,
      navColor,
      navIconColor,
      userId,
      userName,
      routerMarginTop,
      ifShowDialog,
      ifShowHistory,
      setShowHistoryState,
      ifShowAvatar,
      setLoadState,
    }
  },
  components:{
    LoadingView,
    AvatarName,
    HistoryCard,
    SensitiveTextField,
  },
  data() {
    return {
      alertMsg: {
        state: false,
        color: null,
        title: null,
        content: null,
      },
      loadMsg: {
        state: false,
        text: '加载中...',
        progress: -1,
      },
      searchContent:"",
    }
  },
  methods: {
    alert(msg) {
      this.alertMsg = msg;
    },
    setLoading(msg){
      this.loadMsg=msg;
    },
    search(){
      this.alert(getNormalInfoAlert("功能未开放..."));
    },
    toHomePage(){
      this.$router.push({
        name: 'IndexPage',
      })
    },
    closeDialog(){
      this.setShowHistoryState(false);
    }
  },
  created(){
  },
  mounted() {

    this.setLoadState(true);

  }
};
</script>
<style scoped>
.dialog-card-container {
        display: flex;
        justify-content: center;
}
.column-scroll-div-card{
  padding: 10px;
  max-width: 550px;
  flex-direction: column;
  display: flex;
  overflow-y: scroll;
  max-height: 500px;
}
/** desktop */
@media screen and (min-width: 600px) {
  .nav-bar {
        z-index: 99;
        position: fixed;
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
        padding: 5px;
        max-height: 55px;
        background-color: var(--theme-color);
  }

  .router-view {
    width: 100vw;
    max-width: 100vw;
  }
}

/** mobile */
@media screen and (max-width: 600px) {
  .nav-bar {
    z-index: 99;
        position: fixed;
        width: 100vw;
        height: fit-content;
        display: flex;
        flex-direction: row;
        padding: 5px;
        max-height: 55px;
        background-color: var(--theme-color);
  }

  .transparent-btn {
    background-color: transparent;
  }

  .router-view {
    width: 100vw;
    max-width: 100vw;
  }
  .absolute-position{
    position: absolute;
  }
}
</style>
