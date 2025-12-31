/**
 * ManagePage 数据管理 Composable
 */
import { ref } from 'vue';

export function useManageData() {
  // 对象管理数据
  const itemType = ref(null); // 'article' | 'user' | 'course'
  const itemId = ref(null);
  const blockDays = ref(0);
  const blockReason = ref('');
  
  // 用户列表数据
  const userList = ref([]);
  const userPageNum = ref(1);
  const maxUserPageNum = ref(null);
  const totalUserNum = ref(null);
  const userPageSize = ref(20); // 每页加载数量，默认20
  
  // 封禁用户列表数据
  const blockUserList = ref([]);
  const blockUserPageNum = ref(1);
  
  // 对话框数据
  const nowShowUrl = ref(null);
  
  // 板块列表数据
  const sectionList = ref([]);
  
  /**
   * 添加用户到列表
   * @param {Array} users - 用户数组
   */
  const addUsers = (users) => {
    userList.value.push(...users);
  };
  
  /**
   * 添加封禁用户到列表
   * @param {Array} users - 封禁用户数组
   */
  const addBlockUsers = (users) => {
    blockUserList.value.push(...users);
  };
  
  /**
   * 在封禁列表开头添加用户
   * @param {Object} user - 用户对象
   */
  const unshiftBlockUser = (user) => {
    blockUserList.value.unshift(user);
  };
  
  /**
   * 重置用户列表
   */
  const resetUserList = () => {
    userList.value = [];
    userPageNum.value = 1;
    maxUserPageNum.value = null;
    totalUserNum.value = null;
  };
  
  /**
   * 重置封禁用户列表
   */
  const resetBlockUserList = () => {
    blockUserList.value = [];
    blockUserPageNum.value = 1;
  };
  
  /**
   * 设置板块列表
   * @param {Array} sections - 板块数组
   */
  const setSectionList = (sections) => {
    sectionList.value = sections;
  };
  
  return {
    itemType,
    itemId,
    blockDays,
    blockReason,
    userList,
    userPageNum,
    maxUserPageNum,
    totalUserNum,
    userPageSize,
    blockUserList,
    blockUserPageNum,
    nowShowUrl,
    sectionList,
    addUsers,
    addBlockUsers,
    unshiftBlockUser,
    resetUserList,
    resetBlockUserList,
    setSectionList,
  };
}

