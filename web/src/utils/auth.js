/**
 * 认证相关工具函数
 * 刷新与重试由 api/request.js 响应拦截器 + refreshAccessToken 统一处理，此处仅提供 setLogin、登出、错误标准化。
 */

import { getAccessToken } from "@/api/modules/token";
import { clearTokenCookies, getCookie, setCookie } from "./cookie";
import { globalProperties } from "@/main";
import { acquireLock, releaseLock } from "./lock";
import { selfDefineLocalStorage } from "./localStorage";
import { isDebugHashPath, openPage } from "./navigation";
import router from "@/router";

/** 是否已触发登出，避免多处同时调用时重复弹窗和跳转 */
let logoutTriggered = false;

/** 是否已跳转封禁页，避免并发请求重复跳转 */
let bannedRedirectTriggered = false;

/** 封禁页读取的 sessionStorage 键（在 clear 之后写入，仅保留展示用字段） */
export const BANNED_PAGE_INFO_KEY = "bannedPageInfo";

const BAN_DETAIL_KEYS = ["message", "block_end_time", "block_reason", "block_status", "user_name", "user_id"];

/**
 * 从 1002 响应体中提取可展示字段（兼容顶层或 data 内嵌，与 API 文档中用户主页 block_* 字段一致）。
 */
export function extractBanPayload(raw) {
    if (!raw || typeof raw !== "object") return null;
    const nested = raw.data && typeof raw.data === "object" && !Array.isArray(raw.data) ? raw.data : {};
    const out = {};
    for (const key of BAN_DETAIL_KEYS) {
        const v = raw[key] !== undefined && raw[key] !== null && raw[key] !== ""
            ? raw[key]
            : nested[key];
        if (v !== undefined && v !== null && v !== "") {
            out[key] = v;
        }
    }
    return Object.keys(out).length ? out : null;
}

/**
 * 账户被封禁（API status=1002）时清理登录态并进入封禁说明页，仅生效一次。
 * @param {object|null} apiPayload 接口返回体（可选），用于展示 message / block_end_time 等
 */
export function redirectToBannedOnce(apiPayload = null) {
    if (bannedRedirectTriggered) return;
    bannedRedirectTriggered = true;
    clearTokenCookies();
    sessionStorage.clear();
    const details = extractBanPayload(apiPayload);
    if (details) {
        try {
            sessionStorage.setItem(BANNED_PAGE_INFO_KEY, JSON.stringify(details));
        } catch (e) {
            /* ignore */
        }
    }
    const name = isDebugHashPath(window.location.href) ? "BannedPageDebug" : "BannedPage";
    router.push({ name });
}

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
                if (response.status === 1002) {
                    redirectToBannedOnce(response);
                    const err = new Error("账户已被封禁");
                    err.response = { data: response };
                    throw err;
                }
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
