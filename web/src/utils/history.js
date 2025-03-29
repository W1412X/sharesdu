import Dexie from "dexie";
const db=new Dexie("sharesdu");
db.version(1).stores({
    history:'type_id,time,title'
})
export async function addHistory(itemType,itemId,title){
    const typeId = itemType + "|" + itemId;
    await db.history.delete(typeId);
    await db.history.put({
        type_id: typeId,
        time: new Date().getTime(),
        title: title
    });
}
export async function getHistory(num=20){
    let result=await db.history.orderBy('time').reverse().limit(num).toArray();
    result.forEach(element => {
        element.type=element.type_id.split("|")[0];
        element.id=element.type_id.split("|")[1];
        element.time=new Date(element.time).toLocaleString();
    });
    return result;
}