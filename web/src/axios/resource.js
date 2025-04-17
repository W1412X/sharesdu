import { waitForLock } from "@/utils/lock";
import { getaxiosInstance } from "./axios";
import { dealAxiosError } from "@/utils/other";

/**
 * Upload resource file for article
 * @param {File} file - The resource file to upload
 * @param {number} articleId - The ID of the associated article
 * @returns 
 */
export const uploadResource = async (file, articleId) => {
    try {
        await waitForLock('token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('article_id', articleId);

        const response = await getaxiosInstance().post('/resource/upload/', formData);

        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await uploadResource(file, articleId);
        }
        return dealResult;
    }
};
