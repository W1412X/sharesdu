import { getCookie } from '@/utils/cookie';
import axios from 'axios';
/**
 * @returns axiosInstance
 */
export function getaxiosInstance(){
    return axios.create({
        baseURL: 'https://api.sharesdu.com/index/api',
        headers: {
            'Authorization': 'Bearer '+getCookie("accessToken"),
        },
    })
}
export function getNoHeaderAxiosInstance(){
    return axios.create({
        baseURL: 'https://api.sharesdu.com/index/api',
    })
}