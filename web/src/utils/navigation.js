/**
 * 导航相关工具函数
 */

import { getDeviceTypeByAgent } from "./device";
import router from "@/router";

/**
 * 检查 URL 是否为调试路径
 * @param {String} url 
 * @returns {Boolean}
 */
export function isDebugHashPath(url) {
    if (url.startsWith('#')) {
        return url.startsWith('#/debug/');
    }
    try {
        const hashStartIndex = url.indexOf('#');
        if (hashStartIndex === -1) return false;

        const hash = url.slice(hashStartIndex);
        return hash.startsWith('#/debug/');
    } catch (e) {
        return false;
    }
}

/**
 * 给一个 URL 或 hash 添加 /debug/ 前缀到 hash 路径中
 * @param {String} urlOrHash - 完整 URL 或 hash 片段
 * @returns {String} 新的 URL 或 hash
 */
export function addDebugToPath(urlOrHash) {
    if (urlOrHash.startsWith('#') && urlOrHash.length == 1) {
        urlOrHash = '#/'
    }
    if (urlOrHash.startsWith('#/')) {
        let newHash = '#/debug/' + urlOrHash.substring(2);
        return newHash;
    } else {
        let front = urlOrHash.substring(0, urlOrHash.indexOf('#'));
        let back = urlOrHash.substring(urlOrHash.indexOf('#') + 2);
        return front + '#/debug/' + back;
    }
}

/**
 * 打开页面
 * @param {string} type url/router 
 * @param {JSON} data if url -> {url:string} else {router obj}
 * @param {String} newTab 
 */
export function openPage(type, data, newTab = null) {
    let device = getDeviceTypeByAgent();
    let target = device == 'desktop' ? '_blank' : '_self';
    if (newTab != null) {
        target = newTab;
    }
    if (type === 'url') {
        //window.open(url, "_self");
        if(data.url.includes("article")||data.url.includes("post")||data.url.includes("course")||data.url.includes("search")){
            target = '_self';
        }
        if (isDebugHashPath(window.location.href)) {
            data.url = addDebugToPath(data.url);
        }
        if (device === "mobile") {
            window.open(data.url, target);
        } else {
            window.open(data.url, target);
        }
    } else if (type === 'router') {
        if(data.name.includes("ArticlePage")||data.name.includes("PostPage")||data.name.includes("CoursePage")||data.name.includes("SearchPage")){
            target = '_self';
        }
        if (isDebugHashPath(window.location.href)) {
            if (data.name.endsWith("Debug")) {
                //eslint-disable-next-line
            } else {
                data.name = data.name + "Debug";
            }
        }
        router.push(data);
    }
}

