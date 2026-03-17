/**
 * 认证相关工具函数
 * 刷新与重试由 api/request.js 响应拦截器 + refreshAccessToken 统一处理，此处仅提供 setLogin、登出、错误标准化。
 */

import { getAccessToken } from "@/api/modules/token";
import { clearTokenCookies, getCookie, setCookie } from "./cookie";
import { globalProperties } from "@/main";
import { acquireLock, releaseLock } from "./lock";
import { selfDefineLocalStorage } from "./localStorage";
import { openPage } from "./navigation";

/** 是否已触发登出，避免多处同时调用时重复弹窗和跳转 */
let logoutTriggered = false;

/**
 * 设置登录信息
 */
export function setLogin(userName, user_id, email, refresh, profile, ifMaster = false, ifSuperMaster = false, passwd = null) {
    setCookie('userName', userName, 7 * 24);
    setCookie('userId', user_id, 7 * 24);
    setCookie('email', email, 7 * 24);
    setCookie('refreshToken', refresh, 7 * 24);
    setCookie('userProfileUrl', profile, 7 * 24);
    if (ifMaster) setCookie('ifMaster', ifMaster, 7 * 24);
    if (ifSuperMaster) setCookie('ifSuperMaster', ifSuperMaster, 7 * 24);
    if (passwd) {
        selfDefineLocalStorage.setItem('passwd', passwd);
        selfDefineLocalStorage.setItem('userName', userName);
    }
}

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
 * 仅触发一次登出
 */
function triggerLogoutOnce(message = "令牌已过期，请重新登录") {
    if (logoutTriggered) return { status: -1, message };
    logoutTriggered = true;
    handleLogout();
    return { status: -1, message };
}

/**
 * 供响应拦截器使用：执行一次刷新或自动登录，成功返回新 access token，失败则 triggerLogoutOnce 并 throw。
 */
export async function refreshAccessToken() {
    await acquireLock('token');
    try {
        const { loginWithPassword } = await import('@/api/modules/account');
        const refreshToken = getCookie("refreshToken");
        if (refreshToken) {
            try {
                const response = await getAccessToken(refreshToken);
                if (response.status === 999) {
                    setCookie("accessToken", response.access, 5);
                    return getCookie("accessToken");
                }
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
                        return getCookie("accessToken");
                    }
                    clearTokenCookies();
                    if (!logoutTriggered) {
                        logoutTriggered = true;
                        window.alert("自动登录失败，跳转至登陆页");
                        setTimeout(() => {
                            selfDefineLocalStorage.setItem('lastHref', window.location.href);
                            window.open(`/#/login?name=${getCookie('userName')}&passwd=${getCookie('passwd')}`, "_self");
                            location.reload();
                        }, 500);
                    }
                    const result = { status: -1, message: "自动登陆失败，请手动登陆" };
                    const err = new Error(result.message);
                    err.response = { data: result };
                    throw err;
                }
                const result = triggerLogoutOnce("令牌已过期，请重新登录");
                const err = new Error(result.message);
                err.response = { data: result };
                throw err;
            } catch (tokenRefreshError) {
                if (tokenRefreshError.response) throw tokenRefreshError;
                const result = triggerLogoutOnce("重新登陆，令牌无效");
                const err = new Error(result.message);
                err.response = { data: result };
                throw err;
            }
        }
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
                return getCookie("accessToken");
            }
            clearTokenCookies();
            if (!logoutTriggered) {
                logoutTriggered = true;
                window.alert("自动登录失败，跳转至登陆页");
                setTimeout(() => {
                    selfDefineLocalStorage.setItem('lastHref', window.location.href);
                    window.open(`/#/login?name=${getCookie('userName')}&passwd=${getCookie('passwd')}`, "_self");
                    location.reload();
                }, 500);
            }
            const result = { status: -1, message: "自动登陆失败，请手动登陆" };
            const err = new Error(result.message);
            err.response = { data: result };
            throw err;
        }
        const result = triggerLogoutOnce("令牌已过期，请重新登录");
        const err = new Error(result.message);
        err.response = { data: result };
        throw err;
    } catch (e) {
        if (e.response) throw e;
        const result = triggerLogoutOnce("重新登陆");
        const err = new Error(result.message);
        err.response = { data: result };
        throw err;
    } finally {
        releaseLock('token');
    }
}

/**
 * 将 Axios 错误标准化为 { status, message, ... }，供业务层统一处理。
 * 1000/1001 由响应拦截器处理并重试，此处仅做透传或兜底。
 */
export function dealAxiosError(error) {
    if (error.response && error.response.data) {
        return error.response.data;
    }
    if (error.request) {
        return { status: -1, message: "服务器无响应，请联系管理员" };
    }
    return triggerLogoutOnce("重新登陆");
}
