/**
 * this document provide all the image relevent request  
 */
import { dealAxiosError } from "@/utils/other.js";
import {getaxiosInstance} from "./axios.js";
import { compressImage } from "@/utils/image.js";
import { waitForLock } from "@/utils/lock.js";
/**
 * Upload user profile image
 * @param {File} image - The image file to upload
 * @returns 
 */
export const uploadProfileImage = async (image) => {
    try {
        await waitForLock('token');
        try{
            image=await compressImage(image,'profile');
        }catch(error){
            return {
                status: -1,
                message: '图片过大无法压缩，请压缩后重试 '
            };
        }
        const data = new FormData();
        data.append('image', image);
        const response = await getaxiosInstance().post('/image/profile', data);
        return response.data;
    } catch (error) {
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
        await waitForLock('token');
        try{
            image=await compressImage(image,'other');
        }catch(error){
            return {
                status: -1,
                message: '图片过大无法压缩，请压缩后重试 '
            };
        }
        const formData = new FormData();
        formData.append('image', image);
        const response = await getaxiosInstance().post('/image/article', formData);

        return response.data;
    } catch (error) {
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
        await waitForLock('token');
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return {
                status: -1,
                message: 'User IDs must be a non-empty array'
            };
        }
        const userIdsString = userIds.join(',');
        const requestUrl = `/image/profile/time?user_ids=${userIdsString}`;
        const response = await getaxiosInstance().get(requestUrl);
        return response.data;

    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await getUserProfileImageUpdateInfo(userIds);
        }
        return dealResult;
    }
};
