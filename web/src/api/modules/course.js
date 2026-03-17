/** 
 * this document provides all interface request for course operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { dealAxiosError } from "@/utils/other";
import axiosInstance from "../request";

/**
 * 创建新的课程
 * @param {*} data 
 * @returns 
 */
export const createCourse = async (data) => {
    try {
        const response = await axiosInstance.post('/course/create', data);
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 编辑已存在的课程
 * @param {*} data 
 * @returns 
 */
export const editCourse = async (data) => {
    try {
        const response = await axiosInstance.post('/course/edit', data);
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 删除指定的课程
 * @param {*} courseId 
 * @returns 
 */
export const deleteCourse = async (courseId) => {
    try {
        const response = await axiosInstance.post('/course/delete', { course_id: courseId });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 为课程打分并进行评价
 * @param {*} data 
 * @returns 
 */
export const rateCourse = async (data) => {
    try {
        const response = await axiosInstance.post('/course/rate', data);
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 修改已提交的课程评分与评价
 * @param {*} data 
 * @returns 
 */
export const editRating = async (data) => {
    try {
        const response = await axiosInstance.post('/course/edit_rating', data);
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const response = await axiosInstance.post('/course/user_evaluation', { user_id: userId, course_id: courseId });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 根据id获取Course的详细信息
 * @param {*} courseId 
 * @returns 
 */
export const getCourseDetail = async (courseId) => {
    try {
        const response = await axiosInstance.get('/course/detail', { params: { course_id: courseId } });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const response = await axiosInstance.get('/course/post_list', { params: { course_id: courseId, page_index: pageIndex, page_size: pageSize } });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const response = await axiosInstance.get('/course/score_list', { params: { course_id: courseId, page_index: pageIndex, page_size: pageSize } });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
 * 分页获取course列表
 * @param {*} pageIndex 
 * @param {*} pageSize 
 * @returns 
 */
export const getCourseList = async (pageIndex = 1,useCache=true, pageSize = 20) => {
    try {
        const response = await axiosInstance.get('/course/list', { params: { page_index: pageIndex, page_size: pageSize } },useCache);
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const response = await axiosInstance.post('/admin/courses/freeze', { course_id: courseId, action: action });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const response = await axiosInstance.post('/admin/courses/rollback', { course_id: courseId, target_version: targetVersion });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
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
        const response = await axiosInstance.get(`/admin/courses/${courseId}/history`, { params: { page_index: pageIndex, page_size: pageSize } });
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};



