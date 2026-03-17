/**
 * this document provide all the image relevent request  
 */
import { dealAxiosError } from "@/utils/other.js";
import axiosInstance from "./axios";
/**
 * Upload user profile image
 * @param {File} image - The image file to upload
 * @returns 
 */
export const uploadProfileImage = async (image) => {
    try {
        const data = new FormData();
        data.append('image', image);
        const response = await axiosInstance.post('/image/profile', data);
        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};

/**
* Upload image for article
* @param {File} image - The image file for the article
* @returns 
*/
export const uploadArticleImage = async (image) => {
    try {
        const formData = new FormData();
        formData.append('image', image);
        const response = await axiosInstance.post('/image/article', formData);

        return response.data;
    } catch (error) {
        return dealAxiosError(error);
    }
};


/**
 * Get profile image update information for users
 * @param {Array<string>} userIds - The user IDs for which the profile information is to be fetched
 * @returns 
 */
export const getUserProfileImageUpdateInfo = async (userIds) => {
    try {
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return {
                status: -1,
                message: 'User IDs must be a non-empty array'
            };
        }
        const userIdsString = userIds.join(',');
        const requestUrl = `/image/profile/time?user_ids=${userIdsString}`;
        const response = await axiosInstance.get(requestUrl);
        return response.data;

    } catch (error) {
        return error.response.data;
    }
};
