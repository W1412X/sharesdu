import { getAccessToken } from "@/axios/token";
import { clearTokenCookies, getCookie, setCookie } from "./cookie";
import { globalProperties } from "@/main";
import { setLock, waitForLock } from "./lock";
/**
 * a deep copy function for json object
 * @param {json} json 
 * @returns 
 */
export function copy(json){
    return JSON.parse(JSON.stringify(json));
}
/**
 * a method to change the loading view
 * @param {String} text load message
 * @param {int} progress always -1 if there's no progress requirement 
 * @returns 
 */
export function getLoadMsg(text,progress=-1){
    return{
        state:true,
        text:text,
        progress:progress
    }
}
/**
 * cancel the loading view
 */
export function getCancelLoadMsg(){
    return{
        state:false,
        text:'加载中...',
        progress:-1
    }
}
/**
 * get the editor type from the content got from the server
 * @param {String} content 
 */
export function extractEditorType(content){
    let editor=content.substring(0,4);
    if(editor=="html"){
        return "html";
    }else{
        return "md";
    }
}
/**
 * add the editor type to the content and return the dealed content 
 * @param {String} content 
 * @param {String} editorType 
 * @returns 
 */
export function addEditorType(content,editorType){
    return editorType+content;
}
export function getContentWithoutEditorType(content){
    let editorType=extractEditorType(content);
    if(editorType=="html"){
        return content.substring(4);
    }else{
        return content.substring(2);
    }
}
export async function dealAxiosError(error){
    /**
     * got response  
     */
    if (error.response.data) {
        /**
         * here check if the error is caused by the token
         */
        if(error.response.data.status==1000||error.response.data.status==1001){
            /**
             * check if the refresh token is exsits
             * if exsits -> try to get the new access token and reload  
             * if not -> to login page and alert
             */
            const refreshToken=getCookie("refreshToken");
            setCookie("accessToken","",-1);
            if(refreshToken){
                try{
                    /**
                     * wait for the token lock
                     * ensure the access now is empty
                     * and if the access not empty after wait 
                     * means that other request have get the access token
                     * return 1412
                     */
                    await waitForLock("token");
                    if(getCookie("accessToken")){
                        return {
                            status:1412,
                        }
                    }
                    setLock("token",true);
                    const response=await getAccessToken(refreshToken);
                    if(response.status==999){
                        setCookie("accessToken",response.access,5);
                        return {
                            status:1412,
                            message:"已更新access token，重新请求"
                        }
                    }else{
                        clearTokenCookies();
                        window.open("/#/login");
                        return {
                            status:-1,
                            message:"获取access失败，请重新登陆",
                        }
                    }
                }catch(error){
                    clearTokenCookies();
                    window.open("/#/login");
                    return {
                        status: -1,
                        message:"重新登陆，令牌无效"
                    }
                }finally{
                    setLock("token",false);
                }
            }else{
                /**
                 * if the refresh key not exists too
                 * then delete all the user message
                 * and redirect to login page
                 */
                clearTokenCookies();
                window.open("/#/login");
                return {
                    status: -1,
                    message:"重新登陆"
                }
            }
        }
        /**
         * not token error
         */
        return error.response.data;
      }else if (error.request) {
        /**
         * no response
         * return the error message  
         */
        return {
          status:-1,
          message:"服务器无响应，请联系管理员"
        }
      } else {
        return {
          status:-1,
          message:"未知错误，请联系管理员"
        }
      }
}

/**
 * 
 * @param {String} content - which always the response.message 
 * @returns 
 */
export function getNormalErrorAlert(content){
    return {
        state:true,
        color:'error',
        title:'请求错误',
        content:content
    }
}

export function base64Encode(str){
    return window.btoa(str);
}

export function base64Decode(str){
    return window.atob(str);
}
/**
 * open the new web  
 * @param {String} url 
 */
export function openNewWeb(url){
    window.open(url,"_blank");
}
/**
 * convert a string array to string
 * @param {Array} arr 
 * @param {String} split 
 * @returns 
 */
export function arrToString(arr,split=","){
    let result="";
    for(let i=0;i<arr.length;i++){
        if(i==0){
            result+=arr[0];
        }else{
            result+=split+arr[i];
        }
    }
    return result;
}
/**
 * convert a string array to 
 */
export function stringToArr(str,split=","){
    return str.split(split);
}
/**
 * design for image dict  
 * @param {json} dict a dictionary blob-url
 * @param {String} content a string which represent the content
 */
export function replaceImageBlob(dict,content){
    const keys=JSON.parse(JSON.stringify(Object.keys(dict)));
    for(let i=0;i<keys.length;i++){
        content=content.replace(keys[i],dict[keys[i]]);
    }
    return content;
}
export function getNormalSuccessAlert(title){
    return {
        state: true,
        color: 'success',
        title: title,
        content: '',
    }
}
export function getNormalInfoAlert(title){
    return {
        state: true,
        color: 'info',
        title: title,
        content: '',
    }
}
export function getNormalWarnAlert(title){
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
export function getLinkInPost(content){
    let begin=content.split("\n")[0];
    if(begin.startsWith("#/")){
        return begin;
    }else{
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
export function addLinkToPost(content,type,id){
    let link="#/"+type+"/"+id;
    return link+"\n"+content;
}
/**
 * get the content in the post
 * @param {String} content 
 * @returns 
 */
export function getPostWithoutLink(content){
    if(content.startsWith("#/")){
        return content.substring(content.indexOf("\n")+1);
    }else{
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
export function addHeaderToReply(content,authorName,parentReplyId){
    return "@"+authorName+"\n"+parentReplyId+"\n"+content;
}
/**
 * get the reply content without header  
 * @param {String} content 
 * @returns 
 */
export function getReplyContentWithoutHeader(content){
    let tmp=content.substring(content.indexOf("\n")+1);
    tmp=tmp.substring(tmp.indexOf("\n")+1);
    return tmp;
}

export function getAuthorNameFromReply(content){
    return content.substring(0,content.indexOf("\n"));
}
export function getParentReplyIdFromReply(content){
    let tmp=content.substring(content.indexOf("\n")+1);
    return tmp.substring(0,tmp.indexOf("\n"));
}
/**
 * get user profile url
 * @param {String} userId 
 * @returns 
 */
export function getProfileUrl(userId){
    return globalProperties.$apiUrl+"/image/user?user_id="+userId;
}
/**
 * 
 * @param {String} str 
 * @returns 
 */
export function extractTime(str) {
    try{
        const regex = /.*(\d{4})-(\d{2})-(\d{2}).*(\d{2}):(\d{2}):(\d{2}).*/;
        const match = str.match(regex);
    
        if (match && match.length === 7) {
            const formattedTime = `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
            return formattedTime;
        } else {
            return "time ungot";
        }
    }catch(e){
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