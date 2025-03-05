export function copy(json){
    return JSON.parse(JSON.stringify(json));
}
/**
 * a method to change the loading view
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
 * @param {key} key  
 * @param {value} value  
 * @param {the original string} string
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
 * @param {the origin string} string 
 * @param {the dict which the key-value in the string need to add to} dict 
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
 * @param {string} string 
 */
export function getHeadString(string){
    return string.split('|end|')[0]+'|end|';
}

export function dealAxiosError(error){
    if (error.response) {
        console.error('Error logging in with password:', error.response.status, error.response.data);
        return error.response.data;
      } else if (error.request) {
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