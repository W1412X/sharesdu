import { globalProperties } from "@/main";
import { waitForLock } from "./lock";
import { globalProfileCacher } from "./global_img_cache";
import { axiosInstanceNoHeader } from "@/axios/axios";
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
    await waitForLock("token");
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
//old one which save profile in DB
`
export async function getProfileUrlInDB(userId,lastUpdateTime,times=0){
    if(times>=5){
        return null;
    }
    let profileMsg=await db.profile.get({
        userId:userId
    });
    if(profileMsg){//if the profile exsits  
        if(lastUpdateTime==profileMsg.updateTime){
            //if version matches  
            let url=URL.createObjectURL(profileMsg.blob);
            globalProfileCacher.addImage(globalProperties.$apiUrl+'/image/user?user_id='+userId,url);
            return url;
        }else{
            /**
             * get the new version 
             * update it in local db   
             * and do this function again  
             */
            await waitForLock("token");
            let response=await axiosIns.get(globalProperties.$apiUrl+'/image/user?user_id='+userId,{responseType:'blob'});
            await db.profile.put({
                userId:userId,
                updateTime:lastUpdateTime,
                blob:response.data,
            })
            let url=URL.createObjectURL(response.data);
            globalProfileCacher.addImage(globalProperties.$apiUrl+'/image/user?user_id='+userId,url);
            return url;
        }
    }else{
        await waitForLock("token");
        let response=await axiosIns.get(globalProperties.$apiUrl+'/image/user?user_id='+userId,{responseType:'blob'});
        if(response.status==1412){
            return null;
        }
        await db.profile.put({
            userId:userId,
            updateTime:lastUpdateTime,
            blob:response.data,
        })
        let url=URL.createObjectURL(response.data);
        globalProfileCacher.addImage(globalProperties.$apiUrl+'/image/user?user_id='+userId,url);
        return url;
    }
}
`