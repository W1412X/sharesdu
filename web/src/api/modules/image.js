/**
 * this document provide all the image relevent request  
 */
import { dealAxiosError } from "@/utils/other.js";
import { waitForLock } from "@/utils/lock.js";
import axiosInstance from "../request";
/**
 * Upload user profile image
 * @param {File|Blob} image - The image file to upload
 * @returns 
 */
export const uploadProfileImage = async (image) => {
    try {
        await waitForLock('token');
        const data = new FormData();
        // 如果是 Blob，转换为 File 对象以保留文件名和类型信息
        let fileToUpload = image;
        if (image instanceof Blob && !(image instanceof File)) {
            // 从 MIME 类型推断文件扩展名
            const mimeType = image.type || 'image/jpeg';
            // MIME 类型到扩展名的映射
            const mimeToExt = {
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/png': 'png',
                'image/gif': 'gif',
                'image/webp': 'webp',
            };
            const ext = mimeToExt[mimeType] || mimeType.split('/')[1] || 'jpg';
            const fileName = `image.${ext}`;
            fileToUpload = new File([image], fileName, { type: mimeType });
        }
        data.append('image', fileToUpload);
        const response = await axiosInstance.post('/image/profile', data);
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
* @param {File|Blob} image - The image file for the article
* @returns 
*/
export const uploadArticleImage = async (image) => {
    try {
        await waitForLock('token');
        const formData = new FormData();
        // 如果是 Blob，转换为 File 对象以保留文件名和类型信息
        let fileToUpload = image;
        if (image instanceof Blob && !(image instanceof File)) {
            // 从 MIME 类型推断文件扩展名
            const mimeType = image.type || 'image/jpeg';
            // MIME 类型到扩展名的映射
            const mimeToExt = {
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/png': 'png',
                'image/gif': 'gif',
                'image/webp': 'webp',
            };
            const ext = mimeToExt[mimeType] || mimeType.split('/')[1] || 'jpg';
            const fileName = `image.${ext}`;
            fileToUpload = new File([image], fileName, { type: mimeType });
        }
        formData.append('image', fileToUpload);
        const response = await axiosInstance.post('/image/article', formData);

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
        const response = await axiosInstance.get(requestUrl);
        return response.data;

    } catch (error) {
        return error.response.data;
    }
};
