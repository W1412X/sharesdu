import { getCookie } from '@/utils/cookie';
import axios from 'axios';
const axiosInstance=axios.create({
    baseURL: 'https://api.sharesdu.com/index/api',
    headers: {
        'Authorization': 'Bearer '+getCookie("accessToken"),
    },
});
axiosInstance.interceptors.request.use(
    (config)=>{
        console.log(config.url);
        //update token
        config.headers['Authorization'] = `Bearer ${getCookie("accessToken")}`;
        return config;
    }
)
export default axiosInstance;
export const axiosInstanceNoHeader=axios.create({
    baseURL: 'https://api.sharesdu.com/index/api',
});
