/**
 * aritcle title
 */
export const articleTitleRestrictions = {
    title: {
        required: true,
        message: '标题不能为空',
        trigger: 'blur'
    },
    titleLength: {
        validator: judgeArticleTitle,
        message: '标题长度不能超过30个字符',
        trigger: 'blur'
    }
}
export function judgeArticleTitle(title){
    if(title.length > 30){
        return false;
    }
    if('*' in title){
        return false;
    }
    return true;
}