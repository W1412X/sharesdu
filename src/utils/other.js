import { getAccessToken } from "@/axios/token";
import { clearAllCookies, getCookie, setCookie } from "./cookie";
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
export function getLoadMsg(text,progress){
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
 * add key-value to string
 * key and value must be string type  
 * @param {String} key  
 * @param {String} value  
 * @param {String} string
 * @returns the new string
 */
export function setDictString(key,value,string=null){
    var insertString=key+'|'+value;
    var result=string;
    if(result==null||result==''){
        string='|END|';
    }
    result=insertString+result;
    return result;
}
/**
 * 
 * @param {String} string 
 * @param {Json} dict 
 * @returns a dict
 */
export function addDictFromString(string,dict=null){
    var result=copy(dict);
    if(result==null){
        result={};
    }
    var tmp1=string.split('|end|')[0]
    var kv_list=tmp1.split('|DIVIDE');
    for(let i=0;i<kv_list.length;i++){
        var kv=kv_list[i].split('|');
        result[kv[0]]=kv[1];
    }
    return result;
}
/**
 * get the string before |end| (include |end|)
 * @param {String} string 
 */
export function getHeadString(string){
    return string.split('|end|')[0]+'|end|';
}
/**
 * this function provide an error handler
 * and for the accessToken expired,try to get the new one 
 * if we can fetch by the new access token, the status is 1412   
 * @param {*} error 
 * @returns 
 */
export async function dealAxiosError(error){
    /**
     * got response  
     */
    if (error.response) {
        /**
         * here check if the error is caused by the token
         */
        if(error.response.status==1000||error.response.status==1001){
            /**
             * check if the refresh token is exsits
             * if exsits -> try to get the new access token and reload  
             * if not -> to login page and alert
             */
            const refreshToken=getCookie("refreshToken");
            if(refreshToken){
                try{
                    const response=await getAccessToken(refreshToken);
                    const status=response.data.status;
                    if(status==200){
                        setCookie("accessToken",response.data.accesss);
                        return {
                            status:1412,
                            message:"已更新access token，重新请求"
                        }
                    }else{
                        /**
                         * failed to refresh the token
                         * despite other situations,to login page
                         */
                        window.alert("令牌已过期，请重新登录");
                        clearAllCookies();
                        window.open("/#/login");
                        return {
                            status: "-1",
                            message:"重新登陆"
                        }
                    }
                }catch(error){
                    clearAllCookies();
                    return {
                        status: "-1",
                        message:"重新登陆"
                    }
                }
            }else{
                /**
                 * if the refresh key not exists too
                 * then delete all the user message
                 * and redirect to login page
                 */
                clearAllCookies();
                window.open("/#/login");
                return {
                    status: "-1",
                    message:"重新登陆"
                }
            }
        }
        /**
         * not token error
         */
        return error.response.data
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