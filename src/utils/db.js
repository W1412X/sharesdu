import Dexie from "dexie";
const db=new Dexie("sharesdu");
db.version(1).stores({
    profile:'&userId,updateTime,blob'
})
/**
 * set the profile to the database
 * @param {String} userId 
 * @param {int} updateTime 
 * @param {Blob} blob 
 */
export async function dbSetProfile(userId,updateTime,blob){
    await db.profile.put({
        userId:userId,
        updateTime:updateTime,
        blob:blob
    })
}

export async function dbGetProfile(userId){
    return await db.profile.get({
        userId:userId
    });
}
export function dbDeleteProfile(userId){
    return db.profile.delete(userId);
}