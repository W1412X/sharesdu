import { waitForLock } from "@/utils/lock";
import { getaxiosInstance } from "./axios";
import { dealAxiosError } from "@/utils/other";
import { getCookie } from "@/utils/cookie";
import { globalProperties } from "@/main";

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

        const response = await getaxiosInstance().post('/resource/upload', formData);

        return response.data;
    } catch (error) {
        let dealResult = await dealAxiosError(error);
        if (dealResult.status == 1412) {
            return await uploadResource(file, articleId);
        }
        return dealResult;
    }
};

/**
 * Download resource file for article
 * @param {number} articleId - The ID of the associated article
 * @returns 
 */
export const downloadResource = async (articleId,articleTitle) => {
    try {
        const response = await fetch(globalProperties.$apiUrl+`/resource/download?article_id=${articleId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer '+getCookie("accessToken"),
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ShareSDU资源-${articleTitle}.${blob.type.split('/')[1]}`; 
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        return { status: 200, message: 'Download successful' };
    } catch (error) {
        console.error('Failed to download resource:', error);
        return { status: error.response?.status || 500, message: error.message || 'Internal Server Error' };
    }
};




