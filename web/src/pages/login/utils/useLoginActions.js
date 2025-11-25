/**
 * LoginPage 操作管理 Composable
 */
import { loginWithPassword } from '@/api/modules/account';
import { csLoginByUserName } from '@/api/modules/api_convert/account';
import { getNormalWarnAlert, openPage, setLogin } from '@/utils/other';
import { validateEmail, validatePassWord, validateUserName } from '@/utils/rules';
import { selfDefineLocalStorage } from '@/utils/localStorage';

export function useLoginActions(
  loginByUsernameData,
  loginByEmailData,
  registerByEmailData,
  registerByInviteData,
  loginMethod,
  registerMethod,
  registerByEmailStep,
  registerByInviteStep,
  loading,
  apiUrl,
  ifSavePasswd,
  setEmailExamineCardState,
  alertHandler
) {
  /**
   * 用户名登录
   */
  const loginByUsername = async () => {
    loading.value.login = true;
    const response = await loginWithPassword(csLoginByUserName(loginByUsernameData.value));
    loading.value.login = false;
    
    if (response.status === 200) {
      alertHandler({
        color: 'success',
        title: '登陆成功',
        state: true,
        content: response.message,
      });
      
      // 保存用户信息
      setLogin(
        response.user_name,
        response.user_id,
        response.email,
        response.refresh,
        apiUrl + '/image/user?user_id=' + response.user_id,
        response.is_master,
        response.is_super_master,
        ifSavePasswd.value ? loginByUsernameData.value.passwd : null
      );
      
      // 跳转页面
      if (selfDefineLocalStorage.getItem('lastHref')) {
        window.open(selfDefineLocalStorage.getItem('lastHref'), '_self');
        selfDefineLocalStorage.removeItem('lastHref');
      } else {
        openPage('router', {
          name: 'IndexPage',
        });
      }
    } else {
      alertHandler({
        color: 'error',
        title: '请求错误',
        state: true,
        content: response.message,
      });
    }
  };
  
  /**
   * 邮箱登录
   */
  const loginByEmail = () => {
    setEmailExamineCardState(true);
  };
  
  /**
   * 邮箱注册
   */
  const registerByEmail = () => {
    setEmailExamineCardState(true);
  };
  
  /**
   * 邀请码注册
   */
  const registerByInvite = () => {
    setEmailExamineCardState(true);
  };
  
  /**
   * 下一步
   */
  const step = () => {
    if (registerMethod.value === 'email') {
      if (registerByEmailData.value.passwd !== registerByEmailData.value.passwdConfirm) {
        alertHandler(getNormalWarnAlert('两次密码输入不一致'));
        return;
      }
      registerByEmailStep.value++;
    } else {
      if (registerByInviteData.value.passwd !== registerByInviteData.value.passwdConfirm) {
        alertHandler(getNormalWarnAlert('两次密码输入不一致'));
        return;
      }
      registerByInviteStep.value++;
    }
  };
  
  /**
   * 上一步
   */
  const stepBack = () => {
    if (registerMethod.value === 'email') {
      registerByEmailStep.value--;
    } else {
      registerByInviteStep.value--;
    }
  };
  
  /**
   * 验证邮箱
   */
  const valEmail = (email) => {
    return validateEmail(email);
  };
  
  /**
   * 验证用户名
   */
  const valUserName = (name) => {
    return validateUserName(name);
  };
  
  /**
   * 验证密码
   */
  const valPassWord = (passWord) => {
    return validatePassWord(passWord);
  };
  
  /**
   * 跳转URL
   */
  const toUrl = (url) => {
    openPage('url', { url: url });
  };
  
  return {
    loginByUsername,
    loginByEmail,
    registerByEmail,
    registerByInvite,
    step,
    stepBack,
    valEmail,
    valUserName,
    valPassWord,
    toUrl,
  };
}

