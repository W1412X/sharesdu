import { getAccessToken } from "@/axios/token";
import { clearTokenCookies, getCookie, setCookie } from "./cookie";
import { globalProperties } from "@/main";
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
    console.log(error.response.data);
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
            if(refreshToken){
                try{
                    console.log("try to get the token");
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
                    console.log(error);
                    clearTokenCookies();
                    window.open("/#/login");
                    return {
                        status: -1,
                        message:"重新登陆，令牌无效"
                    }
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
        console.error('No response received from server:', error.request);
        return {
          status:-1,
          message:"服务器无响应，请联系管理员"
        }
      } else {
        console.error('Error during login attempt:', error.message);
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
        color: 'wanning',
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
    const regex = /.*(\d{4})-(\d{2})-(\d{2}).*(\d{2}):(\d{2}):(\d{2}).*/;
    const match = str.match(regex);

    if (match && match.length === 7) {
        const formattedTime = `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
        return formattedTime;
    } else {
        return "time ungot";
    }
}