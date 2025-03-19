/** 
 * this document provides all interface request for course operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { dealAxiosError } from "@/utils/other";
import { getaxiosInstance } from "./axios";
import { getResponseFromCache, saveResponseToCache } from "@/utils/session";

/**
 * 创建新的课程
 * @param {*} data 
 * @returns 
 */
export const createCourse = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /course/create');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/course/create', data);
        return response.data;
    } catch (error) {
        console.error('Error creating course:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await createCourse(data);
        }
        return dealResult;
    }
};

/**
 * 编辑已存在的课程
 * @param {*} data 
 * @returns 
 */
export const editCourse = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /course/edit');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/course/edit', data);
        return response.data;
    } catch (error) {
        console.error('Error editing course:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await editCourse(data);
        }
        return dealResult;
    }
};

/**
 * 删除指定的课程
 * @param {*} courseId 
 * @returns 
 */
export const deleteCourse = async (courseId) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /course/delete');
        console.log('Request Data:', { course_id: courseId });
        const response = await getaxiosInstance().post('/course/delete', { course_id: courseId });
        return response.data;
    } catch (error) {
        console.error('Error deleting course:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await deleteCourse(courseId);
        }
        return dealResult;
    }
};

/**
 * 为课程打分并进行评价
 * @param {*} data 
 * @returns 
 */
export const rateCourse = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /course/rate');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/course/rate', data);
        return response.data;
    } catch (error) {
        console.error('Error rating course:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await rateCourse(data);
        }
        return dealResult;
    }
};

/**
 * 修改已提交的课程评分与评价
 * @param {*} data 
 * @returns 
 */
export const editRating = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /course/edit_rating');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/course/edit_rating', data);
        return response.data;
    } catch (error) {
        console.error('Error editing rating:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await editRating(data);
        }
        return dealResult;
    }
};

/**
 * 获取用户对某个课程的评价
 * @param {*} userId 
 * @param {*} courseId 
 * @returns 
 */
export const getUserCourseEvaluation = async (userId, courseId) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /course/user_evaluation');
        console.log('Request Data:', { user_id: userId, course_id: courseId });
        const response = await getaxiosInstance().post('/course/user_evaluation', { user_id: userId, course_id: courseId });
        return response.data;
    } catch (error) {
        console.error('Error getting user course evaluation:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getUserCourseEvaluation(userId, courseId);
        }
        return dealResult;
    }
};

/**
 * 根据id获取Course的详细信息
 * @param {*} courseId 
 * @returns 
 */
export const getCourseDetail = async (courseId) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /course/detail');
        console.log('Request Params:', { course_id: courseId });
        let cacheResponse=getResponseFromCache('/course/detail?course_id=' + courseId);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/course/detail', { params: { course_id: courseId } });
        saveResponseToCache('/course/detail?course_id=' + courseId,response);
        return response.data;
    } catch (error) {
        console.error('Error getting course detail:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getCourseDetail(courseId);
        }
        return dealResult;
    }
};

/**
 * 根据id分页获取Course下的Post列表
 * @param {*} courseId 
 * @param {*} pageIndex 
 * @param {*} pageSize 
 * @returns 
 */
export const getCoursePostList = async (courseId, pageIndex = 1, pageSize = 20) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /course/post_list');
        console.log('Request Params:', { course_id: courseId, page_index: pageIndex, page_size: pageSize });
        let cacheResponse=getResponseFromCache('/course/post_list?course_id=' + courseId + '&page_index=' + pageIndex + '&page_size=' + pageSize);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/course/post_list', { params: { course_id: courseId, page_index: pageIndex, page_size: pageSize } });
        saveResponseToCache('/course/post_list?course_id=' + courseId + '&page_index=' + pageIndex + '&page_size=' + pageSize,response);
        return response.data;
    } catch (error) {
        console.error('Error getting course post list:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getCoursePostList(courseId, pageIndex, pageSize);
        }
        return dealResult;
    }
};

/**
 * 根据id分页获取Course下的评分列表
 * @param {*} courseId 
 * @param {*} pageIndex 
 * @param {*} pageSize 
 * @returns 
 */
export const getCourseScoreList = async (courseId, pageIndex = 1, pageSize = 20) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /course/score_list');
        console.log('Request Params:', { course_id: courseId, page_index: pageIndex, page_size: pageSize });
        let cacheResponse=getResponseFromCache('/course/score_list?course_id=' + courseId + '&page_index=' + pageIndex + '&page_size=' + pageSize);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/course/score_list', { params: { course_id: courseId, page_index: pageIndex, page_size: pageSize } });
        saveResponseToCache('/course/score_list?course_id=' + courseId + '&page_index=' + pageIndex + '&page_size=' + pageSize,response);
        return response.data;
    } catch (error) {
        console.error('Error getting course score list:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getCourseScoreList(courseId, pageIndex, pageSize);
        }
        return dealResult;
    }
};

/**
 * 分页获取course列表
 * @param {*} pageIndex 
 * @param {*} pageSize 
 * @returns 
 */
export const getCourseList = async (pageIndex = 1, pageSize = 20) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /course/list');
        console.log('Request Params:', { page_index: pageIndex, page_size: pageSize });
        let cacheResponse=getResponseFromCache('/course/list?page_index=' + pageIndex + '&page_size=' + pageSize);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get('/course/list', { params: { page_index: pageIndex, page_size: pageSize } });
        saveResponseToCache('/course/list?page_index=' + pageIndex + '&page_size=' + pageSize,response);
        return response.data;
    } catch (error) {
        console.error('Error getting course list:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getCourseList(pageIndex, pageSize);
        }
        return dealResult;
    }
};

/**
 * 课程冻结/解冻管理接口
 * @param {*} courseId 
 * @param {*} action 
 * @returns 
 */
export const freezeUnfreezeCourse = async (courseId, action) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /api/admin/courses/freeze');
        console.log('Request Data:', { course_id: courseId, action: action });
        const response = await getaxiosInstance().post('/api/admin/courses/freeze', { course_id: courseId, action: action });
        return response.data;
    } catch (error) {
        console.error('Error freezing/unfreezing course:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await freezeUnfreezeCourse(courseId, action);
        }
        return dealResult;
    }
};

/**
 * 课程版本回滚接口
 * @param {*} courseId 
 * @param {*} targetVersion 
 * @returns 
 */
export const rollbackCourse = async (courseId, targetVersion) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /api/admin/courses/rollback');
        console.log('Request Data:', { course_id: courseId, target_version: targetVersion });
        const response = await getaxiosInstance().post('/api/admin/courses/rollback', { course_id: courseId, target_version: targetVersion });
        return response.data;
    } catch (error) {
        console.error('Error rolling back course:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await rollbackCourse(courseId, targetVersion);
        }
        return dealResult;
    }
};

/**
 * 课程历史版本查询接口
 * @param {*} courseId 
 * @param {*} pageIndex 
 * @param {*} pageSize 
 * @returns 
 */
export const getCourseHistory = async (courseId, pageIndex = 1, pageSize = 10) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /api/admin/courses/<course_id>/history');
        console.log('Request Params:', { page_index: pageIndex, page_size: pageSize });
        let cacheResponse=getResponseFromCache(`/api/admin/courses/${courseId}/history?page_index=${pageIndex}&page_size=${pageSize}`);
        if(cacheResponse){
            return cacheResponse.data;
        }
        const response = await getaxiosInstance().get(`/api/admin/courses/${courseId}/history`, { params: { page_index: pageIndex, page_size: pageSize } });
        saveResponseToCache(`/api/admin/courses/${courseId}/history?page_index=${pageIndex}&page_size=${pageSize}`,response);
        return response.data;
    } catch (error) {
        console.error('Error getting course history:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getCourseHistory(courseId, pageIndex, pageSize);
        }
        return dealResult;
    }
};



