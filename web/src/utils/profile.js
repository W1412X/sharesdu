import { globalProperties } from "@/main";
import { globalProfileCacher } from "./global_img_cache";
import { axiosInstanceNoHeader } from "@/api/request";
/**
 * get the profile by userId
 * check the state first,if can be the server version as same as the local version  
 * then use the local version 
 * else get the server version and update the info to the local db  
 * @param {String} userId 
 * @param {Boolean} state to avoid the recursion deeply
 */
export async function getProfileUrl(userId){
    const url = globalProperties.$apiUrl + '/image/user?user_id=' + userId;
    const response=await axiosInstanceNoHeader.get(url,{responseType:'blob'});
    if(response.status===200){
        let blobUrl=URL.createObjectURL(response.data);
        globalProfileCacher.addImage(url,blobUrl);
        return blobUrl;
    }
    throw new Error('Failed to fetch profile image');
}
