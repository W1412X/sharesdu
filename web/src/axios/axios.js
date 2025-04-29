import { getCookie } from '@/utils/cookie';
import { ResponseBuffer } from '@/utils/response_cacher';
import axios from 'axios';
class AxiosWithCache {
    constructor() {
        this.axiosInstance=axios.create({
            baseURL: 'https://api.sharesdu.com/index/api',
            headers: {
                'Authorization': 'Bearer '+getCookie("accessToken"),
            },
        });
        this.cacher=new ResponseBuffer(100, 600 * 1000);
    }
    async get(url, config = {}) {
        /**
         * check cache
         */
        let key=url+JSON.stringify(config);
        let cachedResponse=this.cacher.getResponse(key);
        if(cachedResponse){
            return cachedResponse;
        }
        /**
         * no cache 
         * request
         */
        const response = await this.axiosInstance.get(url, config);
        /**
         * cache successful response
         * only json response can be cached
         */
        if(response.status==200 && response.headers['content-type'] === 'application/json'){
            this.cacher.addResponse(key,response);
        }
        return response;
    }
    async post(url, data, config = {}) {
        const response = await this.axiosInstance.post(url, data, config);
        return response;
    }
    async put(url, data, config = {}) {
        const response = await this.axiosInstance.put(url, data, config);
        return response;
    }
    async patch(url, data, config = {}) {
        const response = await this.axiosInstance.patch(url, data, config);
        return response;
    }
    async delete(url, config = {}) {
        const response = await this.axiosInstance.delete(url, config);
        return response;
    }
    async options(url, config = {}) {
        const response = await this.axiosInstance.options(url, config);
        return response;
    }

    async head(url, config = {}) {
        const response = await this.axiosInstance.head(url, config);
        return response;
    }
}

const axiosInstance=new AxiosWithCache();
axiosInstance.axiosInstance.interceptors.request.use(
    (config) => {
        //update token
        config.headers['Authorization'] = `Bearer ${getCookie("accessToken")}`;
        return config;
    }
);
axiosInstance.axiosInstance.interceptors.response.use(
    (response)=>{
        return response;
    }
)

export default axiosInstance;
export const axiosInstanceNoHeader=axios.create({
    baseURL: 'https://api.sharesdu.com/index/api',
});
