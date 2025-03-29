// src/store/index.js
import { createStore } from 'vuex';
import { setCookie,getCookie, clearCookie } from '@/utils/cookie';//cookie服务
const store=createStore({
  state() {//状态存储
    return{
      user: null,
      cookie: getCookie('cookie'),
      ifRegisterEditor:false,//全局记录是否注册formula
    }
  },
  getters: {//计算逻辑
    isLoggedIn: (state) => !!state.cookie,
    ifRegisterEditor:(state) => state.ifRegisterEditor,
  },
  mutations: {//修改state的唯一路径，定义所有修改用户状态的方法
    setUser(state, user) {
      state.user = user;
    },
    setcookie(state, cookie) {
      state.cookie = cookie;
      setCookie('cookie',cookie,1);
    },
    clearUser(state) {
      state.user = null
      state.cookie = null;
      clearCookie('cookie');
      clearCookie('user_id');
    },
    registerEditor(state){
      state.ifRegisterEditor=true;
    }
  },
  actions: {//处理异步操作的集合
    storeLogin({ commit }, IdCookie) {
        commit('setUser',IdCookie.id);
        commit('setcookie',IdCookie.cookie);
    },
    storeLogout({ commit }) {
      commit('clearUser')
    }
  }
});
export default store;
