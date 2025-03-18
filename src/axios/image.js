/**
 * this document provide all the image relevent request  
 */
import { dealAxiosError } from "@/utils/other.js";
import {getaxiosInstance} from "./axios.js";
import { compressImage } from "@/utils/image.js";
/**
 * Upload user profile image
 * @param {File} image - The image file to upload
 * @returns 
 */
export const uploadProfileImage = async (image) => {
    try {
        try{
            image=await compressImage(image,'profile');
        }catch(error){
            console.error('Error compressing image:', error);
            return {
                status: -1,
                message: '图片过大无法压缩，请压缩后重试 '
            };
        }
        const data = new FormData();
        data.append('image', image);
        console.log('Request Data:', data);
        console.log('Request Type: POST');
        console.log('Request URL: /image/profile');
        const response = await getaxiosInstance().post('/image/profile', data);
        return response.data;
    } catch (error) {
        console.error('Error uploading article image:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await uploadProfileImage(image);
        }
        return dealResult;
    }
};

/**
* Upload image for article
* @param {File} image - The image file for the article
* @returns 
*/
export const uploadArticleImage = async (image) => {
    try {
        try{
            image=await compressImage(image,'other');
        }catch(error){
            console.error('Error compressing image:', error);
            return {
                status: -1,
                message: '图片过大无法压缩，请压缩后重试 '
            };
        }
        const formData = new FormData();
        formData.append('image', image);
        console.log('Request Type: POST');
        console.log('Request URL: /image/article');
        const response = await getaxiosInstance().post('/image/article', formData);

        return response.data;
    } catch (error) {
        console.error('Error uploading article image:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await uploadArticleImage(image);
        }
        return dealResult;
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
        console.log('Request Type: GET');
        console.log('Request URL:', requestUrl);
        const response = await getaxiosInstance().get(requestUrl);
        return response.data;

    } catch (error) {
        console.error('Error fetching user profile image update information:', error);
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getUserProfileImageUpdateInfo(userIds);
        }
        return dealResult;
    }
};
