/**
 * ManagePage 操作管理 Composable
 */
import { freezeUnfreezeCourse } from '@/api/modules/course';
import { blockArticle, blockUser, getBlockedUserList, getUserList, unblockArticle, unblockUser } from '@/api/modules/manage';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert, getNormalInfoAlert, getNormalSuccessAlert, getNormalWarnAlert } from '@/utils/other';

export function useManageActions(
  itemType,
  itemId,
  blockDays,
  blockReason,
  userList,
  userPageNum,
  maxUserPageNum,
  totalUserNum,
  blockUserList,
  blockUserPageNum,
  nowShowUrl,
  addUsers,
  addBlockUsers,
  unshiftBlockUser,
  setWebCardState,
  setCourseHistoryState,
  setLoading,
  alertHandler
) {
  /**
   * 显示确认对话框
   */
  const showConfirm = () => {
    if (itemType.value === 'article') {
      nowShowUrl.value = `#/article/${itemId.value}`;
      setWebCardState(true);
    } else if (itemType.value === 'user') {
      nowShowUrl.value = `#/author/${itemId.value}`;
      setWebCardState(true);
    } else if (itemType.value === 'course') {
      nowShowUrl.value = `#/course/${itemId.value}`;
      setWebCardState(true);
    }
  };
  
  /**
   * 封禁操作
   */
  const block = async () => {
    if (itemType.value === 'user') {
      setLoading(getLoadMsg('正在封禁...'));
      const response = await blockUser(itemId.value, blockDays.value);
      setLoading(getCancelLoadMsg());
      
      if (response.status === 200) {
        alertHandler(getNormalSuccessAlert('封禁成功'));
        setWebCardState(false);
        unshiftBlockUser({
          id: itemId.value,
          blockEndTime: new Date(new Date().getTime() + blockDays.value * 24 * 60 * 60 * 1000).toLocaleString(),
        });
      } else {
        alertHandler(getNormalErrorAlert('封禁失败'));
      }
    } else if (itemType.value === 'article') {
      setLoading(getLoadMsg('正在封禁...'));
      const response = await blockArticle(itemId.value, blockReason.value);
      setLoading(getCancelLoadMsg());
      
      if (response.status === 200) {
        alertHandler(getNormalSuccessAlert('封禁成功'));
        setWebCardState(false);
      } else {
        alertHandler(getNormalErrorAlert('封禁失败'));
      }
    }
  };
  
  /**
   * 解封操作
   */
  const unblock = async () => {
    try {
      if (itemType.value === 'article') {
        setLoading(getLoadMsg('正在解封...'));
        const response = await unblockArticle(itemId.value, blockReason.value);
        setLoading(getCancelLoadMsg());
        
        if (response && response.status === 200) {
          alertHandler(getNormalSuccessAlert('解封成功'));
        } else {
          alertHandler(getNormalErrorAlert('解封失败'));
        }
      } else if (itemType.value === 'user') {
        setLoading(getLoadMsg('正在解封...'));
        const response = await unblockUser(itemId.value);
        setLoading(getCancelLoadMsg());
        
        if (response && response.status === 200) {
          alertHandler(getNormalSuccessAlert('解封成功'));
        } else {
          alertHandler(getNormalErrorAlert('解封失败'));
        }
      }
    } catch (error) {
      setLoading(getCancelLoadMsg());
      alertHandler(getNormalErrorAlert('解封失败'));
    }
  };
  
  /**
   * 冻结课程
   */
  const freeze = async () => {
    if (itemId.value) {
      setLoading(getLoadMsg('正在冻结...'));
      const response = await freezeUnfreezeCourse(itemId.value, 'freeze');
      setLoading(getCancelLoadMsg());
      
      if (response.status === 200) {
        alertHandler(getNormalSuccessAlert('已冻结课程'));
      } else {
        alertHandler(getNormalErrorAlert(response.message));
      }
    } else {
      alertHandler(getNormalWarnAlert('请设置课程ID'));
    }
  };
  
  /**
   * 解冻课程
   */
  const unfreeze = async () => {
    if (itemId.value) {
      setLoading(getLoadMsg('正在解冻...'));
      const response = await freezeUnfreezeCourse(itemId.value, 'unfreeze');
      setLoading(getCancelLoadMsg());
      
      if (response.status === 200) {
        alertHandler(getNormalSuccessAlert('已解冻课程'));
      } else {
        alertHandler(getNormalErrorAlert(response.message));
      }
    } else {
      alertHandler(getNormalWarnAlert('请设置课程ID'));
    }
  };
  
  /**
   * 确认操作
   */
  const confirm = async () => {
    if (itemType.value === 'article' || itemType.value === 'user') {
      await block();
    } else if (itemType.value === 'course') {
      await freeze();
    }
  };
  
  /**
   * 回滚课程
   */
  const rollback = () => {
    if (itemId.value) {
      setCourseHistoryState(true);
    } else {
      alertHandler(getNormalWarnAlert('请设置课程ID'));
    }
  };
  
  /**
   * 加载用户列表
   */
  const loadUser = async () => {
    if (maxUserPageNum.value && userPageNum.value > maxUserPageNum.value) {
      alertHandler(getNormalInfoAlert('无更多用户'));
      return;
    }
    
    setLoading(getLoadMsg('正在加载用户列表...'));
    const response = await getUserList(userPageNum.value);
    setLoading(getCancelLoadMsg());
    
    if (response.status === 200 || response.status === 201) {
      const users = response.user_list.map((user) => ({
        ID: user.user_id,
        用户: user.user_name,
        荣誉水平: user.reputation_level,
        点赞数: user.all_likes,
        文章数: user.all_articles,
        是否为管理员: user.master,
        是否为超级管理员: user.super_master,
      }));
      
      addUsers(users);
      maxUserPageNum.value = response.pagination.total_pages;
      userPageNum.value++;
      totalUserNum.value = response.pagination.total_items;
    }
  };
  
  /**
   * 加载封禁用户列表
   */
  const loadBlockUser = async () => {
    if (blockUserList.value.length > 0) {
      alertHandler(getNormalInfoAlert('没有更多封禁信息用户了'));
      return;
    }
    
    setLoading(getLoadMsg('正在加载封禁用户列表...'));
    const response = await getBlockedUserList(blockUserPageNum.value);
    setLoading(getCancelLoadMsg());
    
    if (response.user_list && response.user_list.length > 0) {
      const users = response.user_list.map((user) => ({
        id: user.user_id,
        username: user.user_name,
        blockEndTime: user.block_end_time,
        operator: user.operator,
        blockReason: user.block_reason,
        endTime: user.block_end_time,
      }));
      
      addBlockUsers(users);
      blockUserPageNum.value++;
    } else {
      alertHandler(getNormalErrorAlert('无更多封禁用户'));
    }
  };
  
  return {
    showConfirm,
    block,
    unblock,
    freeze,
    unfreeze,
    confirm,
    rollback,
    loadUser,
    loadBlockUser,
  };
}

