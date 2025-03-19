import { getaxiosInstance } from "@/axios/axios";
import { dbGetProfile, dbSetProfile } from "./db";
import { globalProperties } from "@/main";

/**
 * get the profile by userId
 * check the state first,if can be the server version as same as the local version  
 * then use the local version 
 * else get the server version and update the info to the local db  
 * @param {String} userId 
 */
export async function getProfileUrlInDB(userId,lastUpdateTime){
    let profileMsg=await dbGetProfile(String(userId));
    console.log(profileMsg);
    if(profileMsg){//if the profile exsits  
        console.log("profile exsits");
        if(lastUpdateTime==profileMsg.updateTime){
            //if version matches  
            console.log("version matches");
            console.log(profileMsg.updateTime,lastUpdateTime);
            return URL.createObjectURL(profileMsg.blob);
        }else{
            console.log("version not matches");
            console.log(profileMsg.updateTime,lastUpdateTime);
            /**
             * get the new version 
             * update it in local db   
             * and do this function again  
             */
            let response=await getaxiosInstance().get(globalProperties.$apiUrl+'/image/user?user_id='+userId,{responseType:'blob'});
            await dbSetProfile(userId,lastUpdateTime,response.data);
            return getProfileUrlInDB(userId,lastUpdateTime);
        }
    }else{
        console.log("no profile in db");
        let response=await getaxiosInstance().get(globalProperties.$apiUrl+'/image/user?user_id='+userId,{responseType:'blob'});
        await dbSetProfile(userId,lastUpdateTime,response.data);
        return getProfileUrlInDB(userId,lastUpdateTime);
    }
}