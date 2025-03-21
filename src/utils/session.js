export function getResponseFromCache(route){
    if(sessionStorage.getItem(route)){
        return null;
        //return JSON.parse(sessionStorage.getItem(route));
    }else{
        return null;
    }
}
export function saveResponseToCache(route,response){
    if(response.data.status==200){
        sessionStorage.setItem(route,JSON.stringify(response));
    }
}