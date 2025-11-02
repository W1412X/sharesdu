import { coursePosterHtml } from "@/utils/templates/poster";
import html2canvas from 'html2canvas';
import { getCurrentFormattedTime } from "./other";
/**
 * 将 HTML 字符串转换为图片，并返回 Blob URL
 * @param {string} htmlString 
 * @param {Object} options 
 * @returns {Promise<string>} 
 */
async function htmlToBlobURL(htmlString, width,height,options = {}) {
    try {
        const container = document.createElement('div');
        container.innerHTML = htmlString;
        Object.assign(container.style, {
            width:width,
            height:height,
            padding:'0px',
            margin:'0px'
        });
        document.body.appendChild(container);
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            ...options
        });
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png', 1.0);
        });
        const blobURL = URL.createObjectURL(blob);
        document.body.removeChild(container);
        return blobURL;
    } catch (error) {
        console.error('生成图片失败:', error);
        throw error;
    }
}
const QrBaseUrl="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=";
/**
 * 
 * @param {*} courseData 
 * @returns 
 */
export async function generateCoursePosterImage(courseData) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(coursePosterHtml, 'text/html');
    let {
        title = '未知课程',
        type = '未知类型',
        teacher = '未知教师',
        rating = 0,
        ratingCount = 0,
        url="https://sharesdu.com",
        logoUrl = 'https://sharesdu.com/resource/logo_trans.png',
        time="2025-09-01 00:00:00"  
    } = courseData;
    time=getCurrentFormattedTime();
    url=encodeURIComponent(url);
    let qrCodeUrl=QrBaseUrl+url;
    const titleEl = doc.getElementById('course-title');
    if (titleEl) titleEl.textContent = title;

    const typeEl = doc.getElementById('course-type');
    if (typeEl) {
        typeEl.innerHTML = `<strong>课程类型:</strong> ${type}`;
    }

    const teacherEl = doc.getElementById('course-teacher');
    if (teacherEl) {
        teacherEl.innerHTML = `<strong>授课教师:</strong> ${teacher}`;
    }

    const ratingEl = doc.getElementById('course-rating');
    if (ratingEl) {
        const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
        ratingEl.innerHTML = `<strong>课程评分:</strong> <span style="color: #ffa41c;">${stars}</span> ${rating.toFixed(1)} (评分人数: <span id="rating-count">${ratingCount}</span>)`;
    }
    const timeEl = doc.getElementById('share-time');
    if (timeEl) {
        timeEl.innerText=time;
    }
    const qrCodeEl = doc.getElementById('qr-code');
    if (qrCodeEl) {
        qrCodeEl.src = qrCodeUrl;
    }
    const logoEl = doc.getElementById('logo');
    if (logoEl) {
        logoEl.src = logoUrl;
    }
    const posterDiv = doc.body.children[0];
    let blobUrl=await htmlToBlobURL(posterDiv.outerHTML,'290px','160px');
    return blobUrl;
}