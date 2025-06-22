import Dexie from "dexie";
import { selfDefineLocalStorage } from "../localStorage";

const db=new Dexie("sharesdu");
db.version(1).stores({
    debug_click:'&time,msg',
    debug_error:'&time,msg',
});
export async function debugSaveClickMsg(msg){
    if(selfDefineLocalStorage.getItem("ifDebug")!=="true"){
        window.alert("调试已结束，标签页将关闭");
        return;
    }
    await db.debug_click.put({
        time:new Date().getTime(),
        msg:msg
    });
}
export function debugSaveEnvInfo(msg){
    if(selfDefineLocalStorage.getItem("ifDebug")!=="true"){
        window.alert("调试已结束，标签页将关闭");
        return;
    }
    selfDefineLocalStorage.setItem("debugEnvInfo",msg);
}
export async function debugSaveErrorMsg(msg){
    if(selfDefineLocalStorage.getItem("ifDebug")!=="true"){
        window.alert("调试已结束，标签页将关闭");
        return;
    }
    await db.debug_error.put({
        time:new Date().getTime(),
        msg:msg
    });
}
export async function getDebugInfo(){
    return {
        click:await db.debug_click.toArray(),
        error:await db.debug_error.toArray(),
        envInfo:selfDefineLocalStorage.getItem("debugEnvInfo")
    }
}

export async function clearDebugInfo(){
    await db.debug_click.clear();
    await db.debug_error.clear();
    selfDefineLocalStorage.removeItem("debugEnvInfo");
}