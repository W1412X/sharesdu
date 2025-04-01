export function getResponseFromCache(route) {
    //eslint-disable-next-line
    if(true){
        return null;
    }
    try{
        const cachedData = sessionStorage.getItem(route);
        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            const currentTime = Date.now();
            if (currentTime - parsedData.timestamp > 300000) {
                sessionStorage.removeItem(route);
                return null;
            } else {
                return parsedData.response;
            }
        } else {
            return null;
        }
    }catch(error){
        return null;
    }
}

export function saveResponseToCache(route, response) {
    //eslint-disable-next-line
    if(true){
        return;
    }
    try{
        if (response.data.status === 200) {
            const cacheData = {
                response: response,
                timestamp: Date.now()
            };
            sessionStorage.setItem(route, JSON.stringify(cacheData));
        }
    }catch(error){
        return;
    }
}
