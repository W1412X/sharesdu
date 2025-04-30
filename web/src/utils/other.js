import { getAccessToken } from "@/axios/token";
import { clearTokenCookies, getCookie, setCookie } from "./cookie";
import { globalProperties } from "@/main";
import { setLock, waitForLock } from "./lock";
import { loginWithPassword } from "@/axios/account";
import { fetchImgAndDeal } from "./image";
//import { getDeviceType } from "./device";
/**
 * a deep copy function for json object
 * @param {json} json 
 * @returns 
 */
export function copy(json) {
    return JSON.parse(JSON.stringify(json));
}
/**
 * a method to change the loading view
 * @param {String} text load message
 * @param {int} progress always -1 if there's no progress requirement 
 * @returns 
 */
export function getLoadMsg(text, progress = -1) {
    return {
        state: true,
        text: text,
        progress: progress
    }
}
/**
 * cancel the loading view
 */
export function getCancelLoadMsg() {
    return {
        state: false,
        text: '加载中...',
        progress: -1
    }
}
/**
 * get the editor type from the content got from the server
 * @param {String} content 
 */
export function extractEditorType(content) {
    let editor = content.substring(0, 4);
    if (editor == "html") {
        return "html";
    } else {
        return "md";
    }
}
/**
 * add the editor type to the content and return the dealed content 
 * @param {String} content 
 * @param {String} editorType 
 * @returns 
 */
export function addEditorType(content, editorType) {
    return editorType + content;
}
export function getContentWithoutEditorType(content) {
    let editorType = extractEditorType(content);
    if (editorType == "html") {
        return content.substring(4);
    } else {
        return content.substring(2);
    }
}
export async function dealAxiosError(error) {

    let result = null;

    try {
        await waitForLock("token");
        setLock("token", true);

        // 打印原始错误信息
        console.group("🔍 原始错误数据");
        if (error.response) {
        } else {
        }
        console.groupEnd();

        // 判断是否有响应数据
        if (error.response && error.response.data) {
            const { data } = error.response;
            const { status: errStatus, message: errMsg } = data;


            // 判断是否是 token 失效相关错误
            if (errStatus === 1000 || errStatus === 1001) {

                const refreshToken = getCookie("refreshToken");
                const accessToken = getCookie("accessToken");


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
                            console.warn("❌ refreshToken 已过期或失效，尝试密码登录...");
                            if (getCookie("passwd")) {

                                const loginResponse = await loginWithPassword({
                                    user_name: getCookie("userName"),
                                    pass_word: getCookie("passwd")
                                });


                                if (loginResponse.status === 200) {
                                    setLogin(
                                        loginResponse.user_name,
                                        loginResponse.user_id,
                                        loginResponse.email,
                                        loginResponse.refresh,
                                        globalProperties.$apiUrl + "/image/user?user_id=" + loginResponse.user_id,
                                        getCookie("passwd")
                                    );
                                    result = {
                                        status: 1412,
                                        message: "已更新access token，重新请求"
                                    };
                                } else {
                                    handleLogout();
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
                        console.error("📛 刷新 token 或密码登录时发生异常:", tokenRefreshError);
                        handleLogout();
                        result = {
                            status: -1,
                            message: "重新登陆，令牌无效"
                        };
                    }

                    // 没有 refreshToken 的情况
                } else {
                    console.warn("📛 refreshToken 不存在，尝试检查是否保存了密码...");

                    if (getCookie("passwd")) {

                        const loginResponse = await loginWithPassword({
                            user_name: getCookie("userName"),
                            pass_word: getCookie("passwd")
                        });


                        if (loginResponse.status === 200) {
                            setLogin(
                                loginResponse.user_name,
                                loginResponse.user_id,
                                loginResponse.email,
                                loginResponse.refresh,
                                globalProperties.$apiUrl + "/image/user?user_id=" + loginResponse.user_id,
                                getCookie("passwd")
                            );
                            result = {
                                status: 1412,
                                message: "已更新access token，重新请求"
                            };
                        } else {
                            handleLogout();
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

                // 非 token 错误
            } else {
                result = error.response.data;
            }

            // 无响应的情况
        } else if (error.request) {
            console.warn("⚠️ 请求已发出但未收到响应，可能是网络问题");
            result = {
                status: -1,
                message: "服务器无响应，请联系管理员"
            };

            // 其它未知错误
        } else {
            console.error("💥 发生未知错误，准备登出用户");
            handleLogout();
            result = {
                status: -1,
                message: "重新登陆"
            };
        }

    } catch (err) {
        console.error("🚨 在处理 Axios 错误时发生异常:", err);
        handleLogout();
        result = {
            status: -1,
            message: "重新登陆"
        };

    } finally {
        setLock("token", false);
    }

    return result;
}

// 封装统一登出逻辑
function handleLogout() {
    clearTokenCookies();
    sessionStorage.clear();

    window.alert("令牌已过期，请重新登录");
    setTimeout(() => {
        window.open("/#/login", "_self");
        location.reload();
    }, 1000);
}

/**
 * 
 * @param {String} content - which always the response.message 
 * @returns 
 */
export function getNormalErrorAlert(content) {
    return {
        state: true,
        color: 'error',
        title: '请求错误',
        content: content
    }
}
/**
 * convert a string array to string
 * @param {Array} arr 
 * @param {String} split 
 * @returns 
 */
export function arrToString(arr, split = ",") {
    let result = "";
    for (let i = 0; i < arr.length; i++) {
        if (i == 0) {
            result += arr[0];
        } else {
            result += split + arr[i];
        }
    }
    return result;
}
/**
 * convert a string array to 
 */
export function stringToArr(str, split = ",") {
    return str.split(split);
}
/**
 * design for image dict  
 * @param {json} dict a dictionary blob-url
 * @param {String} content a string which represent the content
 */
export function replaceImageBlob(dict, content) {
    const keys = JSON.parse(JSON.stringify(Object.keys(dict)));
    for (let i = 0; i < keys.length; i++) {
        content = content.replace(keys[i], dict[keys[i]]);
    }
    return content;
}
export function getNormalSuccessAlert(title) {
    return {
        state: true,
        color: 'success',
        title: title,
        content: '',
    }
}
export function getNormalInfoAlert(title) {
    return {
        state: true,
        color: 'info',
        title: title,
        content: '',
    }
}
export function getNormalWarnAlert(title) {
    return {
        state: true,
        color: 'warning',
        title: title,
        content: '',
    }
}
/**
 * get the link in the post
 * @param {String} content 
 * @returns 
 */
export function getLinkInPost(content) {
    let begin = content.split("\n")[0];
    if (begin.startsWith("#/")) {
        return begin;
    } else {
        return null;
    }
}
/**
 * add the link to the post
 * @param {String} content 
 * @param {String} type 
 * @param {String} id 
 * @returns 
 */
export function addLinkToPost(content, type, id) {
    let link = "#/" + type + "/" + id;
    return link + "\n" + content;
}
/**
 * get the content in the post
 * @param {String} content 
 * @returns 
 */
export function getPostWithoutLink(content) {
    if (content.startsWith("#/")) {
        return content.substring(content.indexOf("\n") + 1);
    } else {
        return content;
    }
}
/**
 * get the reply content with header
 * @param {String} content 
 * @param {String} authorName 
 * @param {String} parentReplyId 
 * @returns 
 */
export function addHeaderToReply(content, authorName, parentReplyId) {
    return "@" + authorName + "\n" + parentReplyId + "\n" + content;
}
/**
 * get the reply content without header  
 * @param {String} content 
 * @returns 
 */
export function getReplyContentWithoutHeader(content) {
    let tmp = content.substring(content.indexOf("\n") + 1);
    tmp = tmp.substring(tmp.indexOf("\n") + 1);
    return tmp;
}

export function getAuthorNameFromReply(content) {
    return content.substring(0, content.indexOf("\n"));
}
export function getParentReplyIdFromReply(content) {
    let tmp = content.substring(content.indexOf("\n") + 1);
    return tmp.substring(0, tmp.indexOf("\n"));
}
/**
 * get user profile url
 * @param {String} userId 
 * @returns 
 */
export function getProfileUrl(userId) {
    return globalProperties.$apiUrl + "/image/user?user_id=" + userId;
}
/**
 * 
 * @param {String} str 
 * @returns 
 */
export function extractTime(str) {
    try {
        const regex = /.*(\d{4})-(\d{2})-(\d{2}).*(\d{2}):(\d{2}):(\d{2}).*/;
        const match = str.match(regex);

        if (match && match.length === 7) {
            const formattedTime = `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
            return formattedTime;
        } else {
            return "time ungot";
        }
    } catch (e) {
        return "";
    }
}
/**
 * 
 * @param {String} hexColor 
 * @param {Float} alpha 
 * @returns 
 */
export function adjustAlpha(hexColor, alpha = 0.1) {
    hexColor = hexColor.replace('#', '');
    if (hexColor.length === 8) {
        let r = hexColor.slice(0, 2);
        let g = hexColor.slice(2, 4);
        let b = hexColor.slice(4, 6);
        // eslint-disable-next-line
        let a = hexColor.slice(6);
        let newAlpha = Math.round(alpha * 255);
        let newAlphaHex = newAlpha.toString(16).padStart(2, '0');
        return `#${r}${g}${b}${newAlphaHex}`;
    } else if (hexColor.length === 6) {
        let newAlpha = Math.round(alpha * 255);
        let newAlphaHex = newAlpha.toString(16).padStart(2, '0');
        return `#${hexColor}${newAlphaHex}`;
    } else {
        throw new Error('Invalid hex color format');
    }
}

/**
 * 
 * @param {String} hex 
 * @param {Float} opacity 
 * @returns 
 */
export function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '');
    if (hex.length === 8) {
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);
        let a = parseInt(hex.substr(6, 2), 16) / 255;
        if (opacity !== undefined) {
            a = opacity;
        }
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    else if (hex.length === 6) {
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);
        let a = (opacity !== undefined) ? opacity : 1;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    else {
        return hexToRgba("#9c0c13", 0.1);
    }
}

/**
 * 
 */
export function openNewPage(url) {
    //let device=getDeviceType();
    window.open(url, "_self");
    /*if(device==="mobile"){
        window.open(url,"_self");
    }else{
        window.open(url,"_blank");
    }*/
}

export function extractStringsInBrackets(inputString) {
    const regex = /\[([^\]]+)\]/g;
    let result = [];
    let match;
    while ((match = regex.exec(inputString)) !== null) {
        result.push(match[1]);
    }

    return result;
}

export function removeStringsInBrackets(inputString) {
    const regex = /\[([^\]]+)\]/g;
    return inputString.replace(regex, '');
}

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
        setCookie('passwd', passwd, 9999 * 24);
        setCookie('userName', userName, 9999 * 24);
    }
}

/**
 * 
 * @param {String} inputString 
 * @returns 
 */
export function extractImageLinks(inputString) {
    const regex = /https:\/\/api\.sharesdu\.com\/index\/api\/image\/get[^\s")]+/g;
    const matches = inputString.match(regex);
    return matches || [];
}


export async function formatImageLinkInArticle(content) {
    let imgs = extractImageLinks(content);
    let formattedImgs = [];
    for (let i = 0; i < imgs.length; i++) {
        formattedImgs.push(await fetchImgAndDeal(imgs[i], 'png'));
    }
    for (let i = 0; i < imgs.length; i++) {
        content = content.replace(imgs[i], formattedImgs[i]);
    }
    return content;
}

/**
 * 
 * @param {JSON} response 
 * @returns 
 */
export async function responseToArticle(response) {
    let article = {};
    article.id = response.article_detail.article_id;
    article.title = response.article_detail.article_title;
    article.summary = response.article_detail.article_summary;
    article.type = response.article_detail.article_type;
    article.tags = response.article_detail.article_tags;
    article.originLink = response.article_detail.origin_link;
    article.coverLink = response.article_detail.article_cover_link;
    article.content = getContentWithoutEditorType(response.article_detail.article_content);
    //check the image data  
    article.content = await formatImageLinkInArticle(article.content);
    let editorType = extractEditorType(response.article_detail.article_content);
    article.likeCount = response.article_detail.like_count;
    article.replyCount = response.article_detail.reply_count;
    article.viewCount = response.article_detail.view_count;
    article.starCount = response.article_detail.star_count;
    article.authorName = response.article_detail.author_name;
    article.authorId = response.article_detail.author_id;
    article.sourceUrl = response.article_detail.source_url;
    article.publishTime = response.article_detail.publish_time;
    article.ifLike = response.article_detail.if_like;
    article.ifStar = response.article_detail.if_star;
    article.ifTop = response.article_detail.if_top;
    return [
        article,
        editorType,
    ]
}

/**
 * 
 * @param {Array} arr 
 * @returns unique array
 */
export function uniqueArray(arr) {
    return [...new Set(arr)];
}

export function waitSecond(second) {
    return new Promise((resolve) => {
        setTimeout(resolve, second * 1000);
    });
}
