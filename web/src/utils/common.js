/**
 * 通用工具函数
 */

import { extractEditorType, getContentWithoutEditorType } from "./editor";
import { formatImageLinkInArticle } from "./imageUtils";

/**
 * 等待指定秒数
 * @param {Number} second 
 * @returns {Promise}
 */
export function waitSecond(second) {
    return new Promise((resolve) => {
        setTimeout(resolve, second * 1000);
    });
}

/**
 * 四舍五入到指定小数位
 * @param {Number} number 
 * @param {int} bit 
 * @returns {Number}
 */
export function roundNumber(number, bit) {
    const factor = Math.pow(10, bit);
    return Math.round(number * factor) / factor;
}

// getProfileUrl 函数已移动到 profile.js 中，这里不再重复定义

/**
 * 将响应数据转换为文章对象
 * @param {JSON} response 
 * @returns {Promise<Array>} [article, editorType]
 */
export async function responseToArticle(response) {
    let article = {};
    article.id = response.article_detail.article_id;
    article.title = response.article_detail.article_title;
    article.summary = response.article_detail.article_summary;
    article.type = response.article_detail.article_type;
    article.tags = response.article_detail.article_tags;
    article.originLink = response.article_detail.origin_link;
    article.coverLink = response.article_detail.cover_link;
    article.content = getContentWithoutEditorType(response.article_detail.article_content);
    //check the image data  
    article.content = await formatImageLinkInArticle(article.content);
    let editorType = extractEditorType(response.article_detail.article_content);
    article.likeCount = response.article_detail.like_count;
    article.replyCount = response.article_detail.reply_count;
    article.viewCount = response.article_detail.view_count;
    article.starCount = response.article_detail.star_count;
    article.authorName = response.article_detail.author_name;
    article.authorId = response.article_detail.author_id;
    article.sourceUrl = response.article_detail.source_url;
    article.publishTime = response.article_detail.publish_time;
    article.ifLike = response.article_detail.if_like;
    article.ifStar = response.article_detail.if_star;
    article.ifTop = response.article_detail.if_top;
    article.section=response.article_detail.article_section;
    return [
        article,
        editorType,
    ]
}

