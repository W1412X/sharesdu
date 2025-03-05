/**
 * this document provide all the image relevent request  
 */
import {getAxios} from "./axios.js";
import { getNetworkErrorResponse } from "./statusCodeMessages";

/**
 * Upload user profile image
 * @param {File} image - The image file to upload
 * @returns 
 */
export const uploadProfileImage = async (image) => {
    try {
        const formData = new FormData();
        formData.append('image', image);

        console.log('Request Type: POST');
        console.log('Request URL: /image/profile');

        const response = await getAxios().post('/image/profile', formData);

        return response.data;
    } catch (error) {
        console.error('Error uploading profile image:', error);
        return getNetworkErrorResponse();
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

        console.log('Request Type: POST');
        console.log('Request URL: /image/article');

        const response = await getAxios().post('/image/article', formData);

        return response.data;
    } catch (error) {
        console.error('Error uploading article image:', error);
        return getNetworkErrorResponse();
    }
};
