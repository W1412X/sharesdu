/** 
 * this document provides all interface request for course operations
 * the required input parameter is a json object
 * returns the original response message
 * every function return a json with status code and message
 */
import { dealAxiosError } from "@/utils/other";
import { getaxiosInstance } from "./axios";
/**
 * create a new course
 * @param {*} data 
 * @returns 
 */
export const createCourse = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /index/api/course/create');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/index/api/course/create', data);
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
 * edit an exist course
 * @param {*} data 
 * @returns 
 */
export const editCourse = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /index/api/course/edit');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/index/api/course/edit', data);
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
 * delete a course
 * @param {*} courseId 
 * @returns 
 */
export const deleteCourse = async (courseId) => {
    try {
        const data = { course_id: courseId };
        console.log('Request Type: POST');
        console.log('Request URL: /index/api/course/delete');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/index/api/course/delete', data);
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
 * evaluate a course
 * @param {*} data 
 * @returns 
 */
export const rateCourse = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /index/api/course/rate');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/index/api/course/rate', data);
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
 * edit a course's evaluate
 * @param {*} data 
 * @returns 
 */

export const editCourseRating = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /index/api/course/edit_rating');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/index/api/course/edit_rating', data);
        return response.data;
    } catch (error) {
        console.error('Error editing course rating:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await editCourseRating(data);
        }
        return dealResult;
    }
};


/**
 * get a user's evaluation for a course  
 * @param {*} data 
 * @returns 
 */
export const getUserCourseEvaluation = async (data) => {
    try {
        console.log('Request Type: POST');
        console.log('Request URL: /index/api/course/user_evaluation');
        console.log('Request Data:', data);
        const response = await getaxiosInstance().post('/index/api/course/user_evaluation', data);
        return response.data;
    } catch (error) {
        console.error('Error getting user course evaluation:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getUserCourseEvaluation(data);
        }
        return dealResult;
    }
};


/**
 * get course's detail
 * @param {*} courseId 
 * @returns 
 */
export const getCourseDetail = async (courseId) => {
    try {
        console.log('Request Type: GET');
        console.log('Request URL: /index/api/course/detail');
        console.log('Request Params:', { course_id: courseId });
        const response = await getaxiosInstance().get('/index/api/course/detail', { params: { course_id: courseId } });
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



