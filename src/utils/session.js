export function getResponseFromCache(route){
    if(sessionStorage.getItem(route)){
        console.log("use cache data in sessionStorage");
        return JSON.parse(sessionStorage.getItem(route));
    }else{
        return null;
    }
}
export function saveResponseToCache(route,response){
    if(response.data.status==200){
        console.log("save cache data in sessionStorage");
        sessionStorage.setItem(route,JSON.stringify(response));
    }
}