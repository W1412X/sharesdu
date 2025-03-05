import { getCookie } from '@/utils/cookie';
import axios from 'axios';
//import { getCookie } from '@/utils/cookie';
export function getAxios(){
    return axios.create({
                baseURL: 'https://api.sharesdu.com/index/api',
                headers: {
                    'Authorization': 'Bearer '+getCookie("accessToken"),
                },
            });
}
//添加请求头的参数
/*
axiosInstance.interceptors.request.use(config => {
    const tmp=getCookie('cookie')
    const token ='SSSSSSSSSSSSSSSSSSSSSSSSSSSS';
    console.log(tmp);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});*/