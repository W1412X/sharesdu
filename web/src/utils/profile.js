import { globalProperties } from "@/main";
import { globalProfileCacher } from "./global_img_cache";
import { axiosInstanceNoHeader } from "@/api/request";
import { waitSecond } from "./other";
/**
 * get the profile by userId
 * check the state first,if can be the server version as same as the local version  
 * then use the local version 
 * else get the server version and update the info to the local db  
 * @param {String} userId 
 * @param {Boolean} state to avoid the recursion deeply
 */
export async function getProfileUrl(userId){
    let time=0.5;
    let response=await axiosInstanceNoHeader.get(globalProperties.$apiUrl+'/image/user?user_id='+userId,{responseType:'blob'});
    if(response.status==200){
        let url=URL.createObjectURL(response.data);
        globalProfileCacher.addImage(globalProperties.$apiUrl+'/image/user?user_id='+userId,url);
        return url;
    }else{
        // eslint-disable-next-line no-constant-condition
        while(true){
            await waitSecond(time);
            time*=2;
            return await getProfileUrl(userId);
        }
    }
}