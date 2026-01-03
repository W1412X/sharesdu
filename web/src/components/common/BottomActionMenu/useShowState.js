/**
 * 对于帖子、文章、课程等详情页，提供更多操作的弹窗
 */
import { getCookie } from '@/utils/cookie';
const useOptionShowSheet = (type,authorId=undefined) => {
    let ifMaster=getCookie("ifMaster");
    let ifAuthor=getCookie("userId")==authorId;
    let sheetOptions=[];
    if(type === 'course') {
        sheetOptions.push({
            icon: 'mdi-alert',
            text: '举报课程',
            type: 'course-alert',
        });
        sheetOptions.push({
            icon: 'mdi-pencil',
            text: '提交修改',
            type: 'course-edit',
        });
        sheetOptions.push({
            icon: 'mdi-link-variant',
            text: '复制课程链接',
            type: 'course-share',
        });
        if(ifMaster){
            sheetOptions.push({
                icon: 'mdi-shield-edit-outline',
                text: '管理课程',
                type: 'course-manage',
            });
        }
    }else if(type === 'article') {
        if(!ifAuthor){
            sheetOptions.push({
                icon: 'mdi-alert',
                text: '举报文章',
                type: 'article-alert',
            });
        }
        sheetOptions.push({
            icon: 'mdi-link-variant',
            text: '复制文章链接',
            type: 'article-share',
        });
        if(ifMaster){
            sheetOptions.push({
                icon: 'mdi-shield-edit-outline',
                text: '管理文章',
                type: 'article-manage',
            });
        }
        if(ifAuthor){
            sheetOptions.push({
                icon: 'mdi-pencil',
                text: '编辑文章',
                type: 'article-edit',
            });
            sheetOptions.push({
                icon: 'mdi-delete',
                text: '删除文章',
                type: 'article-delete',
            });
        }
    }else if(type === 'post') {
        if(!ifAuthor){
            sheetOptions.push({
                icon: 'mdi-alert',
                text: '举报帖子',
                type: 'post-alert',
            });
        }
        sheetOptions.push({
            icon: 'mdi-link-variant',
            text: '复制帖子链接',
            type: 'post-share',
        });
        if(ifAuthor){
            sheetOptions.push({
                icon: 'mdi-delete',
                text: '删除帖子',
                type: 'post-delete',
            });
    }
    }
    else if(type === 'section') {
        sheetOptions.push({
            icon: 'mdi-link-variant',
            text: '复制板块链接',
            type: 'section-share',
        });
        if(ifAuthor){
            sheetOptions.push({
                icon: 'mdi-pencil',
                text: '编辑板块',
                type: 'section-edit',
            });
            sheetOptions.push({
                icon: 'mdi-delete',
                text: '删除板块',
                type: 'section-delete',
            });
        }
        if(!ifAuthor){
            sheetOptions.push({
                icon: 'mdi-alert',
                text: '举报板块',
                type: 'section-alert',
            });
        }
    }
    return sheetOptions;
}
export default useOptionShowSheet;