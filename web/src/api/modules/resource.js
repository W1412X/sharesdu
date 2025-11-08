import { waitForLock } from "@/utils/lock";
import { dealAxiosError, getLoadMsg } from "@/utils/other";
import { getCookie } from "@/utils/cookie";
import { globalProperties } from "@/main";
import axiosInstance from "../request";

/**
 * Upload resource file for article
 * @param {File} file - The resource file to upload
 * @param {number} articleId - The ID of the associated article
 * @returns 
 */
export const uploadResource = async (file, articleId,uiFunc) => {
    try {
        await waitForLock('token');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('article_id', articleId);

        const response = await axiosInstance.post('/resource/upload', formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    const percent = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(0);
                    uiFunc(getLoadMsg("上传中...", percent));
                } else {
                    uiFunc(getLoadMsg("上传中...(未知大小)"));
                }
            },
        });

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
 * @param {string} articleTitle - Title of the article (used as default filename)
 * @param {function} uiFunc - Function to update UI with progress message
 * @returns 
 */
export const downloadResource = async (articleId, articleTitle, uiFunc) => {
    try {
        const url = globalProperties.$apiUrl + `/resource/download?article_id=${articleId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie("accessToken"),
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Step 1: 获取 Content-Type 或从 Content-Disposition 提取文件名和类型
        const contentType = response.headers.get('Content-Type') || '';
        const disposition = response.headers.get('Content-Disposition');
        let mimeType = 'application/octet-stream'; // 默认类型
        let filename = articleTitle;
        // 优先使用 Content-Type 的 MIME 类型
        if (contentType) {
            mimeType = contentType;
        }
        // 如果有 Content-Disposition，尝试提取真实文件名
        if (disposition && disposition.indexOf('filename=') !== -1) {
            const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)/i;
            const asciiFilenameRegex = /filename="?([^"]+)"?/i;

            let utf8Matches = disposition.match(utf8FilenameRegex);
            let asciiMatches = disposition.match(asciiFilenameRegex);

            if (utf8Matches && utf8Matches[1]) {
                filename = decodeURIComponent(utf8Matches[1]);
            } else if (asciiMatches && asciiMatches[1]) {
                filename = asciiMatches[1];
            }
        }
        // Step 2: 获取文件总大小用于计算进度
        const contentLength = response.headers.get('Content-Length');
        let receivedLength = 0;
        const reader = response.body.getReader();
        const chunks = [];
        //eslint-disable-next-line
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            receivedLength += value.length;

            // 更新进度
            if (contentLength) {
                const percent = ((receivedLength / parseInt(contentLength)) * 100).toFixed(0);
                uiFunc(getLoadMsg("正在下载", percent));
            } else {
                uiFunc(getLoadMsg("正在下载(未知大小)"));
            }
        }
        // Step 3: 合并 chunk 并创建 blob
        const blob = new Blob(chunks, { type: mimeType });
        // Step 4: 构造下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename; // 使用提取的真实文件名
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return { status: 200, message: 'Download successful' };
    } catch (error) {
        console.error('Failed to download resource:', error);
        return { status: 500, message: error.message || 'Internal Server Error' };
    }
};