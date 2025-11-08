/**
 * 认证相关工具函数
 */

import { getAccessToken } from "@/api/modules/token";
import { clearTokenCookies, getCookie, setCookie } from "./cookie";
import { globalProperties } from "@/main";
import { acquireLock, releaseLock } from "./lock";
import { loginWithPassword } from "@/api/modules/account";
import { selfDefineLocalStorage } from "./localStorage";
import { openPage } from "./navigation";

/**
 * 设置登录信息
 * @param {String} userName 
 * @param {String} user_id 
 * @param {String} email 
 * @param {String} refresh 
 * @param {String} profile 
 * @param {Boolean} ifMaster 
 * @param {Boolean} ifSuperMaster 
 * @param {String} passwd 
 */
export function setLogin(userName, user_id, email, refresh, profile, ifMaster = false, ifSuperMaster = false, passwd = null) {
    setCookie('userName', userName, 7 * 24);
    setCookie('userId', user_id, 7 * 24);
    setCookie('email', email, 7 * 24);
    setCookie('refreshToken', refresh, 7 * 24);
    setCookie('userProfileUrl', profile, 7 * 24);
    if (ifMaster) {
        setCookie('ifMaster', ifMaster, 7 * 24);
    }
    if (ifSuperMaster) {
        setCookie('ifSuperMaster', ifSuperMaster, 7 * 24);
    }
    if (passwd) {
        selfDefineLocalStorage.setItem('passwd', passwd);
        selfDefineLocalStorage.setItem('userName', userName);
    }
}

/**
 * 封装统一登出逻辑
 */
function handleLogout() {
    clearTokenCookies();
    sessionStorage.clear();
    window.alert("令牌已过期，请重新登录");
    selfDefineLocalStorage.setItem("lastHref", window.location.href);
    setTimeout(() => {
        openPage("url", { url: "#/login" }, "_self");
        location.reload();
    }, 1000);
}

/**
 * 处理 Axios 错误
 * @param {Error} error 
 * @returns {Promise<Object>} 处理后的错误对象
 */
export async function dealAxiosError(error) {
    let result = null;

    try {
        await acquireLock('token')
        // 判断是否有响应数据
        if (error.response && error.response.data) {
            const { data } = error.response;
            const { status: errStatus } = data;

            // 判断是否是 token 失效相关错误
            if (errStatus === 1000 || errStatus === 1001) {
                const refreshToken = getCookie("refreshToken");

                // 如果存在 refreshToken
                if (refreshToken) {
                    try {
                        const response = await getAccessToken(refreshToken);

                        if (response.status === 999) {
                            setCookie("accessToken", response.access, 5);
                            result = {
                                status: 1412,
                                message: "已更新access token，重新请求"
                            };
                        } else {
                            if (selfDefineLocalStorage.getItem("passwd")) {
                                const loginResponse = await loginWithPassword({
                                    user_name: selfDefineLocalStorage.getItem("userName"),
                                    pass_word: selfDefineLocalStorage.getItem("passwd")
                                });

                                if (loginResponse.status === 200) {
                                    setLogin(
                                        loginResponse.user_name,
                                        loginResponse.user_id,
                                        loginResponse.email,
                                        loginResponse.refresh,
                                        globalProperties.$apiUrl + "/image/user?user_id=" + loginResponse.user_id,
                                        loginResponse.is_master,
                                        loginResponse.is_super_master,
                                        selfDefineLocalStorage.getItem("passwd")
                                    );
                                    result = {
                                        status: 1412,
                                        message: "已更新access token，重新请求"
                                    };
                                } else {
                                    clearTokenCookies();
                                    window.alert("自动登录失败，跳转至登陆页");
                                    setTimeout(() => {
                                        selfDefineLocalStorage.setItem('lastHref', window.location.href);
                                        window.open(`/#/login?name=${getCookie('userName')}&passwd=${getCookie('passwd')}`, "_self");
                                        location.reload();
                                    }, 500);
                                    result = {
                                        status: -1,
                                        message: "自动登陆失败，请手动登陆"
                                    };
                                }
                            } else {
                                handleLogout();
                                result = {
                                    status: -1,
                                    message: "令牌已过期，请重新登录"
                                };
                            }
                        }
                    } catch (tokenRefreshError) {
                        handleLogout();
                        result = {
                            status: -1,
                            message: "重新登陆，令牌无效"
                        };
                    }

                } else {
                    if (selfDefineLocalStorage.getItem("passwd")) {
                        const loginResponse = await loginWithPassword({
                            user_name: selfDefineLocalStorage.getItem("userName"),
                            pass_word: selfDefineLocalStorage.getItem("passwd")
                        });

                        if (loginResponse.status === 200) {
                            setLogin(
                                loginResponse.user_name,
                                loginResponse.user_id,
                                loginResponse.email,
                                loginResponse.refresh,
                                globalProperties.$apiUrl + "/image/user?user_id=" + loginResponse.user_id,
                                loginResponse.is_master,
                                loginResponse.is_super_master,
                                selfDefineLocalStorage.getItem("passwd")
                            );
                            result = {
                                status: 1412,
                                message: "已更新access token，重新请求"
                            };
                        } else {
                            window.alert("自动登录失败，跳转至登陆页");
                            clearTokenCookies();
                            setTimeout(() => {
                                selfDefineLocalStorage.setItem('lastHref', window.location.href);
                                window.open(`/#/login?name=${getCookie('userName')}&passwd=${getCookie('passwd')}`, "_self");
                                location.reload();
                            }, 500);
                            result = {
                                status: -1,
                                message: "自动登陆失败，请手动登陆"
                            };
                        }
                    } else {
                        handleLogout();
                        result = {
                            status: -1,
                            message: "令牌已过期，请重新登录"
                        };
                    }
                }

            } else {
                result = error.response.data;
            }

        } else if (error.request) {
            result = {
                status: -1,
                message: "服务器无响应，请联系管理员"
            };

        } else {
            handleLogout();
            result = {
                status: -1,
                message: "重新登陆"
            };
        }

    } catch (err) {
        handleLogout();
        result = {
            status: -1,
            message: "重新登陆"
        };

    } finally {
        releaseLock('token')
    }

    return result;
}

