import { getaxiosInstance } from "@/axios/axios";
import { globalProperties } from "@/main";
import Dexie from "dexie";
const db=new Dexie("sharesdu");
db.version(1).stores({
    profile:'&userId,updateTime,blob'
})
/**
 * get the profile by userId
 * check the state first,if can be the server version as same as the local version  
 * then use the local version 
 * else get the server version and update the info to the local db  
 * @param {String} userId 
 * @param {Boolean} state to avoid the recursion deeply
 */
export async function getProfileUrlInDB(userId,lastUpdateTime,times=0){
    if(times>=5){
        return null;
    }
    let profileMsg=await db.profile.get({
        userId:userId
    });
    console.log("profileMsg")
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
            await db.profile.put({
                userId:userId,
                updateTime:lastUpdateTime,
                blob:response.data,
            })
            return URL.createObjectURL(response.data);
        }
    }else{

        let response=await getaxiosInstance().get(globalProperties.$apiUrl+'/image/user?user_id='+userId,{responseType:'blob'});
        await db.profile.put({
            userId:userId,
            updateTime:lastUpdateTime,
            blob:response.data,
        })
        return URL.createObjectURL(response.data);
    }
}